import { verifySupabaseJWT } from './auth'
import { checkAndIncrementUsage } from './rateLimit'
import { callOpenRouter } from './llm'

export interface Env {
  OPENROUTER_API_KEY: string
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  SUPABASE_JWT_SECRET: string
  ENVIRONMENT: string
}

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://almaz-llm.pages.dev',
  'https://almaz.adventa.az',
]

function corsHeaders(origin: string | null): HeadersInit {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

function jsonResponse(data: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin')

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      })
    }

    const url = new URL(request.url)

    // Health check
    if (url.pathname === '/health') {
      return jsonResponse({ status: 'ok' }, 200, origin)
    }

    // Chat endpoint
    if (url.pathname === '/chat' && request.method === 'POST') {
      // 1. Extract JWT
      const authHeader = request.headers.get('Authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return jsonResponse({ error: 'unauthorized' }, 401, origin)
      }
      const token = authHeader.slice(7)

      // 2. Verify JWT
      const payload = await verifySupabaseJWT(token, env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
      if (!payload) {
        return jsonResponse({ error: 'invalid_token' }, 401, origin)
      }

      // 3. Parse request body
      let body: { message: string; history: Array<{ role: string; content: string }> }
      try {
        body = await request.json()
      } catch {
        return jsonResponse({ error: 'invalid_json' }, 400, origin)
      }

      if (!body.message || typeof body.message !== 'string') {
        return jsonResponse({ error: 'message_required' }, 400, origin)
      }

      // 4. Check & increment usage
      const usageResult = await checkAndIncrementUsage(
        payload.sub,
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      )

      if (!usageResult.allowed) {
        return jsonResponse({ error: 'limit_reached', message: 'Suallarınız bitdi. 8 saat sonra yenidən cəhd edin.' }, 429, origin)
      }

      // 5. Call LLM
      let response: string
      try {
        response = await callOpenRouter(
          body.message,
          (body.history ?? []) as Array<{ role: 'user' | 'assistant'; content: string }>,
          env.OPENROUTER_API_KEY,
          `https://${url.hostname}`
        )
      } catch (err) {
        console.error('LLM error:', err)
        return jsonResponse({ error: 'llm_error' }, 500, origin)
      }

      // 6. Return response
      return jsonResponse({ response, usage: { used: usageResult.used, max: usageResult.max } }, 200, origin)
    }

    return jsonResponse({ error: 'not_found' }, 404, origin)
  },
}
