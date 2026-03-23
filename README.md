# ALMAZ — Azerbaijani AI Chatbot

A full-stack Azerbaijani-language AI chatbot. Users register with email/password, receive 20 free questions per 8-hour window, and interact with an LLM constrained to respond only in Azerbaijani.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Next.js Frontend (Cloudflare Pages)        │
│  apps/web/                                  │
│  - Landing page with email/password auth    │
│  - Chat interface with usage counter        │
│  - Limit-reached page                       │
└────────────────────┬────────────────────────┘
                     │ REST (JWT Bearer)
┌────────────────────▼────────────────────────┐
│  Cloudflare Worker (Edge API)               │
│  workers/chat-api/                          │
│  - JWT verification (no external deps)      │
│  - Rate limiting via Supabase               │
│  - OpenRouter LLM proxy                    │
└────────────┬───────────────┬────────────────┘
             │               │
┌────────────▼──┐   ┌────────▼────────────────┐
│  Supabase     │   │  OpenRouter API          │
│  - Auth       │   │  - qwen/qwen-2.5-72b     │
│  - user_usage │   │    -instruct             │
└───────────────┘   └─────────────────────────┘
```

## Local Development

### Prerequisites

- Node.js 18+
- npm
- A Supabase project
- An OpenRouter API key
- Wrangler CLI (`npm install -g wrangler`)

### 1. Clone & Install

```bash
# Install frontend dependencies
cd apps/web
npm install

# Install worker dependencies
cd ../../workers/chat-api
npm install
```

### 2. Environment Variables

#### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_WORKER_URL=http://localhost:8787
```

#### Worker (`workers/chat-api/.dev.vars`)

```env
OPENROUTER_API_KEY=sk-or-v1-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

> Find your JWT secret in Supabase Dashboard → Settings → API → JWT Settings → JWT Secret

### 3. Run Locally

```bash
# Terminal 1 — start the Cloudflare Worker
cd workers/chat-api
npm run dev

# Terminal 2 — start the Next.js frontend
cd apps/web
npm run dev
```

Open http://localhost:3000

---

## Supabase Configuration

### Step 1: Create a Supabase Project

1. Go to https://supabase.com and create a new project
2. Note your **Project URL** and **anon key** from Settings → API

### Step 2: Run the Database Migration

In the Supabase Dashboard, open the **SQL Editor** and run:

```
supabase/migrations/001_create_usage_table.sql
```

This creates the `user_usage` table with RLS policies and an auto-insert trigger for new users.

### Step 3: Configure Email Auth

1. In Supabase Dashboard → Authentication → Providers → Email: ensure it is enabled
2. Optionally disable **Confirm email** (Dashboard → Auth → Settings) if you want instant access without email verification
3. In Supabase Dashboard → Authentication → URL Configuration:
   - **Site URL**: `https://almaz-llm.pages.dev` (or `http://localhost:3000` for local dev)

---

## OpenRouter API Key

1. Sign up at https://openrouter.ai
2. Go to **Keys** and create a new API key
3. The app uses `qwen/qwen-2.5-72b-instruct` — check current pricing on OpenRouter
4. Optionally set spending limits for cost control

---

## Cloudflare Deployment

### Deploy the Worker

```bash
cd workers/chat-api

# Login to Cloudflare
wrangler login

# Set production secrets (run once each, paste value when prompted)
wrangler secret put OPENROUTER_API_KEY
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put SUPABASE_JWT_SECRET

# Deploy
wrangler deploy
```

Note the Worker URL (e.g. `https://azeri-chatbot-api.your-subdomain.workers.dev`).

**CORS**: Allowed origins are configured in `workers/chat-api/src/index.ts`. Currently:
- `http://localhost:3000`
- `https://almaz-llm.pages.dev`
- `https://almaz.adventa.az`

Add any new domains there and redeploy.

### Deploy the Frontend to Cloudflare Pages (GitHub integration)

1. Push this repo to GitHub
2. In Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
3. Select your repo and set:
   - **Root directory**: `apps/web`
   - **Build command**: `npx @cloudflare/next-on-pages`
   - **Output directory**: `.vercel/output/static`
4. Environment variables are managed via `apps/web/wrangler.toml` — update the `[vars]` section with your values before pushing:

```toml
[vars]
NEXT_PUBLIC_SUPABASE_URL = "https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY = "your-anon-key"
NEXT_PUBLIC_WORKER_URL = "https://azeri-chatbot-api.your-subdomain.workers.dev"
```

Every push to `main` triggers an automatic redeploy.

---

## Customization

### Change the Question Limit or Reset Window

- Default is **20 questions** per **8-hour** rolling window
- To change the limit: update `MAX_QUESTIONS` in `workers/chat-api/src/rateLimit.ts`
- To change the reset window: update `RESET_WINDOW_MS` in the same file

### Change the LLM Model

In `workers/chat-api/src/llm.ts`, update the `model` field:

```typescript
model: 'qwen/qwen-2.5-72b-instruct',  // change this
```

See available models at https://openrouter.ai/models

### Update the System Prompt

The Azerbaijani-only system prompt is in `workers/chat-api/src/llm.ts` in the `SYSTEM_PROMPT` constant.

### Update Contact Email

On the limit-reached page (`apps/web/app/limit-reached/page.tsx`), search for `info@example.com` and replace it.

---

## Project Structure

```
almaz-llm/
├── apps/
│   └── web/                    # Next.js frontend (Cloudflare Pages)
│       ├── app/
│       │   ├── page.tsx        # Landing / auth page
│       │   ├── chat/page.tsx   # Main chat interface
│       │   ├── limit-reached/  # Usage limit page
│       │   └── auth/callback/  # Auth callback route (edge runtime)
│       ├── components/
│       │   ├── ChatWindow.tsx
│       │   ├── MessageBubble.tsx  # Renders markdown in assistant replies
│       │   ├── AuthButton.tsx     # Email/password sign-in + sign-up form
│       │   ├── UsageCounter.tsx
│       │   └── LanguageNotice.tsx
│       ├── lib/
│       │   ├── supabase.ts     # Supabase browser client
│       │   └── api.ts          # Worker API client
│       └── wrangler.toml       # Cloudflare Pages config + public env vars
│
├── workers/
│   └── chat-api/               # Cloudflare Worker (Edge API)
│       └── src/
│           ├── index.ts        # Request router + CORS
│           ├── auth.ts         # JWT verification (Web Crypto API)
│           ├── llm.ts          # OpenRouter API client
│           └── rateLimit.ts    # 20 questions / 8-hour reset logic
│
└── supabase/
    └── migrations/
        └── 001_create_usage_table.sql
```
