export interface UsageRecord {
  id: string
  questions_used: number
  max_questions: number
}

export async function checkAndIncrementUsage(
  userId: string,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<{ allowed: boolean; used: number; max: number }> {
  // Fetch current usage
  const fetchRes = await fetch(
    `${supabaseUrl}/rest/v1/user_usage?id=eq.${userId}&select=questions_used,max_questions`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!fetchRes.ok) {
    // If no row exists, create one
    if (fetchRes.status === 404) {
      await fetch(`${supabaseUrl}/rest/v1/user_usage`, {
        method: 'POST',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ id: userId }),
      })
      return { allowed: true, used: 0, max: 16 }
    }
    throw new Error('Failed to fetch usage')
  }

  const records = await fetchRes.json() as UsageRecord[]

  if (!records || records.length === 0) {
    // Create usage row if doesn't exist
    await fetch(`${supabaseUrl}/rest/v1/user_usage`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ id: userId }),
    })
    return { allowed: true, used: 0, max: 16 }
  }

  const record = records[0]

  if (record.questions_used >= record.max_questions) {
    return { allowed: false, used: record.questions_used, max: record.max_questions }
  }

  // Increment usage
  const newCount = record.questions_used + 1
  await fetch(
    `${supabaseUrl}/rest/v1/user_usage?id=eq.${userId}`,
    {
      method: 'PATCH',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        questions_used: newCount,
        last_question_at: new Date().toISOString(),
      }),
    }
  )

  return { allowed: true, used: newCount, max: record.max_questions }
}
