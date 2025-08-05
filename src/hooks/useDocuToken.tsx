import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../components/Web3Provider';

// ABI for DocuToken contract - minimal interface for the functions we need
const DOCU_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function rewardDocumentation(address user, uint256 quality)',
  'function claimDailyReward()',
  'function getUserStats(address user) view returns (uint256 balance, uint256 docCount, bool isVerified, uint256 lastClaim, uint256 nextClaimTime)',
  'function verifyProvider(address provider)',
  'function burnTokens(uint256 amount)',
  'function documentationCount(address user) view returns (uint256)',
  'function verifiedProviders(address user) view returns (bool)',
  'function lastRewardClaim(address user) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event RewardClaimed(address indexed user, uint256 amount)',
  'event DocumentationRewarded(address indexed user, uint256 count)',
];

interface UserStats {
  balance: string;
  docCount: number;
  isVerified: boolean;
  lastClaim: number;
  nextClaimTime: number;
}

interface UseDocuTokenReturn {
  contract: ethers.Contract | null;
  balance: string;
  totalSupply: string;
  userStats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  transfer: (to: string, amount: string) => Promise<ethers.ContractTransaction | null>;
  claimDailyReward: () => Promise<ethers.ContractTransaction | null>;
  burnTokens: (amount: string) => Promise<ethers.ContractTransaction | null>;
  refreshData: () => Promise<void>;
  canClaimDaily: boolean;
}

export const useDocuToken = (contractAddress?: string): UseDocuTokenReturn => {
  const { provider, signer, account, isConnected } = useWeb3();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [totalSupply, setTotalSupply] = useState<string>('0');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract
  useEffect(() => {
    if (!provider || !contractAddress) {
      setContract(null);
      return;
    }

    try {
      const tokenContract = new ethers.Contract(
        contractAddress,
        DOCU_TOKEN_ABI,
        signer || provider
      );
      setContract(tokenContract);
      setError(null);
    } catch (err) {
      console.error('Failed to initialize DocuToken contract:', err);
      setError('Failed to initialize contract');
      setContract(null);
    }
  }, [provider, signer, contractAddress]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!contract || !account || !isConnected) {
      setBalance('0');
      setTotalSupply('0');
      setUserStats(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get balance, total supply, and user stats in parallel
      const [userBalance, supply, stats] = await Promise.all([
        contract.balanceOf(account),
        contract.totalSupply(),
        contract.getUserStats(account),
      ]);

      setBalance(ethers.utils.formatEther(userBalance));
      setTotalSupply(ethers.utils.formatEther(supply));
      
      setUserStats({
        balance: ethers.utils.formatEther(stats.balance),
        docCount: stats.docCount.toNumber(),
        isVerified: stats.isVerified,
        lastClaim: stats.lastClaim.toNumber(),
        nextClaimTime: stats.nextClaimTime.toNumber(),
      });
    } catch (err: any) {
      console.error('Failed to fetch DocuToken data:', err);
      setError(err.message || 'Failed to fetch token data');
    } finally {
      setIsLoading(false);
    }
  }, [contract, account, isConnected]);

  // Auto-refresh data when dependencies change
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Transfer tokens
  const transfer = useCallback(async (to: string, amount: string): Promise<ethers.ContractTransaction | null> => {
    if (!contract || !signer) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setError(null);
      const tx = await contract.transfer(to, ethers.utils.parseEther(amount));
      await tx.wait();
      await refreshData(); // Refresh balance after transfer
      return tx;
    } catch (err: any) {
      console.error('Transfer failed:', err);
      setError(err.message || 'Transfer failed');
      return null;
    }
  }, [contract, signer, refreshData]);

  // Claim daily reward
  const claimDailyReward = useCallback(async (): Promise<ethers.ContractTransaction | null> => {
    if (!contract || !signer) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setError(null);
      const tx = await contract.claimDailyReward();
      await tx.wait();
      await refreshData(); // Refresh data after claiming
      return tx;
    } catch (err: any) {
      console.error('Daily reward claim failed:', err);
      setError(err.message || 'Daily reward claim failed');
      return null;
    }
  }, [contract, signer, refreshData]);

  // Burn tokens
  const burnTokens = useCallback(async (amount: string): Promise<ethers.ContractTransaction | null> => {
    if (!contract || !signer) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setError(null);
      const tx = await contract.burnTokens(ethers.utils.parseEther(amount));
      await tx.wait();
      await refreshData(); // Refresh balance after burning
      return tx;
    } catch (err: any) {
      console.error('Token burn failed:', err);
      setError(err.message || 'Token burn failed');
      return null;
    }
  }, [contract, signer, refreshData]);

  // Check if user can claim daily reward
  const canClaimDaily = userStats ? Date.now() / 1000 >= userStats.nextClaimTime : false;

  // Set up event listeners
  useEffect(() => {
    if (!contract || !account) return;

    const handleTransfer = (from: string, to: string, value: ethers.BigNumber) => {
      if (from === account || to === account) {
        refreshData();
      }
    };

    const handleRewardClaimed = (user: string, amount: ethers.BigNumber) => {
      if (user === account) {
        refreshData();
      }
    };

    const handleDocumentationRewarded = (user: string, count: ethers.BigNumber) => {
      if (user === account) {
        refreshData();
      }
    };

    contract.on('Transfer', handleTransfer);
    contract.on('RewardClaimed', handleRewardClaimed);
    contract.on('DocumentationRewarded', handleDocumentationRewarded);

    return () => {
      contract.off('Transfer', handleTransfer);
      contract.off('RewardClaimed', handleRewardClaimed);
      contract.off('DocumentationRewarded', handleDocumentationRewarded);
    };
  }, [contract, account, refreshData]);

  return {
    contract,
    balance,
    totalSupply,
    userStats,
    isLoading,
    error,
    transfer,
    claimDailyReward,
    burnTokens,
    refreshData,
    canClaimDaily,
  };
};