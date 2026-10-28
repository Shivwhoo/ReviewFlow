<div align="center">

# ReviewFlow

**Turn happy customers into 5-star reviews in under 30 seconds.**

Customers scan a QR code, pick a few quick tags, and get an AI-drafted review they can copy straight to Google. No blank-page problem, no friction.

[Live Demo](https://review-flow-rho.vercel.app) · [Report a Bug](https://github.com/Shivwhoo/ReviewFlow/issues) · [Request a Feature](https://github.com/Shivwhoo/ReviewFlow/issues)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)

</div>

---

## The Problem

Most happy customers never leave a review. Not because they don't want to, but because staring at an empty text box is hard. Local businesses lose visibility and trust as a result.

## The Solution

ReviewFlow removes the friction:

1. **Scan** a QR code placed at the counter, table or receipt.
2. **Choose** a star rating, tone, language and a few tags about the experience.
3. **Get** a natural-sounding review drafted by AI, in English or Hinglish.
4. **Copy and post** it to Google in one tap.

Business owners get a dashboard showing scans, generated reviews, copies and conversion rates, so they can see exactly how the QR codes are performing.

---

## Features

### For customers
- Instant review generation with no login required
- Tone and language selection (including Hinglish)
- Quick tag selection to personalize the review
- Smooth animations: star ripples, copy feedback
- Built-in fallback generators if the AI is unavailable

### For business owners
- Onboarding wizard that trains the AI on your business
- Multi-location support with shared business profiles
- QR code management (create, download as SVG/PNG, track per location)
- Analytics dashboard with daily trends and conversion funnel (Recharts)
- Credit-based usage

### For admins
- Platform-wide stats
- Abuse and spam detection
- Business management
- Batch generation of physical QR codes

### Under the hood
- **Multi-key Groq rotation** to avoid rate limits
- **Prompt minification** to cut token usage and latency
- **Redis caching** for QR redirects and prompt responses
- **Sliding-window rate limiting** (Upstash)
- **Privacy-first tracking**: customer IPs are salted and hashed, never stored raw
- **Role-based access** (business / admin) via NextAuth v5 and middleware

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4, Framer Motion, lucide-react |
| Auth | NextAuth v5 (JWT sessions) + MongoDB adapter |
| Database | MongoDB with Mongoose |
| Cache and limits | Upstash Redis, `@upstash/ratelimit` |
| AI | Groq SDK |
| Validation | Zod |
| Data fetching | TanStack React Query |
| Charts | Recharts |
| Drag and drop | dnd-kit |
| QR codes | `qrcode` |

---

## Project Structure

```
ReviewFlow/
├── app/
│   ├── page.tsx              # Landing page with live demo
│   ├── r/[qrId]/             # Public customer review page
│   ├── dashboard/            # Business owner area (onboarding, analytics, QR codes)
│   ├── admin/                # Super admin panel
│   └── api/
│       ├── business/         # Business APIs (settings, analytics, qr-codes, locations, tags, by-qr)
│       ├── review/           # generate and track
│       └── admin/            # Admin APIs (stats, abuse, businesses, qr-codes/batch)
├── components/
│   ├── review/               # Customer review flow
│   ├── dashboard/            # Sidebar and dashboard UI
│   ├── landing/              # Demo preview
│   └── admin/                # Admin modals and wizards
├── lib/
│   ├── db/                   # Mongoose and MongoClient connections, models
│   ├── groq/                 # AI client, prompt builder
│   ├── redis/                # Redis client
│   ├── qr/                   # QR id and image generation
│   ├── utils/                # Cache keys, IP hashing, AI context
│   └── validations/          # Zod schemas
├── auth.ts / auth.config.ts  # NextAuth setup
└── middleware.ts             # Route protection and role checks
```

---

## How It Works

```
Customer scans QR
      │
      ▼
/r/[qrId]  ──►  GET /api/business/by-qr      (cached in Redis)
      │
      ▼
Picks stars, tone, language, tags
      │
      ▼
POST /api/review/generate  ──►  rate limit ► deduct credit ► build prompt ► Groq
      │
      ▼
Customer copies the review
      │
      ▼
POST /api/review/track     ──►  ReviewScan updated (scan → generated → copied)
      │
      ▼
Business dashboard shows analytics
```

---

## Getting Started

### Prerequisites
- Node.js 20 or newer
- A MongoDB database (MongoDB Atlas works well)
- An Upstash Redis database
- One or more Groq API keys

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/Shivwhoo/ReviewFlow.git
cd ReviewFlow

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# then fill in the values (see below)

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env.local` and fill in every value. You will need credentials for:

| Purpose | What to provide |
|---|---|
| MongoDB | Connection string |
| NextAuth | Auth secret and app URL |
| Upstash Redis | REST URL and token |
| Groq | One or more API keys |
| IP hashing | A random salt |

Check `.env.example` for the exact variable names. Never commit `.env.local`.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase |

---

## Deployment

The easiest way to deploy is [Vercel](https://vercel.com):

1. Push the repo to GitHub
2. Import it in Vercel
3. Add the environment variables from `.env.example`
4. Deploy

---

## Roadmap

- [ ] Modularize the review flow into reusable subcomponents
- [ ] Share one onboarding wizard between the dashboard and admin
- [ ] Webhook support
- [ ] More languages beyond English and Hinglish
- [ ] Multi-platform review links (beyond Google)

---

## Contributing

Contributions, issues and feature requests are welcome. Fork the repo, create a branch, and open a pull request.

---

## Author

Built by [@Shivwhoo](https://github.com/Shivwhoo).

If this project helped you, consider giving it a star.