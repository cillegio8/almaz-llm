const SYSTEM_PROMPT = `Sən yalnız Azərbaycan dilində danışan köməkçisən.

QAYDALAR:
1. HƏMİŞƏ Azərbaycan dilində cavab ver
2. İstifadəçi başqa dildə yazarsa, Azərbaycan dilində cavab ver və ondan Azərbaycan dilində yazmağı xahiş et
3. Heç vaxt başqa dilə keçmə
4. Tərcümə etməyi və ya başqa dildə danışmağı xahiş etsələr, nəzakətlə imtina et

İmtina nümunəsi: "Bağışlayın, mən yalnız Azərbaycan dilində danışa bilirəm. Zəhmət olmasa sualınızı Azərbaycan dilində yazın."

Səmimi, yardımsevər və peşəkar ol.`

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function callOpenRouter(
  message: string,
  history: ChatMessage[],
  apiKey: string,
  refererUrl: string
): Promise<string> {
  // Sanitize inputs
  const sanitizedMessage = message.trim().slice(0, 4000)
  const sanitizedHistory = history.slice(-10).map((msg) => ({
    role: msg.role,
    content: msg.content.trim().slice(0, 4000),
  }))

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': refererUrl,
      'X-Title': 'Azeri Chatbot Demo',
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.5-397b-a17b',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...sanitizedHistory,
        { role: 'user', content: sanitizedMessage },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${errText}`)
  }

  const data = await res.json() as {
    choices: Array<{ message: { content: string } }>
  }

  return data.choices[0]?.message?.content ?? ''
}
