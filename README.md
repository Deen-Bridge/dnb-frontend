<div align="center">

# 🕌 Deen Bridge

**Authentic Islamic education — courses, books, community, and mentorship, with payments on Stellar.**

[![CI](https://github.com/Deen-Bridge/dnb-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/Deen-Bridge/dnb-frontend/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-blue.svg)](CONTRIBUTING.md)
[![Stellar](https://img.shields.io/badge/Payments-Stellar%20USDC-0e75dd.svg)](https://stellar.org)

[Live App](https://dnb-frontend.vercel.app) · [Report a Bug](https://github.com/Deen-Bridge/dnb-frontend/issues) · [Contribute](CONTRIBUTING.md)

</div>

---

## 📸 Screenshots

| Landing Page | Login / Sign Up |
|:---:|:---:|
| ![Landing Page](docs/screenshots/landing.png) | ![Login](docs/screenshots/login.png) |


---

## About

Deen Bridge is a modern learning platform that connects Muslims worldwide with authentic Islamic knowledge. Learners enroll in interactive courses, read from a digital library, join live community spaces, message mentors directly, and get instant answers from an Islamic-knowledge AI assistant. Courses and books are purchased with **USDC on the Stellar network** — non-custodial, with creators paid directly to their own wallets.

This repository is the web client. The platform is composed of three services:

| Repository | Role | Live |
|------------|------|------|
| **dnb-frontend** (this repo) | Next.js web application | [dnb-frontend.vercel.app](https://dnb-frontend.vercel.app) |
| [dnb-backend](https://github.com/Deen-Bridge/dnb-backend) | REST API — auth, content, Stellar payments | [dnb-backend-api.onrender.com](https://dnb-backend-api.onrender.com) |
| [dnb-ai](https://github.com/Deen-Bridge/dnb-ai) | FastAPI service for the AI assistant | [dnb-ai.onrender.com](https://dnb-ai.onrender.com) |

## ✨ Features

- 🎓 **Interactive Courses** — enroll, learn, review, and track progress
- 📚 **Digital Library** — read Islamic books online with a built-in PDF reader
- 💬 **Community Spaces** — live sessions and video rooms with mentors
- 🎬 **Reels** — short-form Islamic content
- ✉️ **Direct Messaging** — real-time chat between students and mentors
- 🤖 **AI Assistant** — Islamic-knowledge chatbot with conversation history
- ⭐ **Stellar Payments** — buy courses and books with USDC; creators are paid directly
- 👛 **Multi-Wallet Support** — Freighter, xBull, and Albedo via Stellar Wallets Kit
- 🔒 **Role-Based Access** — student, mentor, and admin experiences

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) · [React 19](https://react.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) · [Radix UI](https://www.radix-ui.com/) · [Framer Motion](https://www.framer.com/motion/) |
| Forms & Validation | [React Hook Form](https://www.react-hook-form.com/) · [Zod](https://zod.dev/) |
| Blockchain | [@stellar/stellar-sdk](https://github.com/stellar/js-stellar-sdk) · [Stellar Wallets Kit](https://github.com/creit-tech/stellar-wallets-kit) |
| Data & Media | [Axios](https://axios-http.com/) · [Firebase](https://firebase.google.com/) · Vidstack · pdf.js |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm (or yarn/pnpm)

### Setup

```bash
git clone https://github.com/Deen-Bridge/dnb-frontend.git
cd dnb-frontend
npm install
cp .env.example .env.local   # then fill in your values
npm run dev
```

The app runs at `http://localhost:3000`.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | No (default `http://localhost:5000`) | Base URL of the [dnb-backend](https://github.com/Deen-Bridge/dnb-backend) API |
| `NEXT_PUBLIC_AI_API_URL` | No (default `http://localhost:8000`) | Base URL of the [dnb-ai](https://github.com/Deen-Bridge/dnb-ai) AI assistant service |
| `NEXT_PUBLIC_STELLAR_NETWORK` | No (default `testnet`) | Stellar network — `testnet` or `mainnet` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | **Yes** | Cloudinary cloud name for unsigned image/video uploads |
| `NEXT_PUBLIC_JITSI_DOMAIN` | No (default `meet.jit.si`) | Jitsi Meet domain for live video spaces |
| `NEXT_PUBLIC_JITSI_REQUIRE_JWT` | No (default `false`) | Whether the Jitsi deployment requires a signed JWT token |
| `NEXT_PUBLIC_FIREBASE_*` | No | Firebase Web SDK config values (apiKey, authDomain, projectId, etc.) — defaults to the project's current values |

See `.env.example` for the full variable list with example values.

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## 🌊 Contributing & Drips Wave

This repository is hoping to  participates in the **[Stellar Drips Wave](https://www.drips.network/wave/stellar)** bounty program — contributors earn Points (and real rewards) for resolving this repo's issues during a Wave, with complexity tiers set in the Drips Wave app.

- All pull requests target the **`dev`** branch (`main` is releases only)
- CI (lint + build) must pass before review
- One contributor per issue — request it through the campaign (Drips Wave / GrantFox OSS); the maintainer assigns it. Please don't open a PR for an issue you haven't been assigned.

Read **[CONTRIBUTING.md](CONTRIBUTING.md)** for the full workflow, coding standards, and Wave rules.

## 📜 License

[MIT](LICENSE) © Deen Bridge

## 🔗 Links

- 🌐 Website: [dnb-frontend.vercel.app](https://dnb-frontend.vercel.app)
- 🐦 X/Twitter: [@deen_bridge](https://x.com/deen_bridge)
- 🏢 Organization: [github.com/Deen-Bridge](https://github.com/Deen-Bridge)
