import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../components/Web3Provider';

// ABI for DocumentationRegistry contract
const DOCUMENTATION_REGISTRY_ABI = [
  'function registerDocumentation(string title, string ipfsHash, string[] tags, bool isPublic) returns (bytes32)',
  'function updateDocumentation(bytes32 docId, string newIpfsHash, string[] newTags)',
  'function rateDocumentation(bytes32 docId, uint256 rating)',
  'function viewDocumentation(bytes32 docId)',
  'function getDocumentation(bytes32 docId) view returns (tuple(address author, string title, string ipfsHash, uint256 timestamp, uint256 version, string[] tags, bool isPublic, uint256 qualityScore, uint256 viewCount, uint256 averageRating, uint256 totalRatings))',
  'function getAuthorDocs(address author) view returns (bytes32[])',
  'function getDocsByTag(string tag) view returns (bytes32[])',
  'function getAllDocs() view returns (bytes32[])',
  'function getDocumentationCount() view returns (uint256)',
  'event DocumentationRegistered(bytes32 indexed docId, address indexed author, string title)',
  'event DocumentationUpdated(bytes32 indexed docId, uint256 version)',
  'event DocumentationRated(bytes32 indexed docId, address indexed rater, uint256 rating)',
  'event DocumentationViewed(bytes32 indexed docId, address indexed viewer)',
];

interface Documentation {
  author: string;
  title: string;
  ipfsHash: string;
  timestamp: number;
  version: number;
  tags: string[];
  isPublic: boolean;
  qualityScore: number;
  viewCount: number;
  averageRating: number;
  totalRatings: number;
}

interface UseDocumentationContractReturn {
  contract: ethers.Contract | null;
  isLoading: boolean;
  error: string | null;
  totalDocs: number;
  registerDocumentation: (title: string, ipfsHash: string, tags: string[], isPublic: boolean) => Promise<string | null>;
  updateDocumentation: (docId: string, newIpfsHash: string, newTags: string[]) => Promise<ethers.ContractTransaction | null>;
  rateDocumentation: (docId: string, rating: number) => Promise<ethers.ContractTransaction | null>;
  viewDocumentation: (docId: string) => Promise<ethers.ContractTransaction | null>;
  getDocumentation: (docId: string) => Promise<Documentation | null>;
  getAuthorDocs: (author: string) => Promise<string[]>;
  getDocsByTag: (tag: string) => Promise<string[]>;
  getAllDocs: () => Promise<string[]>;
  refreshData: () => Promise<void>;
}

export const useDocumentationContract = (contractAddress?: string): UseDocumentationContractReturn => {
  const { provider, signer, account, isConnected } = useWeb3();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalDocs, setTotalDocs] = useState<number>(0);

  // Initialize contract
  useEffect(() => {
    if (!provider || !contractAddress) {
      setContract(null);
      return;
    }

    try {
      const docContract = new ethers.Contract(
        contractAddress,
        DOCUMENTATION_REGISTRY_ABI,
        signer || provider
      );
      setContract(docContract);
      setError(null);
    } catch (err) {
      console.error('Failed to initialize DocumentationRegistry contract:', err);
      setError('Failed to initialize contract');
      setContract(null);
    }
  }, [provider, signer, contractAddress]);

  // Refresh data
  const refreshData = useCallback(async () => {
    if (!contract) {
      setTotalDocs(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const count = await contract.getDocumentationCount();
      setTotalDocs(count.toNumber());
    } catch (err: any) {
      console.error('Failed to fetch documentation data:', err);
      setError(err.message || 'Failed to fetch documentation data');
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  // Auto-refresh data when contract changes
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Register new documentation
  const registerDocumentation = useCallback(async (
    title: string,
    ipfsHash: string,
    tags: string[],
    isPublic: boolean
  ): Promise<string | null> => {
    if (!contract || !signer) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setError(null);
      setIsLoading(true);
      
      const tx = await contract.registerDocumentation(title, ipfsHash, tags, isPublic);
      const receipt = await tx.wait();
      
      // Extract docId from the event logs
      const event = receipt.events?.find((e: any) => e.event === 'DocumentationRegistered');
      const docId = event?.args?.docId;
      
      await refreshData();
      return docId || null;
    } catch (err: any) {
      console.error('Documentation registration failed:', err);
      setError(err.message || 'Documentation registration failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contract, signer, refreshData]);

  // Update documentation
  const updateDocumentation = useCallback(async (
    docId: string,
    newIpfsHash: string,
    newTags: string[]
  ): Promise<ethers.ContractTransaction | null> => {
    if (!contract || !signer) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setError(null);
      setIsLoading(true);
      
      const tx = await contract.updateDocumentation(docId, newIpfsHash, newTags);
      await tx.wait();
      await refreshData();
      return tx;
    } catch (err: any) {
      console.error('Documentation update failed:', err);
      setError(err.message || 'Documentation update failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contract, signer, refreshData]);

  // Rate documentation
  const rateDocumentation = useCallback(async (
    docId: string,
    rating: number
  ): Promise<ethers.ContractTransaction | null> => {
    if (!contract || !signer) {
      setError('Wallet not connected');
      return null;
    }

    if (rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5');
      return null;
    }

    try {
      setError(null);
      setIsLoading(true);
      
      const tx = await contract.rateDocumentation(docId, rating);
      await tx.wait();
      return tx;
    } catch (err: any) {
      console.error('Documentation rating failed:', err);
      setError(err.message || 'Documentation rating failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contract, signer]);

  // View documentation (increments view count)
  const viewDocumentation = useCallback(async (docId: string): Promise<ethers.ContractTransaction | null> => {
    if (!contract || !signer) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setError(null);
      const tx = await contract.viewDocumentation(docId);
      await tx.wait();
      return tx;
    } catch (err: any) {
      console.error('Documentation view failed:', err);
      setError(err.message || 'Documentation view failed');
      return null;
    }
  }, [contract, signer]);

  // Get documentation details
  const getDocumentation = useCallback(async (docId: string): Promise<Documentation | null> => {
    if (!contract) {
      setError('Contract not initialized');
      return null;
    }

    try {
      setError(null);
      const result = await contract.getDocumentation(docId);
      
      return {
        author: result.author,
        title: result.title,
        ipfsHash: result.ipfsHash,
        timestamp: result.timestamp.toNumber(),
        version: result.version.toNumber(),
        tags: result.tags,
        isPublic: result.isPublic,
        qualityScore: result.qualityScore.toNumber(),
        viewCount: result.viewCount.toNumber(),
        averageRating: result.averageRating.toNumber(),
        totalRatings: result.totalRatings.toNumber(),
      };
    } catch (err: any) {
      console.error('Failed to get documentation:', err);
      setError(err.message || 'Failed to get documentation');
      return null;
    }
  }, [contract]);

  // Get author's documents
  const getAuthorDocs = useCallback(async (author: string): Promise<string[]> => {
    if (!contract) {
      setError('Contract not initialized');
      return [];
    }

    try {
      setError(null);
      const docs = await contract.getAuthorDocs(author);
      return docs;
    } catch (err: any) {
      console.error('Failed to get author docs:', err);
      setError(err.message || 'Failed to get author docs');
      return [];
    }
  }, [contract]);

  // Get documents by tag
  const getDocsByTag = useCallback(async (tag: string): Promise<string[]> => {
    if (!contract) {
      setError('Contract not initialized');
      return [];
    }

    try {
      setError(null);
      const docs = await contract.getDocsByTag(tag);
      return docs;
    } catch (err: any) {
      console.error('Failed to get docs by tag:', err);
      setError(err.message || 'Failed to get docs by tag');
      return [];
    }
  }, [contract]);

  // Get all documents
  const getAllDocs = useCallback(async (): Promise<string[]> => {
    if (!contract) {
      setError('Contract not initialized');
      return [];
    }

    try {
      setError(null);
      const docs = await contract.getAllDocs();
      return docs;
    } catch (err: any) {
      console.error('Failed to get all docs:', err);
      setError(err.message || 'Failed to get all docs');
      return [];
    }
  }, [contract]);

  // Set up event listeners
  useEffect(() => {
    if (!contract) return;

    const handleDocumentationRegistered = (docId: string, author: string, title: string) => {
      console.log('Documentation registered:', { docId, author, title });
      refreshData();
    };

    const handleDocumentationUpdated = (docId: string, version: ethers.BigNumber) => {
      console.log('Documentation updated:', { docId, version: version.toNumber() });
    };

    const handleDocumentationRated = (docId: string, rater: string, rating: ethers.BigNumber) => {
      console.log('Documentation rated:', { docId, rater, rating: rating.toNumber() });
    };

    const handleDocumentationViewed = (docId: string, viewer: string) => {
      console.log('Documentation viewed:', { docId, viewer });
    };

    contract.on('DocumentationRegistered', handleDocumentationRegistered);
    contract.on('DocumentationUpdated', handleDocumentationUpdated);
    contract.on('DocumentationRated', handleDocumentationRated);
    contract.on('DocumentationViewed', handleDocumentationViewed);

    return () => {
      contract.off('DocumentationRegistered', handleDocumentationRegistered);
      contract.off('DocumentationUpdated', handleDocumentationUpdated);
      contract.off('DocumentationRated', handleDocumentationRated);
      contract.off('DocumentationViewed', handleDocumentationViewed);
    };
  }, [contract, refreshData]);

  return {
    contract,
    isLoading,
    error,
    totalDocs,
    registerDocumentation,
    updateDocumentation,
    rateDocumentation,
    viewDocumentation,
    getDocumentation,
    getAuthorDocs,
    getDocsByTag,
    getAllDocs,
    refreshData,
  };
};