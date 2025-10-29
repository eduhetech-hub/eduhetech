# EduHeTech - Firebase Starter (feature/firebase-starter)

This starter scaffolds a React + Vite + Tailwind frontend with Firebase Auth and Firestore wiring, plus Vercel Serverless API endpoints for secure point awarding and TRC20 (Tron testnet) payout placeholders.

Important: DO NOT commit secrets. Add Firebase service account JSON and other secrets to Vercel/Env.

Setup (local):

1. Install

```
npm install
```

2. Environment variables (create .env.local)

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- FIREBASE_SERVICE_ACCOUNT (stringified JSON) -- used by serverless functions
- TRON_PRIVATE_KEY (testnet private key for dev)
- TRON_FULL_NODE_URL (https://api.nileex.io or testnet node)
- TRON_EVENT_SERVER_URL
- TRON_SOLIDITY_NODE_URL

3. Run

```
npm run dev
```

API Endpoints (serverless - Vercel):
- /api/award -> Award points securely (verifies Firebase ID token)
- /api/execute-trc20-payout -> Admin-only TRC20 payout placeholder (testnet)

See src/ and api/ for implementation details.
