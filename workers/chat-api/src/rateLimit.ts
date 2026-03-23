const MAX_QUESTIONS = 20
const RESET_PERIOD_MS = 8 * 60 * 60 * 1000 // 8 hours

interface UsageRecord {
  questions_used: number
  last_question_at: string | null
  tokens_used: number
}

export async function addTokens(
  userId: string,
  supabaseUrl: string,
  serviceRoleKey: string,
  tokensToAdd: number
): Promise<void> {
  if (tokensToAdd <= 0) return
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  }
  // Use Postgres RPC to atomically increment tokens_used
  await fetch(`${supabaseUrl}/rest/v1/rpc/increment_tokens`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ user_id: userId, amount: tokensToAdd }),
  })
}

export async function checkAndIncrementUsage(
  userId: string,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<{ allowed: boolean; used: number; max: number }> {
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  }

  // Fetch current usage
  const fetchRes = await fetch(
    `${supabaseUrl}/rest/v1/user_usage?id=eq.${userId}&select=questions_used,last_question_at,tokens_used`,
    { headers }
  )

  let record: UsageRecord | null = null

  if (fetchRes.ok) {
    const records = await fetchRes.json() as UsageRecord[]
    record = records?.[0] ?? null
  }

  if (!record) {
    await fetch(`${supabaseUrl}/rest/v1/user_usage`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({ id: userId, questions_used: 1, last_question_at: new Date().toISOString() }),
    })
    return { allowed: true, used: 1, max: MAX_QUESTIONS }
  }

  // Check if 8-hour window has expired
  const periodStart = record.last_question_at ? new Date(record.last_question_at).getTime() : 0
  const periodExpired = Date.now() - periodStart >= RESET_PERIOD_MS

  if (periodExpired) {
    await fetch(`${supabaseUrl}/rest/v1/user_usage?id=eq.${userId}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({ questions_used: 1, last_question_at: new Date().toISOString() }),
    })
    return { allowed: true, used: 1, max: MAX_QUESTIONS }
  }

  if (record.questions_used >= MAX_QUESTIONS) {
    return { allowed: false, used: record.questions_used, max: MAX_QUESTIONS }
  }

  // Increment within current period
  const newCount = record.questions_used + 1
  await fetch(`${supabaseUrl}/rest/v1/user_usage?id=eq.${userId}`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({ questions_used: newCount }),
  })

  return { allowed: true, used: newCount, max: MAX_QUESTIONS }
}
