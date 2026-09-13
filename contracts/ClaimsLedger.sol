// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ClaimsLedger {
    address public owner;

    struct ItemRecord {
        string itemId;
        string itemHash;
        uint256 timestamp;
        bool isRegistered;
    }

    struct ClaimRecord {
        string matchId;
        string lostItemId;
        string foundItemId;
        string claimantStudentId;
        bool resolved;
        bool approved;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => ItemRecord) private items;
    mapping(string => ClaimRecord) private claims;

    event ItemRegistered(string itemId, string itemHash, uint256 timestamp);
    event ClaimLogged(string matchId, string lostItemId, string foundItemId, string claimantStudentId, uint256 timestamp);
    event ClaimResolved(string matchId, bool approve, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can execute this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerItem(string calldata itemId, string calldata itemHash) external onlyOwner {
        require(!items[itemId].isRegistered, "Item already registered");
        items[itemId] = ItemRecord({
            itemId: itemId,
            itemHash: itemHash,
            timestamp: block.timestamp,
            isRegistered: true
        });
        emit ItemRegistered(itemId, itemHash, block.timestamp);
    }

    function logClaim(
        string calldata matchId,
        string calldata lostItemId,
        string calldata foundItemId,
        string calldata claimantStudentId
    ) external onlyOwner {
        require(!claims[matchId].exists, "Claim already logged");
        claims[matchId] = ClaimRecord({
            matchId: matchId,
            lostItemId: lostItemId,
            foundItemId: foundItemId,
            claimantStudentId: claimantStudentId,
            resolved: false,
            approved: false,
            timestamp: block.timestamp,
            exists: true
        });
        emit ClaimLogged(matchId, lostItemId, foundItemId, claimantStudentId, block.timestamp);
    }

    function resolveClaim(string calldata matchId, bool approve) external onlyOwner {
        require(claims[matchId].exists, "Claim record not found");
        require(!claims[matchId].resolved, "Claim already resolved");

        claims[matchId].resolved = true;
        claims[matchId].approved = approve;
        emit ClaimResolved(matchId, approve, block.timestamp);
    }

    function getItem(string calldata itemId) external view returns (string memory, string memory, uint256, bool) {
        ItemRecord memory item = items[itemId];
        return (item.itemId, item.itemHash, item.timestamp, item.isRegistered);
    }

    function getClaim(string calldata matchId) external view returns (
        string memory,
        string memory,
        string memory,
        string memory,
        bool,
        bool,
        uint256
    ) {
        ClaimRecord memory cr = claims[matchId];
        return (
            cr.matchId,
            cr.lostItemId,
            cr.foundItemId,
            cr.claimantStudentId,
            cr.resolved,
            cr.approved,
            cr.timestamp
        );
    }
}
