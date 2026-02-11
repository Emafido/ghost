// app/constants.ts

export const GHOST_CREDITS_ADDRESS = "0xc2a921b0a86109e6337a565172a92b2edc110e18"; // Base Sepolia
export const GHOST_NFT_ADDRESS = "0x6091f4ff7dc215830d0b7b83d67bbe9096b95601";
export const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC

export const GHOST_CREDITS_ABI = [
  // --- READ FUNCTIONS ---
  { inputs: [{ name: "user", type: "address" }], name: "getCredits", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getReputation", outputs: [{ name: "score", type: "uint256" }, { name: "level", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getReferralInfo", outputs: [{ name: "code", type: "string" }, { name: "count", type: "uint256" }, { name: "referrer", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getSearchCount", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getSearchHistory", outputs: [{ name: "", type: "bytes32[]" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "creditsPerETH", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "creditsPerUSDC", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  
  // --- WRITE FUNCTIONS ---
  { inputs: [], name: "purchaseCreditsETH", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "usdcAmount", type: "uint256" }], name: "purchaseCreditsUSDC", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "code", type: "string" }], name: "createReferralCode", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "code", type: "string" }], name: "useReferralCode", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;

// Minimal ERC20 ABI for USDC Approval
export const ERC20_ABI = [
  { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
] as const;