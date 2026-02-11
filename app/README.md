# Ghost Frontend — Notes

This small note points frontend developers to the on-chain contract configuration.

- GhostCredits contract address is defined in `app/constants.ts` as `GHOST_CREDITS_ADDRESS`.
- When contracts are redeployed, update `app/constants.ts` (or replace with environment-driven config) with the new `GHOST_CREDITS_ADDRESS`.

Example (current):

```ts
export const GHOST_CREDITS_ADDRESS = "0x592818F05E5EbA208D1A58E7d382D74171ee19a9";
```

Frontend devs should read-only call the `GhostNFT` contract directly for badge data using `GHOST_NFT_ABI` and `GHOST_NFT_ADDRESS`.
