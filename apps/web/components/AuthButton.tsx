'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Mode = 'signin' | 'signup'

export default function AuthButton() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    const supabase = createClient()

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setSuccessMsg('Təsdiq e-poçtu göndərildi. Zəhmət olmasa e-poçtunuzu yoxlayın.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('E-poçt və ya şifrə yanlışdır.')
      } else {
        router.replace('/chat')
      }
    }

    setLoading(false)
  }

  return (
    <div className="bg-midnight-light rounded-2xl border border-midnight-lighter shadow-xl p-6 text-left space-y-5">
      {/* Mode tabs */}
      <div className="flex rounded-xl bg-midnight p-1">
        {(['signin', 'signup'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(null); setSuccessMsg(null) }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === m
                ? 'bg-midnight-lighter text-pearl shadow-sm'
                : 'text-silver hover:text-pearl'
            }`}
          >
            {m === 'signin' ? 'Daxil ol' : 'Qeydiyyat'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-silver mb-1.5">
            E-poçt
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full px-4 py-2.5 bg-midnight rounded-xl border border-midnight-lighter text-sm md:text-base text-pearl outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all placeholder:text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-silver mb-1.5">
            Şifrə
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-midnight rounded-xl border border-midnight-lighter text-sm md:text-base text-pearl outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all placeholder:text-gray-600"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {successMsg && (
          <p className="text-sm text-green-400 bg-green-900/20 border border-green-900/50 rounded-lg px-3 py-2">
            {successMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold hover:bg-gold-light disabled:bg-midnight-lighter disabled:text-silver text-midnight font-medium py-3 rounded-xl transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-midnight border-t-transparent border-l-transparent opacity-50 rounded-full animate-spin" />
              Yüklənir...
            </span>
          ) : mode === 'signin' ? 'Daxil ol' : 'Qeydiyyatdan keç'}
        </button>
      </form>
    </div>
  )
}
