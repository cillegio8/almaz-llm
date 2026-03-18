export interface JWTPayload {
  sub: string
  email?: string
  exp: number
  iat: number
  role?: string
}

export async function verifySupabaseJWT(
  token: string,
  jwtSecret: string
): Promise<JWTPayload | null> {
  try {
    // Decode the JWT parts
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerB64, payloadB64, signatureB64] = parts

    // Verify signature using HMAC-SHA256
    const encoder = new TextEncoder()
    const keyData = encoder.encode(jwtSecret)
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const messageToVerify = encoder.encode(`${headerB64}.${payloadB64}`)

    // Decode base64url signature
    const signature = base64UrlDecode(signatureB64)

    const valid = await crypto.subtle.verify('HMAC', key, signature, messageToVerify)
    if (!valid) return null

    // Decode payload
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payloadB64))
    ) as JWTPayload

    // Check expiry
    if (payload.exp < Math.floor(Date.now() / 1000)) return null

    return payload
  } catch {
    return null
  }
}

function base64UrlDecode(str: string): Uint8Array {
  // Convert base64url to base64
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
