// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "forge-std/Test.sol";
import "../src/GhostCredits.sol";
import "../src/GhostNFT.sol";

// Mock USDC token for testing
contract MockUSDC {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        return true;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract GhostCreditsTest is Test {
    GhostCredits public creditsContract;
    GhostNFT public nftContract;
    MockUSDC public usdcToken;
    
    address public owner;
    address public user1;
    address public user2;

    receive() external payable {}
    
    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Deploy mock USDC
        usdcToken = new MockUSDC();
        
        // Deploy contracts
        creditsContract = new GhostCredits(address(usdcToken));
        nftContract = new GhostNFT("ipfs://test/");
        
        // Setup
        nftContract.setCreditsContract(address(creditsContract));
        creditsContract.setNFTContract(address(nftContract));
        
        // Fund users with ETH and USDC
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        usdcToken.mint(user1, 1000e6);
        usdcToken.mint(user2, 1000e6);
    }
    
    function testPurchaseCreditsETH() public {
        vm.prank(user1);
        creditsContract.purchaseCreditsETH{value: 1 ether}();
        
        assertEq(creditsContract.getCredits(user1), 1000);
    }
    
    function testPurchaseCreditsUSDC() public {
        vm.startPrank(user1);
        usdcToken.approve(address(creditsContract), 100e6);
        creditsContract.purchaseCreditsUSDC(100e6);
        vm.stopPrank();
        
        assertEq(creditsContract.getCredits(user1), 5000);
    }
    
    function testRecordSearch() public {
        // Give user1 some credits
        vm.prank(user1);
        creditsContract.purchaseCreditsETH{value: 1 ether}();
        
        // Record search
        bytes32 searchHash = keccak256("test search");
        creditsContract.recordSearch(user1, searchHash);
        
        assertEq(creditsContract.getCredits(user1), 999);
        assertEq(creditsContract.getSearchCount(user1), 1);
    }
    
    function testReputationUpdate() public {
        vm.prank(user1);
        creditsContract.purchaseCreditsETH{value: 1 ether}();
        
        // Perform 10 searches
        for (uint256 i = 0; i < 10; i++) {
            bytes32 searchHash = keccak256(abi.encodePacked("search", i));
            creditsContract.recordSearch(user1, searchHash);
        }
        
        (uint256 score, uint256 level) = creditsContract.getReputation(user1);
        assertEq(score, 100);
        assertEq(level, 1);
    }
    
    function testReferralSystem() public {
        // User1 creates referral code
        vm.prank(user1);
        creditsContract.createReferralCode("USER1CODE");
        
        // User2 uses referral code
        vm.prank(user2);
        creditsContract.useReferralCode("USER1CODE");
        
        // User2 purchases credits
        vm.prank(user2);
        creditsContract.purchaseCreditsETH{value: 1 ether}();
        
        // User1 should get 10% bonus
        assertEq(creditsContract.getCredits(user2), 1000);
        assertEq(creditsContract.getCredits(user1), 100); // 10% of 1000
    }
    
    function testBadgeMinting() public {
        vm.prank(user1);
        creditsContract.purchaseCreditsETH{value: 1 ether}();
        
        // Perform 10 searches to trigger badge
        for (uint256 i = 0; i < 10; i++) {
            bytes32 searchHash = keccak256(abi.encodePacked("search", i));
            creditsContract.recordSearch(user1, searchHash);
        }
        
        // Check if user got bronze badge
        assertEq(nftContract.balanceOf(user1), 1);
        assertTrue(nftContract.hasBadgeType(user1, 0));
    }
    
    function test_RevertWhen_InsufficientCredits() public {
        bytes32 searchHash = keccak256("test");
        vm.expectRevert("Insufficient credits");
        creditsContract.recordSearch(user1, searchHash);
    }
    
    function test_RevertWhen_DuplicateReferralCode() public {
        vm.startPrank(user1);
        creditsContract.createReferralCode("CODE");
        
        vm.expectRevert("Referral code already exists");
        creditsContract.createReferralCode("CODE2");
        vm.stopPrank();
    }
    
    function test_RevertWhen_SelfReferral() public {
        vm.startPrank(user1);
        creditsContract.createReferralCode("CODE");
        
        vm.expectRevert("Cannot refer yourself");
        creditsContract.useReferralCode("CODE");
        vm.stopPrank();
    }
    
    function testPauseUnpause() public {
        creditsContract.pause();
        
        vm.prank(user1);
        vm.expectRevert();
        creditsContract.purchaseCreditsETH{value: 1 ether}();
        
        creditsContract.unpause();
        
        vm.prank(user1);
        creditsContract.purchaseCreditsETH{value: 1 ether}();
        assertEq(creditsContract.getCredits(user1), 1000);
    }
    
    function testWithdrawETH() public {
        vm.prank(user1);
        creditsContract.purchaseCreditsETH{value: 1 ether}();
        
        uint256 balanceBefore = owner.balance;
        creditsContract.withdrawETH();
        uint256 balanceAfter = owner.balance;
        
        assertEq(balanceAfter - balanceBefore, 1 ether);
    }
    
    function testWithdrawUSDC() public {
        vm.startPrank(user1);
        usdcToken.approve(address(creditsContract), 100e6);
        creditsContract.purchaseCreditsUSDC(100e6);
        vm.stopPrank();
        
        uint256 balanceBefore = usdcToken.balanceOf(owner);
        creditsContract.withdrawUSDC();
        uint256 balanceAfter = usdcToken.balanceOf(owner);
        
        assertEq(balanceAfter - balanceBefore, 100e6);
    }
    
    function testSetCreditsPerETH() public {
        creditsContract.setCreditsPerETH(2000);
        
        vm.prank(user1);
        creditsContract.purchaseCreditsETH{value: 1 ether}();
        
        assertEq(creditsContract.getCredits(user1), 2000);
    }
    
    function testSetCreditsPerUSDC() public {
        creditsContract.setCreditsPerUSDC(100);
        
        vm.startPrank(user1);
        usdcToken.approve(address(creditsContract), 100e6);
        creditsContract.purchaseCreditsUSDC(100e6);
        vm.stopPrank();
        
        assertEq(creditsContract.getCredits(user1), 10000);
    }
    
    function testSetReferralBonus() public {
        creditsContract.setReferralBonus(20);
        
        vm.prank(user1);
        creditsContract.createReferralCode("CODE");
        
        vm.prank(user2);
        creditsContract.useReferralCode("CODE");
        
        vm.prank(user2);
        creditsContract.purchaseCreditsETH{value: 1 ether}();
        
        assertEq(creditsContract.getCredits(user1), 200); // 20% of 1000
    }
    
    function testGetSearchHistory() public {
        vm.prank(user1);
        creditsContract.purchaseCreditsETH{value: 1 ether}();
        
        bytes32 hash1 = keccak256("search1");
        bytes32 hash2 = keccak256("search2");
        
        creditsContract.recordSearch(user1, hash1);
        creditsContract.recordSearch(user1, hash2);
        
        bytes32[] memory history = creditsContract.getSearchHistory(user1);
        assertEq(history.length, 2);
        assertEq(history[0], hash1);
        assertEq(history[1], hash2);
    }
}