// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./DocuToken.sol";
import "./DocumentationRegistry.sol";

contract TokenizedIncentives is Ownable, ReentrancyGuard {
    DocuToken public docuToken;
    DocumentationRegistry public docRegistry;
    
    struct IncentivePool {
        uint256 totalRewards;
        uint256 claimedRewards;
        uint256 startTime;
        uint256 endTime;
        string description;
        bool active;
    }
    
    struct UserIncentive {
        uint256 earned;
        uint256 claimed;
        uint256 lastClaimTime;
        uint256 streak;
    }
    
    mapping(bytes32 => IncentivePool) public incentivePools;
    mapping(address => UserIncentive) public userIncentives;
    mapping(address => mapping(bytes32 => bool)) public hasClaimedFromPool;
    
    bytes32[] public activePools;
    uint256 public streakBonus = 10; // 10% bonus per day streak
    uint256 public maxStreakDays = 30;
    
    event IncentivePoolCreated(bytes32 indexed poolId, uint256 totalRewards);
    event RewardClaimed(address indexed user, uint256 amount, bytes32 poolId);
    event StreakBonusEarned(address indexed user, uint256 streak, uint256 bonus);
    event QualityBonusEarned(address indexed user, uint256 qualityScore, uint256 bonus);
    
    constructor(address _docuToken, address _docRegistry) {
        docuToken = DocuToken(_docuToken);
        docRegistry = DocumentationRegistry(_docRegistry);
    }
    
    function createIncentivePool(
        bytes32 poolId,
        uint256 totalRewards,
        uint256 duration,
        string memory description
    ) external onlyOwner {
        require(incentivePools[poolId].totalRewards == 0, "Pool already exists");
        
        incentivePools[poolId] = IncentivePool({
            totalRewards: totalRewards,
            claimedRewards: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            description: description,
            active: true
        });
        
        activePools.push(poolId);
        emit IncentivePoolCreated(poolId, totalRewards);
    }
    
    function claimDocumentationReward(bytes32 docId) external nonReentrant {
        require(docRegistry.getDocumentation(docId).author == msg.sender, "Not the author");
        
        uint256 qualityScore = docRegistry.getDocumentation(docId).qualityScore;
        uint256 baseReward = calculateBaseReward(qualityScore);
        uint256 streakMultiplier = calculateStreakBonus();
        uint256 totalReward = (baseReward * streakMultiplier) / 100;
        
        // Update user incentive data
        UserIncentive storage user = userIncentives[msg.sender];
        user.earned += totalReward;
        
        // Update streak
        if (block.timestamp <= user.lastClaimTime + 2 days) {
            user.streak++;
            if (user.streak > maxStreakDays) {
                user.streak = maxStreakDays;
            }
        } else {
            user.streak = 1;
        }
        user.lastClaimTime = block.timestamp;
        
        // Mint tokens
        docuToken.rewardDocumentation(msg.sender, qualityScore);
        
        emit RewardClaimed(msg.sender, totalReward, bytes32(0));
        if (user.streak > 1) {
            emit StreakBonusEarned(msg.sender, user.streak, streakMultiplier - 100);
        }
        emit QualityBonusEarned(msg.sender, qualityScore, baseReward);
    }
    
    function claimFromPool(bytes32 poolId) external nonReentrant {
        require(incentivePools[poolId].active, "Pool not active");
        require(block.timestamp <= incentivePools[poolId].endTime, "Pool expired");
        require(!hasClaimedFromPool[msg.sender][poolId], "Already claimed from pool");
        
        IncentivePool storage pool = incentivePools[poolId];
        require(pool.claimedRewards < pool.totalRewards, "Pool exhausted");
        
        uint256 userDocs = docRegistry.getAuthorDocs(msg.sender).length;
        require(userDocs > 0, "No documentation to claim reward");
        
        uint256 reward = (pool.totalRewards * 10) / 100; // 10% of pool per user max
        if (pool.claimedRewards + reward > pool.totalRewards) {
            reward = pool.totalRewards - pool.claimedRewards;
        }
        
        pool.claimedRewards += reward;
        hasClaimedFromPool[msg.sender][poolId] = true;
        userIncentives[msg.sender].earned += reward;
        
        docuToken.transfer(msg.sender, reward);
        
        emit RewardClaimed(msg.sender, reward, poolId);
    }
    
    function calculateBaseReward(uint256 qualityScore) public pure returns (uint256) {
        // Base reward scaled by quality (50-100 quality = 50-100 tokens)
        return qualityScore * 10**18;
    }
    
    function calculateStreakBonus() public view returns (uint256) {
        uint256 streak = userIncentives[msg.sender].streak;
        if (streak <= 1) return 100; // No bonus
        
        uint256 bonus = 100 + (streak * streakBonus);
        uint256 maxBonus = 100 + (maxStreakDays * streakBonus);
        return bonus > maxBonus ? maxBonus : bonus;
    }
    
    function deactivatePool(bytes32 poolId) external onlyOwner {
        incentivePools[poolId].active = false;
    }
    
    function setStreakBonus(uint256 newBonus) external onlyOwner {
        streakBonus = newBonus;
    }
    
    function setMaxStreakDays(uint256 newMax) external onlyOwner {
        maxStreakDays = newMax;
    }
    
    function getUserStats(address user) 
        external 
        view 
        returns (
            uint256 earned,
            uint256 claimed,
            uint256 streak,
            uint256 nextStreakBonus,
            uint256 documentCount
        ) 
    {
        UserIncentive memory incentive = userIncentives[user];
        return (
            incentive.earned,
            incentive.claimed,
            incentive.streak,
            calculateStreakBonus(),
            docRegistry.getAuthorDocs(user).length
        );
    }
    
    function getActivePools() external view returns (bytes32[] memory) {
        return activePools;
    }
    
    function getPoolInfo(bytes32 poolId) 
        external 
        view 
        returns (
            uint256 totalRewards,
            uint256 claimedRewards,
            uint256 startTime,
            uint256 endTime,
            string memory description,
            bool active
        ) 
    {
        IncentivePool memory pool = incentivePools[poolId];
        return (
            pool.totalRewards,
            pool.claimedRewards,
            pool.startTime,
            pool.endTime,
            pool.description,
            pool.active
        );
    }
}