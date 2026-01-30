// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "lib/openzeppelin-contracts/contracts/utils/Pausable.sol";
import "lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "lib/openzeppelin-contracts/contracts/utils/Strings.sol";

contract GhostCredits is Ownable, ReentrancyGuard, Pausable {
    IERC20 public usdcToken;
    address public nftContract;
    
    uint256 public creditsPerETH = 1000;
    uint256 public creditsPerUSDC = 50;
    uint256 public referralBonusPercent = 10;
    
    mapping(address => uint256) public credits;
    mapping(address => uint256) public totalSearches;
    mapping(address => uint256) public reputationScore;
    mapping(address => bytes32[]) public searchHashes;
    mapping(address => string) public referralCodes;
    mapping(string => address) public referralCodeOwner;
    mapping(address => address) public referredBy;
    mapping(address => uint256) public referralCount;
    
    event CreditsPurchased(address indexed user, uint256 amount, uint256 credits, bool isUSDC);
    event CreditDeducted(address indexed user, uint256 remainingCredits);
    event SearchRecorded(address indexed user, bytes32 searchHash, uint256 timestamp);
    event ReputationUpdated(address indexed user, uint256 newScore);
    event ReferralCreated(address indexed user, string code);
    event ReferralUsed(address indexed referrer, address indexed referee, uint256 bonusCredits);
    event NFTContractSet(address indexed nftContract);
    
    constructor(address _usdcToken) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
    }
    
    function purchaseCreditsETH() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Must send ETH");
        
        uint256 creditAmount = (msg.value * creditsPerETH) / 1 ether;
        credits[msg.sender] += creditAmount;
        
        if (referredBy[msg.sender] != address(0)) {
            uint256 bonus = (creditAmount * referralBonusPercent) / 100;
            credits[referredBy[msg.sender]] += bonus;
            emit ReferralUsed(referredBy[msg.sender], msg.sender, bonus);
        }
        
        emit CreditsPurchased(msg.sender, msg.value, creditAmount, false);
    }
    
    function purchaseCreditsUSDC(uint256 usdcAmount) external nonReentrant whenNotPaused {
        require(usdcAmount > 0, "Must send USDC");
        require(usdcToken.transferFrom(msg.sender, address(this), usdcAmount), "USDC transfer failed");
        
        uint256 creditAmount = (usdcAmount * creditsPerUSDC) / 1e6;
        credits[msg.sender] += creditAmount;
        
        if (referredBy[msg.sender] != address(0)) {
            uint256 bonus = (creditAmount * referralBonusPercent) / 100;
            credits[referredBy[msg.sender]] += bonus;
            emit ReferralUsed(referredBy[msg.sender], msg.sender, bonus);
        }
        
        emit CreditsPurchased(msg.sender, usdcAmount, creditAmount, true);
    }
    
    function recordSearch(address user, bytes32 searchHash) external onlyOwner whenNotPaused {
        require(credits[user] >= 1, "Insufficient credits");
        
        credits[user] -= 1;
        totalSearches[user] += 1;
        searchHashes[user].push(searchHash);
        
        _updateReputation(user);
        
        emit CreditDeducted(user, credits[user]);
        emit SearchRecorded(user, searchHash, block.timestamp);
        
        if (nftContract != address(0)) {
            _checkBadgeMilestone(user);
        }
    }
    
    function _updateReputation(address user) internal {
        uint256 newScore = (totalSearches[user] * 10);
        reputationScore[user] = newScore;
        emit ReputationUpdated(user, newScore);
    }
    
    function getReputationLevel(address user) public view returns (uint256 level) {
        uint256 score = reputationScore[user];
        if (score < 100) return 0;
        if (score < 500) return 1;
        if (score < 1000) return 2;
        return 3;
    }
    
    function createReferralCode(string memory code) external {
        require(bytes(referralCodes[msg.sender]).length == 0, "Referral code already exists");
        require(referralCodeOwner[code] == address(0), "Code already taken");
        require(bytes(code).length > 0 && bytes(code).length <= 20, "Invalid code length");
        
        referralCodes[msg.sender] = code;
        referralCodeOwner[code] = msg.sender;
        
        emit ReferralCreated(msg.sender, code);
    }
    
    function useReferralCode(string memory code) external {
        require(referredBy[msg.sender] == address(0), "Already used referral");
        address referrer = referralCodeOwner[code];
        require(referrer != address(0), "Invalid referral code");
        require(referrer != msg.sender, "Cannot refer yourself");
        
        referredBy[msg.sender] = referrer;
        referralCount[referrer] += 1;
    }
    
    function _checkBadgeMilestone(address user) internal {
        uint256 searches = totalSearches[user];
        
        if (searches == 10 || searches == 50 || searches == 100 || searches == 500 || searches == 1000) {
            (bool success,) = nftContract.call(
                abi.encodeWithSignature("mintBadge(address,uint256)", user, _getBadgeType(searches))
            );
            require(success, "Badge mint failed");
        }
    }
    
    function _getBadgeType(uint256 searches) internal pure returns (uint256) {
        if (searches == 10) return 0;
        if (searches == 50) return 1;
        if (searches == 100) return 2;
        if (searches == 500) return 3;
        if (searches == 1000) return 4;
        return 0;
    }
    
    function getCredits(address user) external view returns (uint256) {
        return credits[user];
    }
    
    function getSearchCount(address user) external view returns (uint256) {
        return totalSearches[user];
    }
    
    function getSearchHistory(address user) external view returns (bytes32[] memory) {
        return searchHashes[user];
    }
    
    function getReputation(address user) external view returns (uint256 score, uint256 level) {
        score = reputationScore[user];
        level = getReputationLevel(user);
    }
    
    function getReferralInfo(address user) external view returns (
        string memory code,
        uint256 count,
        address referrer
    ) {
        code = referralCodes[user];
        count = referralCount[user];
        referrer = referredBy[user];
    }
    
    function setNFTContract(address _nftContract) external onlyOwner {
        nftContract = _nftContract;
        emit NFTContractSet(_nftContract);
    }
    
    function setCreditsPerETH(uint256 _creditsPerETH) external onlyOwner {
        creditsPerETH = _creditsPerETH;
    }
    
    function setCreditsPerUSDC(uint256 _creditsPerUSDC) external onlyOwner {
        creditsPerUSDC = _creditsPerUSDC;
    }
    
    function setReferralBonus(uint256 _percent) external onlyOwner {
        require(_percent <= 50, "Bonus too high");
        referralBonusPercent = _percent;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function withdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function withdrawUSDC() external onlyOwner {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(usdcToken.transfer(owner(), balance), "Transfer failed");
    }
}