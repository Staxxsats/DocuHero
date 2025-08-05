// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DataOwnership is Ownable, ReentrancyGuard {
    struct DataRecord {
        address owner;
        string ipfsHash;
        uint256 timestamp;
        bool isEncrypted;
        mapping(address => bool) authorizedAccess;
        string[] tags;
    }
    
    mapping(bytes32 => DataRecord) public dataRecords;
    mapping(address => bytes32[]) public ownerRecords;
    mapping(address => uint256) public accessFees;
    
    event DataRegistered(bytes32 indexed recordId, address indexed owner, string ipfsHash);
    event AccessGranted(bytes32 indexed recordId, address indexed accessor);
    event AccessRevoked(bytes32 indexed recordId, address indexed accessor);
    event AccessFeeSet(address indexed owner, uint256 fee);
    
    function registerData(
        string memory ipfsHash,
        bool isEncrypted,
        string[] memory tags
    ) external returns (bytes32) {
        bytes32 recordId = keccak256(abi.encodePacked(msg.sender, ipfsHash, block.timestamp));
        
        DataRecord storage record = dataRecords[recordId];
        record.owner = msg.sender;
        record.ipfsHash = ipfsHash;
        record.timestamp = block.timestamp;
        record.isEncrypted = isEncrypted;
        record.tags = tags;
        
        ownerRecords[msg.sender].push(recordId);
        
        emit DataRegistered(recordId, msg.sender, ipfsHash);
        return recordId;
    }
    
    function grantAccess(bytes32 recordId, address accessor) external {
        require(dataRecords[recordId].owner == msg.sender, "Not the owner");
        dataRecords[recordId].authorizedAccess[accessor] = true;
        emit AccessGranted(recordId, accessor);
    }
    
    function revokeAccess(bytes32 recordId, address accessor) external {
        require(dataRecords[recordId].owner == msg.sender, "Not the owner");
        dataRecords[recordId].authorizedAccess[accessor] = false;
        emit AccessRevoked(recordId, accessor);
    }
    
    function setAccessFee(uint256 fee) external {
        accessFees[msg.sender] = fee;
        emit AccessFeeSet(msg.sender, fee);
    }
    
    function hasAccess(bytes32 recordId, address accessor) external view returns (bool) {
        DataRecord storage record = dataRecords[recordId];
        return record.owner == accessor || record.authorizedAccess[accessor];
    }
    
    function getRecordInfo(bytes32 recordId) 
        external 
        view 
        returns (
            address owner,
            string memory ipfsHash,
            uint256 timestamp,
            bool isEncrypted
        ) 
    {
        DataRecord storage record = dataRecords[recordId];
        require(record.owner != address(0), "Record does not exist");
        return (record.owner, record.ipfsHash, record.timestamp, record.isEncrypted);
    }
    
    function getOwnerRecords(address owner) external view returns (bytes32[] memory) {
        return ownerRecords[owner];
    }
    
    function getRecordTags(bytes32 recordId) external view returns (string[] memory) {
        return dataRecords[recordId].tags;
    }
}