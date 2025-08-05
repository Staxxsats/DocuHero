// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract DocuToken is ERC20, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 100000000 * 10**18; // 100M tokens
    uint256 public rewardRate = 100; // Base reward rate
    
    mapping(address => uint256) public lastRewardClaim;
    mapping(address => uint256) public documentationCount;
    mapping(address => bool) public verifiedProviders;
    
    event RewardClaimed(address indexed user, uint256 amount);
    event DocumentationRewarded(address indexed user, uint256 count);
    event ProviderVerified(address indexed provider);
    event RewardRateUpdated(uint256 newRate);
    
    constructor() ERC20("DocuHero Token", "DOCU") {
        _mint(msg.sender, 10000000 * 10**decimals()); // Initial 10M tokens
    }
    
    function rewardDocumentation(address user, uint256 quality) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(quality > 0 && quality <= 100, "Quality must be 1-100");
        
        uint256 baseReward = rewardRate * 10**decimals();
        uint256 qualityMultiplier = quality;
        uint256 reward = (baseReward * qualityMultiplier) / 100;
        
        if (verifiedProviders[user]) {
            reward = (reward * 150) / 100; // 50% bonus for verified providers
        }
        
        require(totalSupply() + reward <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(user, reward);
        documentationCount[user]++;
        
        emit DocumentationRewarded(user, documentationCount[user]);
        emit RewardClaimed(user, reward);
    }
    
    function claimDailyReward() external {
        require(
            block.timestamp >= lastRewardClaim[msg.sender] + 1 days,
            "Daily reward already claimed"
        );
        
        uint256 baseDaily = 10 * 10**decimals(); // 10 DOCU base daily
        uint256 bonus = (documentationCount[msg.sender] * 10**decimals()) / 100; // 0.01 DOCU per doc
        uint256 totalReward = baseDaily + bonus;
        
        if (verifiedProviders[msg.sender]) {
            totalReward = (totalReward * 120) / 100; // 20% bonus for verified
        }
        
        require(totalSupply() + totalReward <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(msg.sender, totalReward);
        lastRewardClaim[msg.sender] = block.timestamp;
        
        emit RewardClaimed(msg.sender, totalReward);
    }
    
    function verifyProvider(address provider) external onlyOwner {
        verifiedProviders[provider] = true;
        emit ProviderVerified(provider);
    }
    
    function setRewardRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Rate must be positive");
        rewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }
    
    function burnTokens(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    function getUserStats(address user) 
        external 
        view 
        returns (
            uint256 balance,
            uint256 docCount,
            bool isVerified,
            uint256 lastClaim,
            uint256 nextClaimTime
        ) 
    {
        return (
            balanceOf(user),
            documentationCount[user],
            verifiedProviders[user],
            lastRewardClaim[user],
            lastRewardClaim[user] + 1 days
        );
    }
}