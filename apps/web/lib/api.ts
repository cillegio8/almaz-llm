import type { Message } from '@/app/chat/page'

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8787'

export async function sendMessage(
  message: string,
  history: Message[],
  accessToken: string
): Promise<{
  response: string
  usage: { used: number; max: number }
  error?: string
}> {
  const res = await fetch(`${WORKER_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ message, history }),
  })

  if (res.status === 429) {
    return {
      response: '',
      usage: { used: 16, max: 16 },
      error: 'limit_reached',
    }
  }

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  return res.json()
}
