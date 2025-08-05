// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract ClientToken is ERC20, Ownable, Pausable {
    mapping(address => bool) public authorizedMinters;
    mapping(address => uint256) public clientStakes;
    
    event ClientStaked(address indexed client, uint256 amount);
    event ClientUnstaked(address indexed client, uint256 amount);
    event MinterAuthorized(address indexed minter);
    event MinterRevoked(address indexed minter);
    
    constructor() ERC20("DocuHero Client Token", "DHCT") {
        _mint(msg.sender, 1000000 * 10**decimals());
    }
    
    function stake(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _transfer(msg.sender, address(this), amount);
        clientStakes[msg.sender] += amount;
        emit ClientStaked(msg.sender, amount);
    }
    
    function unstake(uint256 amount) external {
        require(clientStakes[msg.sender] >= amount, "Insufficient stake");
        clientStakes[msg.sender] -= amount;
        _transfer(address(this), msg.sender, amount);
        emit ClientUnstaked(msg.sender, amount);
    }
    
    function authorizeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit MinterAuthorized(minter);
    }
    
    function revokeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRevoked(minter);
    }
    
    function mint(address to, uint256 amount) external {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        _mint(to, amount);
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
}