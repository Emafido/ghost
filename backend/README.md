# 🎭 Ghost Backend — API Reference

This is a concise, frontend-focused reference for the Ghost backend. It documents the most-used endpoints, environment variables, quick start, examples, and integration notes needed by frontend developers.

[![Docs](https://img.shields.io/badge/docs-API-blue)](README.md) [![Status](https://img.shields.io/badge/status-dev-yellow)](README.md) ![License](https://img.shields.io/badge/license-MIT-lightgrey)

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
| `FULLENRICH_API_KEY` | FullEnrich profile enrichment | optional — mock used if absent |
| `GEMINI_API_KEY` | Gemini AI key (`@google/genai`) | optional — mock used if absent |
| `GEMINI_MODEL` | Gemini model selection | `gemini-3-flash-preview` |
| `SIGNUP_BONUS_CREDITS` | Free credits for new wallets | `3` |
| `FRONTEND_ORIGIN` | CORS allowed origins (comma-separated) | `http://localhost:3000` |

---

## 🔐 Authentication (recommended)

- Development: endpoints accept `wallet` in request bodies for convenience.
- Production: require MetaMask signature verification (nonce + signed message) and issue a short-lived token to prove wallet ownership — prevents impersonation.

Detailed flow and security rationale are in `things.txt`.

---

## 🔎 Primary Endpoints
All endpoints accept/return JSON. Use Postman collection (`postmanexample.txt`) for quick import.

### POST /api/search  ⚡
- Purpose: Enrich a LinkedIn profile, generate an AI opener, deduct 1 credit (if `wallet` provided), and record history.
- Auth: optional `wallet` (address). Production should verify signature.
- Request body:

```json
{
	"linkedinUrl": "https://www.linkedin.com/in/username",
	"wallet": "0xUSERWALLET"
}
```

- Success (200):

```json
{
	"data": {
		"id": "642...",
		"linkedinUrl": "https://...",
		"fullName": "Jane Doe",
		"jobTitle": "Senior Engineer",
		"companyName": "Acme Inc",
		"email": "jane@acme.com",
		"phone": "+1-555-0100",
		"opener": "Hi Jane — I enjoyed your recent post about...",
		"geminiModel": "gemini-3-flash-preview",
		"geminiUsageSummary": { "totalTokenCount": 123 }
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

### Admin / Manual (PROTECT these in production)
- POST `/api/deduct` — Manually deduct credits: `{ wallet, amount }`.
- POST `/api/record` — Manually push an entry to a wallet's history.

---

## ⏱️ Rate limits
- `/api/search`: default 10 req/min per wallet (falls back to IP when wallet undefined).
- `/api/search/regenerate`: default 5 req/min per wallet.

---

## 🧪 Postman / Integration
We primarily use Postman. Import the `postmanexample.txt` collection in this folder — it contains ready-made requests and example payloads.

Tip: For development, use the FullEnrich test profile: `https://www.linkedin.com/in/demoge/` to avoid consuming credits.

---

## ⚙️ Implementation notes (short)
- Atomic credit deduction to prevent race conditions: `findOneAndUpdate({ wallet, credits: { $gte: 1 } }, { $inc: { credits: -1 } })`.
- Gemini / FullEnrich integrations are optional and mocked when API keys are not provided.

See `things.txt` for full implementation details and security guidance.

---

## ✅ Next actions I can take
- Add MetaMask signature-based login and example frontend flow.
- Add audit logging (Winston) for credit-sensitive actions.
- Create a tiny admin UI for credit top-ups.

If you'd like any stylistic changes (more badges, an embedded SVG header, or GitHub Actions badges), tell me which and I'll add them.


Quick start
- Install and run the dev server:

```bash
cd backend
npm install
npm run dev
```

Environment variables
- `MONGODB_URI` — MongoDB connection string.
- `FULLENRICH_API_KEY` — FullEnrich API key (optional; mocks used if absent).
- `GEMINI_API_KEY` — Gemini/GCP API key for AI generation (optional; mocks used if absent).
- `GEMINI_MODEL` — Optional model name (default: `gemini-3-flash-preview`).
- `SIGNUP_BONUS_CREDITS` — Free credits granted to new wallets (default: `3`).
- `FRONTEND_ORIGIN` — Allowed frontend origin for CORS (comma-separated list).

Authentication
- Development: wallet addresses are accepted in request bodies for convenience.
- Production recommendation: require MetaMask signature-based sign-in (prove wallet ownership) and issue a short-lived token. This prevents impersonation and is required for any wallet-sensitive endpoints in production.

Primary endpoints
- POST `/api/search`
	- Body: `{ "linkedinUrl": "https://www.linkedin.com/in/username", "wallet": "0xUSERWALLET" }`
	- Purpose: Enrich LinkedIn profile, generate AI opener, deduct 1 credit (if `wallet` provided), record history.
	- Success: 200 `{ data: { id, linkedinUrl, fullName, jobTitle, companyName, email, phone, opener, geminiModel, geminiUsageSummary, openerHistory } }`
	- Errors: 400 (invalid input), 402 (insufficient credits), 500 (server error).

- POST `/api/search/regenerate`
	- Body: `{ "id": "<searchResultId>", "wallet": "0xUSERWALLET" }`
	- Purpose: Regenerate the AI opener for an existing result (costs 1 credit when `wallet` is provided).

- GET `/api/credits/:wallet`
	- Purpose: Return credit balance for `wallet`. Creates wallet with signup bonus if absent.

- GET `/api/history/:wallet` — Return lightweight search history entries for `wallet`.
- GET `/api/badges/:wallet` — Return badges for `wallet`.
- GET `/api/reputation/:wallet` — Return reputation for `wallet`.

- POST `/api/buy-credits`
	- Body: `{ "wallet": "0xUSERWALLET", "amount": 5 }`
	- Purpose: Add credits to a wallet after payment confirmation.

Admin / manual endpoints (protect in production)
- POST `/api/deduct` — Manually deduct credits: `{ wallet, amount }`.
- POST `/api/record` — Manually record a search into wallet history.

Rate limits
- `/api/search`: default 10 requests/min per wallet (falls back to IP when wallet not provided).
- `/api/search/regenerate`: default 5 requests/min per wallet.

Signup bonus & testing
- New wallets receive `SIGNUP_BONUS_CREDITS` on first access.
- Use the FullEnrich test profile when developing: `https://www.linkedin.com/in/demoge/`.

