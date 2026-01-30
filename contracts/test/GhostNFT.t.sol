// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "forge-std/Test.sol";
import "../src/GhostNFT.sol";

contract GhostNFTTest is Test {
    GhostNFT public nftContract;
    
    address public owner;
    address public creditsContract;
    address public user1;
    address public user2;
    
    function setUp() public {
        owner = address(this);
        creditsContract = makeAddr("creditsContract");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Pass msg.sender to Ownable constructor internally
        nftContract = new GhostNFT("ipfs://test/");
        nftContract.setCreditsContract(creditsContract);
    }
    
    function testMintBadge() public {
        vm.prank(creditsContract);
        nftContract.mintBadge(user1, 0);
        
        assertEq(nftContract.balanceOf(user1), 1);
        assertTrue(nftContract.hasBadgeType(user1, 0));
    }
    
    function testBadgeDetails() public {
        vm.prank(creditsContract);
        nftContract.mintBadge(user1, 2);
        
        (uint256 bType, uint256 timestamp, address tokenOwner) = nftContract.getBadgeDetails(0);
        
        assertEq(bType, 2);
        assertGt(timestamp, 0);
        assertEq(tokenOwner, user1);
    }
    
    function testTokenURI() public {
        vm.prank(creditsContract);
        nftContract.mintBadge(user1, 0);
        
        string memory uri = nftContract.tokenURI(0);
        assertEq(uri, "ipfs://test/0.json");
    }
    
    function testGetBadgesOfOwner() public {
        vm.startPrank(creditsContract);
        nftContract.mintBadge(user1, 0);
        nftContract.mintBadge(user1, 1);
        nftContract.mintBadge(user1, 2);
        vm.stopPrank();
        
        uint256[] memory badges = nftContract.getBadgesOfOwner(user1);
        assertEq(badges.length, 3);
    }
    
    function testGetBadgeName() public {
        assertEq(nftContract.getBadgeName(0), "Bronze");
        assertEq(nftContract.getBadgeName(1), "Silver");
        assertEq(nftContract.getBadgeName(2), "Gold");
        assertEq(nftContract.getBadgeName(3), "Platinum");
        assertEq(nftContract.getBadgeName(4), "Diamond");
    }
    
    function test_RevertWhen_TransferBadge() public {
        vm.prank(creditsContract);
        nftContract.mintBadge(user1, 0);
        
        vm.prank(user1);
        vm.expectRevert("Badges are non-transferable");
        nftContract.transferFrom(user1, user2, 0);
    }
    
    function test_RevertWhen_MintDuplicateBadge() public {
        vm.startPrank(creditsContract);
        nftContract.mintBadge(user1, 0);
        
        vm.expectRevert("Badge already owned");
        nftContract.mintBadge(user1, 0);
        vm.stopPrank();
    }
    
    function test_RevertWhen_MintInvalidBadgeType() public {
        vm.prank(creditsContract);
        vm.expectRevert("Invalid badge type");
        nftContract.mintBadge(user1, 5);
    }
    
    function test_RevertWhen_MintFromNonCreditsContract() public {
        vm.prank(user1);
        vm.expectRevert("Only credits contract");
        nftContract.mintBadge(user1, 0);
    }
    
    function testSetBaseURI() public {
        nftContract.setBaseURI("ipfs://new/");
        
        vm.prank(creditsContract);
        nftContract.mintBadge(user1, 0);
        
        string memory uri = nftContract.tokenURI(0);
        assertEq(uri, "ipfs://new/0.json");
    }
    
    function testMultipleUsers() public {
        vm.startPrank(creditsContract);
        nftContract.mintBadge(user1, 0);
        nftContract.mintBadge(user1, 1);
        nftContract.mintBadge(user2, 0);
        nftContract.mintBadge(user2, 2);
        vm.stopPrank();
        
        assertEq(nftContract.balanceOf(user1), 2);
        assertEq(nftContract.balanceOf(user2), 2);
        
        assertTrue(nftContract.hasBadgeType(user1, 0));
        assertTrue(nftContract.hasBadgeType(user1, 1));
        assertTrue(nftContract.hasBadgeType(user2, 0));
        assertTrue(nftContract.hasBadgeType(user2, 2));
    }
}