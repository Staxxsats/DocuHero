// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DocumentationRegistry is Ownable, ReentrancyGuard {
    struct Documentation {
        address author;
        string title;
        string ipfsHash;
        uint256 timestamp;
        uint256 version;
        string[] tags;
        bool isPublic;
        uint256 qualityScore;
        uint256 viewCount;
        mapping(address => bool) hasRated;
        uint256 totalRatings;
        uint256 ratingSum;
    }
    
    struct DocumentationView {
        address author;
        string title;
        string ipfsHash;
        uint256 timestamp;
        uint256 version;
        string[] tags;
        bool isPublic;
        uint256 qualityScore;
        uint256 viewCount;
        uint256 averageRating;
        uint256 totalRatings;
    }
    
    mapping(bytes32 => Documentation) public documentation;
    mapping(address => bytes32[]) public authorDocs;
    mapping(string => bytes32[]) public taggedDocs;
    bytes32[] public allDocs;
    
    event DocumentationRegistered(bytes32 indexed docId, address indexed author, string title);
    event DocumentationUpdated(bytes32 indexed docId, uint256 version);
    event DocumentationRated(bytes32 indexed docId, address indexed rater, uint256 rating);
    event DocumentationViewed(bytes32 indexed docId, address indexed viewer);
    
    function registerDocumentation(
        string memory title,
        string memory ipfsHash,
        string[] memory tags,
        bool isPublic
    ) external returns (bytes32) {
        bytes32 docId = keccak256(abi.encodePacked(msg.sender, title, block.timestamp));
        
        Documentation storage doc = documentation[docId];
        doc.author = msg.sender;
        doc.title = title;
        doc.ipfsHash = ipfsHash;
        doc.timestamp = block.timestamp;
        doc.version = 1;
        doc.tags = tags;
        doc.isPublic = isPublic;
        doc.qualityScore = 50; // Initial quality score
        
        authorDocs[msg.sender].push(docId);
        allDocs.push(docId);
        
        // Add to tagged docs
        for (uint i = 0; i < tags.length; i++) {
            taggedDocs[tags[i]].push(docId);
        }
        
        emit DocumentationRegistered(docId, msg.sender, title);
        return docId;
    }
    
    function updateDocumentation(
        bytes32 docId,
        string memory newIpfsHash,
        string[] memory newTags
    ) external {
        require(documentation[docId].author == msg.sender, "Not the author");
        
        Documentation storage doc = documentation[docId];
        doc.ipfsHash = newIpfsHash;
        doc.version++;
        
        // Update tags
        doc.tags = newTags;
        for (uint i = 0; i < newTags.length; i++) {
            taggedDocs[newTags[i]].push(docId);
        }
        
        emit DocumentationUpdated(docId, doc.version);
    }
    
    function rateDocumentation(bytes32 docId, uint256 rating) external {
        require(rating >= 1 && rating <= 5, "Rating must be 1-5");
        require(!documentation[docId].hasRated[msg.sender], "Already rated");
        require(documentation[docId].author != address(0), "Documentation does not exist");
        
        Documentation storage doc = documentation[docId];
        doc.hasRated[msg.sender] = true;
        doc.totalRatings++;
        doc.ratingSum += rating;
        
        // Update quality score based on average rating
        doc.qualityScore = (doc.ratingSum * 20) / doc.totalRatings; // Scale to 0-100
        
        emit DocumentationRated(docId, msg.sender, rating);
    }
    
    function viewDocumentation(bytes32 docId) external {
        require(documentation[docId].author != address(0), "Documentation does not exist");
        require(
            documentation[docId].isPublic || documentation[docId].author == msg.sender,
            "Not authorized to view"
        );
        
        documentation[docId].viewCount++;
        emit DocumentationViewed(docId, msg.sender);
    }
    
    function getDocumentation(bytes32 docId) 
        external 
        view 
        returns (DocumentationView memory) 
    {
        require(documentation[docId].author != address(0), "Documentation does not exist");
        
        Documentation storage doc = documentation[docId];
        uint256 avgRating = doc.totalRatings > 0 ? doc.ratingSum / doc.totalRatings : 0;
        
        return DocumentationView({
            author: doc.author,
            title: doc.title,
            ipfsHash: doc.ipfsHash,
            timestamp: doc.timestamp,
            version: doc.version,
            tags: doc.tags,
            isPublic: doc.isPublic,
            qualityScore: doc.qualityScore,
            viewCount: doc.viewCount,
            averageRating: avgRating,
            totalRatings: doc.totalRatings
        });
    }
    
    function getAuthorDocs(address author) external view returns (bytes32[] memory) {
        return authorDocs[author];
    }
    
    function getDocsByTag(string memory tag) external view returns (bytes32[] memory) {
        return taggedDocs[tag];
    }
    
    function getAllDocs() external view returns (bytes32[] memory) {
        return allDocs;
    }
    
    function getDocumentationCount() external view returns (uint256) {
        return allDocs.length;
    }
}