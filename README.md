# 👻 Ghost Intel: AI-Powered Lead Enrichment on Base

Welcome to Ghost Intel, an innovative platform that combines cutting-edge AI, powerful lead enrichment, and robust Web3 technology to revolutionize how sales professionals identify and engage with prospects. By simply providing a LinkedIn profile URL, users receive instant, actionable insights and personalized AI-generated icebreakers, all secured and gamified on the Base Sepolia blockchain.

## ✨ Project Overview

Ghost Intel is a full-stack application demonstrating the synergy between modern web development (Next.js, React, TypeScript), advanced AI services (Google Gemini), enterprise data solutions (FullEnrich), and decentralized ledger technology (Solidity smart contracts on Base Sepolia). This project showcases capabilities in secure user authentication, on-chain asset management, and dynamic data processing, delivering a seamless experience for intelligent lead generation.

## 🚀 Getting Started

Follow these steps to set up the Ghost Intel project locally.

### Prerequisites

Ensure you have the following installed:
- Node.js (v18 or later)
- npm (Node Package Manager)
- Git
- Foundry (for smart contract development and deployment, if applicable)

### Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Emafido/ghost.git
    cd ghost
    ```

2.  **Install Frontend Dependencies**:
    Navigate to the project root and install dependencies for the Next.js application:
    ```bash
    npm install
    ```

3.  **Smart Contract Setup (Optional, for local development/testing)**:
    If you plan to interact with or modify the smart contracts locally using Foundry, ensure your environment is set up.
    ```bash
    cd contracts
    forge install
    # You might also need to install OpenZeppelin contracts if not already present via forge
    # forge install OpenZeppelin/openzeppelin-contracts
    cd ..
    ```
    *Note*: The smart contracts are typically deployed once. The frontend interacts with deployed contract addresses.

4.  **Backend Setup**:
    The backend documentation in `BACKEND_README.md` suggests a conceptual `backend` directory. Please refer to that file for detailed backend setup, including its own `npm install` and environment variable configuration.

### Environment Variables

For the Next.js frontend, environment variables are typically loaded via `.env.local`. You might need:
- `NEXT_PUBLIC_API_BASE`: The URL of the Ghost Intel backend API (e.g., `https://ghost-intel-backend.onrender.com/api`).
- Any other client-side exposed variables, if applicable.

## 💡 Usage

Once the frontend and backend are running, you can interact with the Ghost Intel application:

1.  **Start the Next.js Development Server**:
    From the project root:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

2.  **Connect Your Wallet**:
    Use a Web3-compatible browser extension (e.g., MetaMask) and connect to the **Base Sepolia Network (Chain ID: 84532)**. The application will prompt you to switch networks if you are on a different one.

3.  **Search for Leads**:
    Paste a LinkedIn profile URL into the search bar and click "Decrypt" to initiate lead enrichment and AI opener generation. This will consume one credit.

4.  **Manage Credits and Referrals**:
    - Your credit balance is displayed in the navigation bar. Click "+ BUY" to purchase more credits using ETH on Base Sepolia.
    - Access your profile to view your reputation, total searches, and manage your referral code. Create a unique code to refer friends and earn bonuses, or redeem a friend's code to get bonus credits.

## 🌟 Features

-   **AI-Powered Icebreakers**: Leverage Google Gemini AI to generate highly personalized and effective opening lines for outreach campaigns.
-   **Comprehensive Lead Enrichment**: Instantly extract crucial professional data from LinkedIn profiles using the FullEnrich API.
-   **Web3 Integration**: Seamlessly connect your crypto wallet (Base Sepolia network) to manage on-chain credits and participate in the referral program.
-   **On-Chain Credit System**: A transparent and secure `GhostCredits` smart contract handles credit purchases, deductions, and referral bonuses.
-   **Gamified Reputation & Badges**: Earn reputation points and unique `GhostNFT` badges based on search activity and milestones, enhancing user engagement and status.
-   **Referral Program**: Grow your network and earn bonus credits by referring new users with personalized referral codes.
-   **Intuitive User Interface**: A modern and responsive design built with Next.js and TailwindCSS ensures a smooth user experience.
-   **Search History**: Track all your past lead searches and AI opener generations.

## 🛠️ Technologies Used

| Category          | Technology                                                              | Description                                                      |
| :---------------- | :---------------------------------------------------------------------- | :--------------------------------------------------------------- |
| **Frontend**      | [Next.js](https://nextjs.org/)                                          | React framework for production with server-side rendering.       |
|                   | [React](https://react.dev/)                                             | UI library for building interactive user interfaces.             |
|                   | [TypeScript](https://www.typescriptlang.org/)                           | Superset of JavaScript for type-safe code.                       |
|                   | [TailwindCSS](https://tailwindcss.com/)                                 | Utility-first CSS framework for rapid UI development.            |
|                   | [Wagmi](https://wagmi.sh/)                                              | React Hooks for Ethereum, simplifying Web3 interactions.         |
|                   | [Viem](https://viem.sh/)                                                | TypeScript interface for Ethereum, used by Wagmi.                |
|                   | [Axios](https://axios-http.com/)                                        | Promise-based HTTP client for the browser and Node.js.           |
|                   | [@tanstack/react-query](https://tanstack.com/query/latest)              | Data fetching library for React applications.                    |
| **Backend**       | Node.js (implicit, for API server)                                      | Runtime for server-side logic and API endpoints.                 |
|                   | MongoDB (implicit, via `MONGODB_URI`)                                   | NoSQL database for flexible data storage.                        |
|                   | [FullEnrich API](https://fullenrich.com/)                               | Third-party service for LinkedIn profile data enrichment.        |
|                   | [Google Gemini AI](https://ai.google.dev/models/gemini)                 | AI service for generating creative content like icebreakers.     |
| **Blockchain**    | [Solidity](https://soliditylang.org/)                                   | Language for writing smart contracts.                            |
|                   | [Foundry](https://getfoundry.sh/)                                       | Development toolkit for Ethereum smart contracts (build, test, deploy). |
|                   | [Base Sepolia](https://docs.base.org/guides/sepolia/)                   | Ethereum Layer 2 testnet for scalable dApp deployment.           |
|                   | [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/5.x/)  | Secure smart contract libraries.                                 |
|                   | [ERC20 (USDC)](https://docs.openzeppelin.com/contracts/5.x/api/token/erc20) | Standard for fungible tokens (for credit purchases).             |
|                   | [ERC721 (GhostNFT)](https://docs.openzeppelin.com/contracts/5.x/api/token/erc721) | Standard for non-fungible tokens (for badges).                   |

---

# Ghost Intel Backend API

## Overview
The Ghost Intel Backend API is a Node.js-based server designed to handle lead enrichment, AI-powered content generation, and integrate with the Ghost Intel smart contracts for credit and reputation management. It acts as the central hub for data processing and blockchain interactions, providing secure and efficient endpoints for the frontend application. It leverages MongoDB for data persistence and third-party APIs like FullEnrich and Google Gemini.

## Features
-   **Profile Enrichment**: Fetches and processes LinkedIn profile data using the FullEnrich API.
-   **AI Opener Generation**: Utilizes Google Gemini AI to craft personalized icebreaker messages.
-   **Credit Management**: Handles the deduction of credits for searches and integrates with the `GhostCredits` smart contract for on-chain credit balance.
-   **User History Tracking**: Records and retrieves user search history for personalized insights.
-   **Referral System Support**: Manages backend aspects of the on-chain referral program.
-   **Admin Control**: Provides secure endpoints for administrative operations on the deployed smart contracts.

## Getting Started
### Installation
To set up the backend service:
```bash
# Assuming this backend lives in a 'backend' subdirectory within your project root
cd backend
npm install
npm run dev
```

### Environment Variables
Configure the following environment variables in a `.env` file for the backend:

| Variable                | Purpose                                      | Example / Notes                                      |
| :---------------------- | :------------------------------------------- | :--------------------------------------------------- |
| `MONGODB_URI`           | MongoDB connection string                    | `mongodb://localhost:27017/ghostintel` (required in prod) |
| `FULLENRICH_API_KEY`    | FullEnrich API key for profile enrichment    | `your_fullenrich_api_key` (optional, mock used if absent) |
| `GEMINI_API_KEY`        | Gemini AI key (`@google/genai`)              | `your_gemini_api_key` (optional, mock used if absent) |
| `GEMINI_MODEL`          | Gemini model selection                       | `gemini-3-flash-preview`                             |
| `SIGNUP_BONUS_CREDITS`  | Free credits for new wallets                 | `3`                                                  |
| `FRONTEND_ORIGIN`       | CORS allowed origins (comma-separated)       | `http://localhost:3000,https://yourfrontend.com`     |
| `GHOSTCREDITS_ADDRESS`  | `GhostCredits` contract address              | `0x592818F05E5EbA208D1A58E7d382D74171ee19a9` (set after deployment) |
| `GHOSTNFT_ADDRESS`      | `GhostNFT` contract address                  | `0x6091f4ff7dc215830d0b7b83d67bbe9096b95601` (set after deployment) |
| `ADMIN_PRIVATE_KEY`     | Private key for admin transactions           | `0x...` (keep secret)                                |
| `ADMIN_API_KEY`         | API key protecting admin endpoints           | `your_admin_api_key` (keep secret)                   |

## API Documentation
### Base URL
`https://ghost-intel-backend.onrender.com/api`

### Endpoints
#### POST /api/search
**Overview**: Enrich a LinkedIn profile, generate an AI opener, deduct 1 credit (if `wallet` provided), and record history.
**Request**:
```json
{
  "linkedinUrl": "https://www.linkedin.com/in/demoge/",
  "wallet": "0xTESTWALLET"
}
```
**Response**:
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
**Errors**:
- `400`: Invalid input (e.g., malformed `linkedinUrl`).
- `402`: Insufficient credits for the provided `wallet`.
- `500`: Internal server error.

#### POST /api/search/regenerate
**Overview**: Re-run AI opener generation for an existing `SearchResult` (costs 1 credit when `wallet` provided).
**Request**:
```json
{
  "id": "<searchResultId>",
  "wallet": "0xUSERWALLET"
}
```
**Response**:
```json
{
  "data": {
    "id": "<searchResultId>",
    "linkedinUrl": "https://www.linkedin.com/in/demoge/",
    "fullName": "Grégoire Demoge",
    "jobTitle": "Co-founder",
    "companyName": "FullEnrich",
    "email": "greg@fullenrich.com",
    "phone": "+33 6 12 34 56 78",
    "opener": "A newly generated opener message.",
    "geminiModel": "gemini-3-flash-preview",
    "geminiUsageSummary": { "totalTokenCount": 550 },
    "openerHistory": [
      {
        "text": "An older opener message.",
        "createdAt": "2026-01-30T06:33:50.982Z",
        "geminiModel": "gemini-3-flash-preview"
      },
      {
        "text": "A newly generated opener message.",
        "createdAt": "2026-01-30T06:35:00.000Z",
        "geminiModel": "gemini-3-flash-preview"
      }
    ]
  }
}
```
**Errors**:
- `400`: Invalid input (e.g., `id` not found or malformed).
- `402`: Insufficient credits for the provided `wallet`.
- `500`: Internal server error.

#### GET /api/credits/:wallet
**Overview**: Returns the current credit balance for a given wallet address. If the wallet does not exist, it is created and granted a signup bonus.
**Request**:
[No request body; `wallet` address is part of the path.]

**Response**:
```json
{
  "wallet": "0xUSERWALLET",
  "balance": 3
}
```
**Errors**:
- `500`: Internal server error.

#### GET /api/history/:wallet
**Overview**: Returns a lightweight list of search history entries for a given wallet.
**Request**:
[No request body; `wallet` address is part of the path.]

**Response**:
```json
[
  {
    "searchId": "697c50ceda4a0b5f8f6a42ea",
    "linkedinUrl": "https://www.linkedin.com/in/demoge/",
    "recordedAt": "2026-01-30T06:33:50.982Z"
  },
  {
    "searchId": "70abcde123f456g789h012b3",
    "linkedinUrl": "https://www.linkedin.com/in/example/",
    "recordedAt": "2026-01-30T07:00:00.000Z"
  }
]
```
**Errors**:
- `500`: Internal server error.

#### POST /api/buy-credits
**Overview**: Adds credits to a specified wallet after payment confirmation (payment verification should occur externally before this call).
**Request**:
```json
{
  "wallet": "0xUSERWALLET",
  "amount": 5
}
```
**Response**:
```json
{
  "message": "Credits successfully added to wallet.",
  "newBalance": 8
}
```
**Errors**:
- `400`: Invalid input (e.g., `amount` is zero or negative).
- `500`: Internal server error.

#### POST /api/deduct (Admin)
**Overview**: Manually deducts a specified amount of credits from a wallet.
**Request**:
```json
{
  "wallet": "0xUSERWALLET",
  "amount": 1
}
```
**Response**:
```json
{
  "message": "Credits deducted successfully.",
  "newBalance": 7
}
```
**Errors**:
- `401`: Unauthorized (missing or invalid `ADMIN_API_KEY` header).
- `400`: Invalid input (e.g., `amount` is invalid, or insufficient credits on-chain).
- `500`: Internal server error.

#### POST /api/record (Admin)
**Overview**: Manually pushes an entry to a wallet's search history.
**Request**:
```json
{
  "wallet": "0xUSERWALLET",
  "searchId": "697c50ceda4a0b5f8f6a42ea"
}
```
**Response**:
```json
{
  "message": "Search history entry recorded successfully."
}
```
**Errors**:
- `401`: Unauthorized (missing or invalid `ADMIN_API_KEY` header).
- `400`: Invalid input (e.g., `searchId` malformed).
- `500`: Internal server error.

#### POST /api/admin/pause
**Overview**: Pauses the `GhostCredits` smart contract, preventing certain state-changing operations.
**Request**:
[No request body required.]

**Response**:
```json
{
  "message": "GhostCredits contract paused."
}
```
**Errors**:
- `401`: Unauthorized (missing or invalid `ADMIN_API_KEY` header).
- `500`: Internal server error (e.g., only contract owner can call).

#### POST /api/admin/unpause
**Overview**: Unpauses the `GhostCredits` smart contract, allowing all operations.
**Request**:
[No request body required.]

**Response**:
```json
{
  "message": "GhostCredits contract unpaused."
}
```
**Errors**:
- `401`: Unauthorized (missing or invalid `ADMIN_API_KEY` header).
- `500`: Internal server error (e.g., only contract owner can call).

#### POST /api/admin/set-credits-per-eth
**Overview**: Sets the rate of credits received per ETH for purchases.
**Request**:
```json
{
  "value": 2000
}
```
**Response**:
```json
{
  "message": "Credits per ETH rate updated."
}
```
**Errors**:
- `401`: Unauthorized (missing or invalid `ADMIN_API_KEY` header).
- `400`: Invalid input (e.g., `value` is zero or negative).
- `500`: Internal server error (e.g., only contract owner can call).

#### POST /api/admin/set-credits-per-usdc
**Overview**: Sets the rate of credits received per USDC for purchases.
**Request**:
```json
{
  "value": 100
}
```
**Response**:
```json
{
  "message": "Credits per USDC rate updated."
}
```
**Errors**:
- `401`: Unauthorized (missing or invalid `ADMIN_API_KEY` header).
- `400`: Invalid input (e.g., `value` is zero or negative).
- `500`: Internal server error (e.g., only contract owner can call).

#### POST /api/admin/set-nft-contract
**Overview**: Sets the address of the `GhostNFT` contract that `GhostCredits` interacts with.
**Request**:
```json
{
  "address": "0xNewNFTContractAddress"
}
```
**Response**:
```json
{
  "message": "NFT contract address updated in GhostCredits."
}
```
**Errors**:
- `401`: Unauthorized (missing or invalid `ADMIN_API_KEY` header).
- `400`: Invalid input (e.g., `address` is malformed).
- `500`: Internal server error (e.g., only contract owner can call).

#### POST /api/admin/set-referral-bonus
**Overview**: Sets the percentage of bonus credits awarded to referrers.
**Request**:
```json
{
  "percent": 15
}
```
**Response**:
```json
{
  "message": "Referral bonus percentage updated."
}
```
**Errors**:
- `401`: Unauthorized (missing or invalid `ADMIN_API_KEY` header).
- `400`: Invalid input (e.g., `percent` is too high, max 50).
- `500`: Internal server error (e.g., only contract owner can call).

#### POST /api/admin/withdraw-eth
**Overview**: Allows the contract owner to withdraw accumulated ETH from the `GhostCredits` contract.
**Request**:
[No request body required.]

**Response**:
```json
{
  "message": "ETH successfully withdrawn from contract."
}
```
**Errors**:
- `401`: Unauthorized (missing or invalid `ADMIN_API_KEY` header).
- `500`: Internal server error (e.g., only contract owner can call, or no ETH balance).

#### POST /api/admin/withdraw-usdc
**Overview**: Allows the contract owner to withdraw accumulated USDC from the `GhostCredits` contract.
**Request**:
[No request body required.]

**Response**:
```json
{
  "message": "USDC successfully withdrawn from contract."
}
```
**Errors**:
- `401`: Unauthorized (missing or invalid `ADMIN_API_KEY` header).
- `500`: Internal server error (e.g., only contract owner can call, or no USDC balance).

#### POST /api/admin/transfer-ownership
**Overview**: Transfers ownership of the `GhostCredits` contract to a new address.
**Request**:
```json
{
  "newOwner": "0xNewOwnerAddress"
}
```
**Response**:
```json
{
  "message": "Contract ownership transferred."
}
```
**Errors**:
- `401`: Unauthorized (missing or invalid `ADMIN_API_KEY` header).
- `400`: Invalid input (e.g., `newOwner` is malformed).
- `500`: Internal server error (e.g., only current owner can call).

#### POST /api/admin/renounce-ownership
**Overview**: Renounces ownership of the `GhostCredits` contract, making it unowned and irreversible.
**Request**:
[No request body required.]

**Response**:
```json
{
  "message": "Contract ownership renounced."
}
```
**Errors**:
- `401`: Unauthorized (missing or invalid `ADMIN_API_KEY` header).
- `500`: Internal server error (e.g., only current owner can call).

---

## 🤝 Contributing

We welcome contributions to Ghost Intel! If you're interested in improving the project, please follow these guidelines:

*   **Fork the repository**: Start by forking the project to your GitHub account.
*   **Create a new branch**: For each new feature or bug fix, create a dedicated branch (e.g., `feature/add-dark-mode` or `fix/login-bug`).
*   **Commit with clear messages**: Write concise and descriptive commit messages that explain your changes.
*   **Submit a Pull Request**: Once your changes are ready, open a pull request against the `main` branch. Provide a clear description of your changes and reference any related issues.
*   **Code Style**: Ensure your code adheres to the existing style and best practices.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## 🧑‍💻 Author Info

-   **Your Name**: [Your LinkedIn Profile](https://linkedin.com/in/your_username)
-   **Your Name**: [Your X (formerly Twitter) Profile](https://x.com/your_username)

---
[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)
