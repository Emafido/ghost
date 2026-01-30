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

---

## 🔎 Primary Endpoints
All endpoints accept/return JSON.

### POST /api/search  ⚡
- Purpose: Enrich a LinkedIn profile, generate an AI opener, deduct 1 credit (if `wallet` provided), and record history.
- Auth: optional `wallet` (address). Production should verify signature.
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

### Admin / Manual (PROTECT these in production)
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
