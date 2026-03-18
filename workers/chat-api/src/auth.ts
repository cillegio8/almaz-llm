export interface JWTPayload {
  sub: string
  email?: string
  exp: number
  iat: number
  role?: string
}

export async function verifySupabaseJWT(
  token: string,
  supabaseUrl: string,
  supabaseServiceRoleKey: string
): Promise<JWTPayload | null> {
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseServiceRoleKey,
      },
    })

    if (!res.ok) return null

    const user = await res.json() as { id: string; email?: string }
    if (!user?.id) return null

    // Decode exp/iat from the token for compatibility
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))

    return {
      sub: user.id,
      email: user.email,
      exp: payload.exp,
      iat: payload.iat,
      role: payload.role,
    }
  } catch {
    return null
  }
}
