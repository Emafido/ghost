// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract GhostNFT is ERC721, Ownable {
    using Strings for uint256;
    
    uint256 private _tokenIdCounter;
    address public creditsContract;
    
    mapping(uint256 => uint256) public badgeType;
    mapping(uint256 => uint256) public mintTimestamp;
    mapping(address => mapping(uint256 => bool)) public hasBadgeType;
    
    string private _baseTokenURI;
    
    event BadgeMinted(address indexed user, uint256 indexed tokenId, uint256 badgeType);
    
    constructor(string memory baseURI) ERC721("Ghost Intel Badge", "GIB") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }
    
    function mintBadge(address user, uint256 _badgeType) external {
        require(msg.sender == creditsContract, "Only credits contract");
        require(_badgeType <= 4, "Invalid badge type");
        require(!hasBadgeType[user][_badgeType], "Badge already owned");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(user, tokenId);
        badgeType[tokenId] = _badgeType;
        mintTimestamp[tokenId] = block.timestamp;
        hasBadgeType[user][_badgeType] = true;
        
        emit BadgeMinted(user, tokenId, _badgeType);
    }
    
    // OpenZeppelin v5.x: Use _update instead of _beforeTokenTransfer
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "Badges are non-transferable");
        return super._update(to, tokenId, auth);
    }
    
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        uint256 bType = badgeType[tokenId];
        return string(abi.encodePacked(_baseTokenURI, bType.toString(), ".json"));
    }
    
    function getBadgesOfOwner(address user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory badges = new uint256[](balance);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) == user) {
                badges[index] = i;
                index++;
            }
        }
        
        return badges;
    }
    
    function getBadgeDetails(uint256 tokenId) external view returns (
        uint256 bType,
        uint256 timestamp,
        address owner
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        bType = badgeType[tokenId];
        timestamp = mintTimestamp[tokenId];
        owner = ownerOf(tokenId);
    }
    
    function getBadgeName(uint256 _badgeType) public pure returns (string memory) {
        if (_badgeType == 0) return "Bronze";
        if (_badgeType == 1) return "Silver";
        if (_badgeType == 2) return "Gold";
        if (_badgeType == 3) return "Platinum";
        if (_badgeType == 4) return "Diamond";
        return "Unknown";
    }
    
    function setCreditsContract(address _creditsContract) external onlyOwner {
        creditsContract = _creditsContract;
    }
    
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
}