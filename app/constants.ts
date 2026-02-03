// app/constants.ts

// 1. Deployed Addresses (from run-latest.json)
// Network: Base Sepolia (Chain ID: 84532)
export const GHOST_CREDITS_ADDRESS = "0xc2a921b0a86109e6337a565172a92b2edc110e18";
export const GHOST_NFT_ADDRESS = "0x6091f4ff7dc215830d0b7b83d67bbe9096b95601";

// 2. GhostCredits ABI (Interface for talking to the contract)
export const GHOST_CREDITS_ABI = [
  {
    inputs: [],
    name: "purchaseCreditsETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getCredits",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getSearchCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getReputation",
    outputs: [
      { name: "score", type: "uint256" },
      { name: "level", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// 3. GhostNFT ABI
export const GHOST_NFT_ABI = [
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getBadgesOfOwner",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_badgeType", type: "uint256" }],
    name: "getBadgeName",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "pure",
    type: "function",
  },
] as const;