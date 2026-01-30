// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "forge-std/Script.sol";
import "../src/GhostCredits.sol";
import "../src/GhostNFT.sol";

contract DeployScript is Script {
    function run() external {
        // Get deployment parameters from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        address usdcAddress = vm.envOr("USDC_ADDRESS", address(0x036CbD53842c5426634e7929541eC2318f3dCF7e));
        
        // Base URI for metadata
        string memory baseURI = vm.envOr("BASE_URI", string("ipfs://QmYourIPFSHash/"));
        
        console.log("\n=== DEPLOYMENT STARTED ===");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("USDC Address:", usdcAddress);
        console.log("Base URI:", baseURI);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy GhostCredits
        GhostCredits creditsContract = new GhostCredits(usdcAddress);
        console.log("\nGhostCredits deployed at:", address(creditsContract));
        
        // Deploy GhostNFT
        GhostNFT nftContract = new GhostNFT(baseURI);
        console.log("GhostNFT deployed at:", address(nftContract));
        
        // Link contracts
        creditsContract.setNFTContract(address(nftContract));
        console.log("\nNFT contract set in Credits contract");
        
        nftContract.setCreditsContract(address(creditsContract));
        console.log("Credits contract set in NFT contract");
        
        vm.stopBroadcast();
        
        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("GhostCredits:", address(creditsContract));
        console.log("GhostNFT:", address(nftContract));
        console.log("USDC Token:", usdcAddress);
        console.log("\nVerify with:");
        console.log("forge verify-contract --chain-id 84532 --etherscan-api-key $BASESCAN_API_KEY", address(creditsContract), "src/GhostCredits.sol:GhostCredits");
        console.log("forge verify-contract --chain-id 84532 --etherscan-api-key $BASESCAN_API_KEY", address(nftContract), "src/GhostNFT.sol:GhostNFT");
    }
}