# Ghost Backend — API Reference & Integration Guide

This document is a concise, frontend-focused API reference for integrating the Ghost Backend. It covers endpoints, request/response shapes, examples (curl and PowerShell), and important integration notes.

## Quick start

- Install and run:

```bash
cd backend
npm install
npm run dev
```

- Set environment variables in `.env` (examples below).

## Environment variables (important)

- `MONGODB_URI` — MongoDB connection string.
- `FULLENRICH_API_KEY` — FullEnrich API key (optional; mocks used if absent).
- `GEMINI_API_KEY` — Gemini API key for AI generation (optional; mocks used if absent).
- `GEMINI_MODEL` — Optional model name (default: `gemini-3-flash-preview`).
- `SIGNUP_BONUS_CREDITS` — Number of free credits granted to new wallets (default: `3`).

## Authentication (recommended)

Current implementation uses wallet addresses passed in request bodies for convenience during development. For production, we recommend implementing signature-based auth (MetaMask sign-in) and issuing a short-lived JWT to prove wallet ownership. I can add that flow if you want.

## Endpoint Summary (most-used)

- POST `/api/search`
  - Purpose: Enrich LinkedIn profile, generate AI opener, deduct 1 credit, record history.
  - Body: `{ "linkedinUrl": "https://www.linkedin.com/in/username", "wallet": "0xUSERWALLET" }`
  - Success: 200 `{ data: { id, linkedinUrl, fullName, jobTitle, companyName, email, phone, opener, geminiModel, geminiUsageSummary, openerHistory } }`
  - Errors: 400 (invalid input), 402 (insufficient credits), 500 (server error).

- POST `/api/search/regenerate`
  - Purpose: Regenerate the AI opener for an existing `SearchResult` (costs 1 credit when `wallet` is provided).
  - Body: `{ "id": "<searchResultId>", "wallet": "0xUSERWALLET" }`
  - Success: 200 `{ data: { ...updated search result... } }`

- GET `/api/credits/:wallet`
  - Purpose: Return current credit balance for `wallet` (creates wallet with signup bonus if absent).
  - Success: 200 `{ "wallet": "0x...", "balance": 3 }`

- GET `/api/history/:wallet`
  - Purpose: Return search history (lightweight entries) for `wallet`.

- POST `/api/buy-credits`
  - Purpose: Add credits to a wallet after payment/confirmation.
  - Body: `{ "wallet": "0xUSERWALLET", "amount": 5 }`
  - Success: 200 `{ "wallet": "0xUSERWALLET", "balance": <newBalance> }`

## Admin / Manual endpoints (use with caution)

- POST `/api/deduct` — Manually deduct credits: `{ wallet, amount }` (requires admin control in production).
- POST `/api/record` — Manually record a search into wallet history.

## Rate limits

- POST `/api/search`: 10 requests/min per wallet (fallback to IP when wallet not provided).
- POST `/api/search/regenerate`: 5 requests/min per wallet.

## Signup bonus & testing

- New wallets receive `SIGNUP_BONUS_CREDITS` (default 3) on first access.
- Use the FullEnrich test contact to avoid consuming credits during development:
  - `https://www.linkedin.com/in/demoge/` (FullEnrich test contact)

## Atomic credit deduction (simple explanation)

- When a search or regenerate request is made with a `wallet`, the backend uses a single atomic DB operation to ensure a credit is deducted only if one is available. This prevents two simultaneous requests from both using the same credit.
- Implementation detail (for backend devs): `Wallet.findOneAndUpdate({ wallet, credits: { $gte: 1 } }, { $inc: { credits: -1 } }, { new: true })`.
- If an error occurs during enrichment or AI generation, the credit is refunded using another atomic increment: `Wallet.findOneAndUpdate({ wallet }, { $inc: { credits: 1 } })`.

## Example frontend flow (React / pseudocode)

1. User clicks "Connect Wallet" (MetaMask) → obtain `walletAddress`.
2. Fetch initial data:
   - GET `/api/credits/${walletAddress}`
   - GET `/api/badges/${walletAddress}`
   - GET `/api/history/${walletAddress}`
3. User submits LinkedIn URL → POST `/api/search` with `{ linkedinUrl, wallet }`.
   - On 200: display `data` (opener + enrichment).
   - On 402: prompt user to buy credits (open buy flow).
4. To buy credits, process payment, then call POST `/api/buy-credits` with `{ wallet, amount }`.

## Integration examples

Curl (Linux/macOS):

```bash
# Search
curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{"linkedinUrl":"https://www.linkedin.com/in/demoge/","wallet":"0xTESTWALLET"}'

# Buy credits
curl -X POST http://localhost:5000/api/buy-credits \
  -H "Content-Type: application/json" \
  -d '{"wallet":"0xTESTWALLET","amount":5}'
```

PowerShell (Windows):

```powershell
# Search
Invoke-RestMethod -Uri "http://localhost:5000/api/search" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"linkedinUrl":"https://www.linkedin.com/in/demoge/","wallet":"0xTESTWALLET"}'

# Buy credits
Invoke-RestMethod -Uri "http://localhost:5000/api/buy-credits" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"wallet":"0xTESTWALLET","amount":5}'
```

## Production notes (short)

- Protect admin endpoints and require signature-based auth for wallet-sensitive actions.
- Configure CORS to allow only your frontend origin.
- Use HTTPS in production.
- Consider persistent audit logs (Winston) and monitoring for credit-deduction events.

---

If you want, I can:
- Add a MetaMask signature-based login flow (recommended), or
- Add an admin UI for topping up credits and viewing history.

Pick the next step and I’ll implement it.
# Ghost Backend

This folder contains the Node.js + Express backend for the Ghost Intel project.

Quick start

1. Install dependencies:

```bash
cd backend
npm install
```

2. Configure environment variables in `.env` (example provided).

3. Run the development server:

```bash
npm run dev
```

API

- POST `/api/search` — body: `{ "linkedinUrl": "https://www.linkedin.com/in/username" }`.
  - Returns saved enrichment result and generated AI opener.


Gemini integration

- Set `GEMINI_API_KEY` in `.env` to enable live opener generation with Gemini AI. If not set, the backend will use a local mocked response for development.
- Optional: set `GEMINI_MODEL` (default: `gemini-3-flash-preview`).
- The backend uses `@google/genai` for Gemini API calls.

FullEnrich integration

- Set `FULLENRICH_API_KEY` in `.env` to enable live enrichment calls. If not set, the backend will use a local mocked response for development.
- Optional: set `FULLENRICH_BASE_URL` to override the API base URL (defaults to `https://app.fullenrich.com/api/v2`).
- You can configure polling timeout and interval using `FULLENRICH_TIMEOUT_MS` and `FULLENRICH_POLL_INTERVAL_MS` in `.env`.

Gemini AI integration

- Set `GEMINI_API_KEY` in `.env` to enable live Gemini AI opener generation. If not set, the system falls back to a simple mock opener.
- Optionally set `GEMINI_MODEL` to choose a Gemini model (default: `gemini-3-flash-preview`).
