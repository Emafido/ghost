# 🎭 Ghost Backend — API Reference

This is a concise, frontend-focused reference for the Ghost backend. It documents the most-used endpoints, environment variables, quick start, examples, and integration notes needed by frontend developers.

[![Docs](https://img.shields.io/badge/docs-API-blue)](README.md) [![Status](https://img.shields.io/badge/status-dev-yellow)](README.md) ![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 🌐 Production API Base URL

Primary deployed URL (Render): https://ghost-intel-backend.onrender.com

Use this base URL for production calls and update your frontend configuration to point to it. Example: `https://ghost-intel-backend.onrender.com/api/search`.

---

## ✨ Quick Start

1. Clone and install:

```bash
cd backend
npm install
npm run dev
```

2. Set the environment variables in a `.env` file (see Environment section).

---

## 🔧 Environment
Key variables used by the backend:

| Variable | Purpose | Default / Notes |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | required in prod |
| `FULLENRICH_API_KEY` | FullEnrich profile enrichment | optional, mock used if absent |
| `GEMINI_API_KEY` | Gemini AI key (`@google/genai`) | optional, mock used if absent |
| `GEMINI_MODEL` | Gemini model selection | `gemini-3-flash-preview` |
| `SIGNUP_BONUS_CREDITS` | Free credits for new wallets | `3` |
| `FRONTEND_ORIGIN` | CORS allowed origins (comma-separated) | `http://localhost:3000` |
| `GHOSTCREDITS_ADDRESS` | GhostCredits contract address | set after deployment |
| `GHOSTNFT_ADDRESS` | GhostNFT contract address | set after deployment |
| `ADMIN_PRIVATE_KEY` | Private key for admin txs | keep secret |
| `ADMIN_API_KEY` | API key protecting admin endpoints | keep secret |

---

## 🔎 Primary Endpoints
All endpoints accept/return JSON.

### POST /api/search  ⚡
- Purpose: Enrich a LinkedIn profile, generate an AI opener, deduct 1 credit (if `wallet` provided), and record history.
- Request body:

```json
{
        "linkedinUrl": "https://www.linkedin.com/in/demoge/",
        "wallet": "0xTESTWALLET"
}
```

 - Development note: The test profile at `https://www.linkedin.com/in/demoge/` is always free from FullEnrich's side (no API usage is counted), but Ghost will still deduct one credit per `/api/search` call by default.

- Success (200):

```json
{
        "data": {
                "id": "697c50ceda4a0b5f8f6a42ea",
                "linkedinUrl": "https://www.linkedin.com/in/demoge/",
                "fullName": "Grégoire Demoge",
                "jobTitle": "Co-founder",
                "companyName": "FullEnrich",
                "email": "greg@fullenrich.com",
                "phone": "+33 6 12 34 56 78",
                "opener": "I’ve been following FullEnrich's growth and love how you’re simplifying the data waterfall process for modern sales teams.",
                "geminiModel": "gemini-3-flash-preview",
                "geminiUsageSummary": { "totalTokenCount": 608 },
                "openerHistory": [
                        {
                                "text": "I’ve been following FullEnrich's growth and love how you’re simplifying the data waterfall process for modern sales teams.",
                                "createdAt": "2026-01-30T06:33:50.982Z",
                                "geminiModel": "gemini-3-flash-preview"
                        }
                ]
        }
}
```

- Errors: `400` (invalid input), `402` (insufficient credits), `500` (server error).

---

### POST /api/search/regenerate  ♻️
- Purpose: Re-run AI opener generation for an existing `SearchResult` (costs 1 credit when `wallet` provided).
- Request body:

```json
{ "id": "<searchResultId>", "wallet": "0xUSERWALLET" }
```

---

### GET /api/credits/:wallet  💳
- Purpose: Return current credit balance. If wallet does not exist, it is created and granted the signup bonus.

Response example:

```json
{ "wallet": "0xUSERWALLET", "balance": 3 }
```

---

### GET /api/history/:wallet  📜
- Returns lightweight history entries: `searchId`, `linkedinUrl`, `recordedAt`.

---

### POST /api/buy-credits  💰
- Purpose: Add credits to wallet after payment confirmation.
- Request body:

```json
{ "wallet": "0xUSERWALLET", "amount": 5 }
```

---

### Admin / Manual
- POST `/api/deduct` — Manually deduct credits: `{ wallet, amount }`.
- POST `/api/record` — Manually push an entry to a wallet's history.

---

## ⏱️ Rate limits
- `/api/search`: default 10 req/min per wallet (falls back to IP when wallet undefined).
- `/api/search/regenerate`: default 5 req/min per wallet.

---

## 🎁 Signup Bonus & Credits

- New wallets are created on first access (for example when calling `/api/credits/:wallet`, `/api/history/:wallet`, or any endpoint passing `wallet`) and automatically receive `SIGNUP_BONUS_CREDITS` (default: `3`).
- Credits are consumed when a `wallet` is provided to credit-using endpoints: `POST /api/search` and `POST /api/search/regenerate` deduct 1 credit each.
- Deduction is atomic: the backend only decrements a credit when one is available to prevent race conditions. If enrichment or generation fails, the credit is refunded.
- Use `GET /api/credits/:wallet` to read the current balance and `POST /api/buy-credits` to top up after payment confirmation (server should verify payment before calling this endpoint).
- Frontend UX tips: always fetch and display the user's credit balance, handle HTTP `402` by routing users to the buy-credits flow, and show clear messages when operations are free (see testing note below).

---

## 🔗 Blockchain Integration (Admin)

This backend exposes admin endpoints to manage the on-chain `GhostCredits` contract. These endpoints are protected by an API key (`ADMIN_API_KEY`) and intended for trusted admin use only.

- Configuration: set contract addresses and keys in `.env`:
    - `GHOSTCREDITS_ADDRESS` — GhostCredits contract address
    - `GHOSTNFT_ADDRESS` — GhostNFT contract address
    - `ADMIN_PRIVATE_KEY` — private key used for signing admin transactions (keep secret)
    - `ADMIN_API_KEY` — short-lived API key for protecting admin endpoints

- Admin endpoints (mounted at `/api/admin`):
    - `POST /api/admin/pause` — pause contract (owner-only)
    - `POST /api/admin/unpause` — unpause contract (owner-only)
    - `POST /api/admin/set-credits-per-eth` — `{ value }` set credits/ETH
    - `POST /api/admin/set-credits-per-usdc` — `{ value }` set credits/USDC
    - `POST /api/admin/set-nft-contract` — `{ address }` set the NFT contract address used by Credits
    - `POST /api/admin/set-referral-bonus` — `{ percent }` set referral bonus percent
    - `POST /api/admin/withdraw-eth` — withdraw contract ETH balance
    - `POST /api/admin/withdraw-usdc` — withdraw contract USDC balance
    - `POST /api/admin/transfer-ownership` — `{ newOwner }` transfer ownership (use direct address)
    - `POST /api/admin/renounce-ownership` — renounce ownership (irreversible)

- Security notes:
    - Admin endpoints require the header `Authorization: Bearer <ADMIN_API_KEY>`.
    - Never expose `ADMIN_PRIVATE_KEY` to client-side code.
    - `renounceOwnership` is irreversible — do not call unless intentional.

## 🪪 GhostNFT (badge) integration notes

- The `GhostNFT` contract in the repo mints badges only when called by the `GhostCredits` contract. Users cannot mint directly.
- Frontend responsibilities:
    - Read-only interactions (display badges, metadata) should be performed directly from the frontend using the `GhostNFT` ABI and `GHOSTNFT_ADDRESS`.
    - Examples: call `getBadgesOfOwner`, `getBadgeDetails`, `tokenURI` from the client.
- Backend responsibilities (optional):
    - Provide admin endpoints to call owner-only functions such as `setCreditsContract` and `setBaseURI` if you want centralized admin control through the backend.
    - If you add those endpoints, protect them with `ADMIN_API_KEY` and server-side signing using `ADMIN_PRIVATE_KEY`.

## ✅ Redeploy / Update checklist

1. When contracts are redeployed, update `.env` `GHOSTCREDITS_ADDRESS` and `GHOSTNFT_ADDRESS` with the new addresses.
2. If the contract ABI changed, replace the ABI JSON files in `backend/contracts/` and in the frontend.
3. Restart the backend service after `.env` changes.
4. Verify admin endpoints (pause/unpause, set-*, withdraw) against the new deployment before running irreversible actions.

If you want, I can add example cURL and PowerShell snippets showing how to call the admin endpoints.
