# Azərbaycan Dilli Chatbot

A full-stack Azerbaijani-language AI chatbot web application. Users authenticate via Google OAuth, receive 16 free questions, and interact with an LLM constrained to respond only in Azerbaijani.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Next.js Frontend (Cloudflare Pages)        │
│  apps/web/                                  │
│  - Landing page with Google OAuth           │
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
- npm or pnpm
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

Copy the example file and fill in your values:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_WORKER_URL=http://localhost:8787
```

#### Worker secrets (for local dev, use a `.dev.vars` file)

Create `workers/chat-api/.dev.vars`:

```env
OPENROUTER_API_KEY=sk-or-v1-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

> Find your JWT secret in Supabase Dashboard > Settings > API > JWT Settings > JWT Secret

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
2. Note your **Project URL** and **anon key** from Settings > API

### Step 2: Run the Database Migration

In the Supabase Dashboard, open the **SQL Editor** and run the contents of:

```
supabase/migrations/001_create_usage_table.sql
```

This creates the `user_usage` table with RLS policies and an auto-insert trigger for new users.

### Step 3: Enable Google OAuth

1. In Supabase Dashboard, go to **Authentication > Providers**
2. Enable **Google**
3. Create OAuth credentials at https://console.cloud.google.com:
   - Create a new OAuth 2.0 Client ID (Web application)
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret** into Supabase

### Step 4: Configure Redirect URLs

In Supabase Dashboard > Authentication > URL Configuration:

- **Site URL**: `https://your-app.pages.dev` (or `http://localhost:3000` for local dev)
- **Redirect URLs**: Add `https://your-app.pages.dev/auth/callback` and `http://localhost:3000/auth/callback`

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

# Set production secrets (run once each)
wrangler secret put OPENROUTER_API_KEY
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put SUPABASE_JWT_SECRET

# Deploy
npm run deploy
```

Note the Worker URL (e.g., `https://azeri-chatbot-api.your-subdomain.workers.dev`).

**Update CORS**: In `workers/chat-api/src/index.ts`, add your Cloudflare Pages URL to `ALLOWED_ORIGINS`.

### Deploy the Frontend to Cloudflare Pages

**Option A: Via Cloudflare Dashboard (recommended)**

1. Push this repo to GitHub
2. In Cloudflare Dashboard > Pages > Create a project
3. Connect your GitHub repo
4. Build settings:
   - Framework: Next.js
   - Build command: `cd apps/web && npm run pages:build`
   - Build output: `apps/web/.vercel/output/static`
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_WORKER_URL` (your deployed Worker URL)

**Option B: Via CLI**

```bash
cd apps/web
npm run pages:build
npm run pages:deploy
```

### Deploy the Frontend to Vercel (alternative)

```bash
cd apps/web
npx vercel --prod
```

Set environment variables in the Vercel dashboard.

---

## Customization

### Change the Question Limit

- Default is **16 questions** per user
- To change globally, update the `max_questions` default in the SQL migration
- To change per-user, update the `max_questions` column for specific users in the `user_usage` table

### Change the LLM Model

In `workers/chat-api/src/llm.ts`, update the `model` field:

```typescript
model: 'qwen/qwen-2.5-72b-instruct',  // change this
```

See available models at https://openrouter.ai/models

### Update the System Prompt

The system prompt enforcing Azerbaijani-only responses is in `workers/chat-api/src/llm.ts` in the `SYSTEM_PROMPT` constant.

### Update Contact Email

The contact email on the limit-reached page is in `apps/web/app/limit-reached/page.tsx`. Search for `info@example.com` and replace it.

---

## Project Structure

```
almaz-llm/
├── apps/
│   └── web/                    # Next.js 14 frontend
│       ├── app/
│       │   ├── page.tsx        # Landing / auth page
│       │   ├── chat/page.tsx   # Main chat interface
│       │   ├── limit-reached/  # Usage limit page
│       │   └── auth/callback/  # OAuth callback route
│       ├── components/
│       │   ├── ChatWindow.tsx
│       │   ├── MessageBubble.tsx
│       │   ├── AuthButton.tsx
│       │   ├── UsageCounter.tsx
│       │   └── LanguageNotice.tsx
│       └── lib/
│           ├── supabase.ts     # Supabase browser client
│           └── api.ts          # Worker API client
│
├── workers/
│   └── chat-api/               # Cloudflare Worker (Edge)
│       └── src/
│           ├── index.ts        # Request router + CORS
│           ├── auth.ts         # JWT verification (Web Crypto)
│           ├── llm.ts          # OpenRouter API client
│           └── rateLimit.ts    # Supabase usage tracking
│
└── supabase/
    └── migrations/
        └── 001_create_usage_table.sql
```
