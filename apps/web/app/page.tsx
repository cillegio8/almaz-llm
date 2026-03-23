'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cormorant_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'
import AuthButton from '@/components/AuthButton'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant'
})

export default function HomePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        if (error.message.includes('Refresh Token Not Found')) {
          supabase.auth.signOut().catch(() => {})
        }
        console.error('Session check error:', error)
        setChecking(false)
        return
      }
      if (session) {
        router.replace('/chat')
      } else {
        setChecking(false)
      }
    }).catch((err) => {
      console.error('Unhandled session error:', err)
      setChecking(false)
    })
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0B0D]">
        <div className="w-8 h-8 border-4 border-[#C9A962] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#0A0B0D] text-[#F5F5F7] ${cormorant.variable}`}
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* Subtle background gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201,169,98,0.10), transparent)'
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div
          className="text-[#C9A962] font-semibold tracking-widest text-lg cursor-pointer select-none"
          style={{ fontFamily: 'var(--font-sans)' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ALMAZ<span className="text-[#F5F5F7] font-light">.</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="/about"
            className="text-xs text-[#A8AAB0] hover:text-[#C9A962] uppercase tracking-widest transition-colors"
          >
            Haqqımızda
          </a>
        </div>
      </nav>

      {/* Main content — centered */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Branding */}
        <div className="text-center mb-10">
          <h1
            className="text-6xl sm:text-7xl font-light text-[#F5F5F7] tracking-tight mb-3 leading-none"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ALMAZ
          </h1>
          <p
            className="text-sm text-[#C9A962] uppercase tracking-[0.3em] mb-5"
          >
            الماز · алмаз · almaz
          </p>
          <p className="text-[#A8AAB0] text-base max-w-sm mx-auto leading-relaxed">
            Azərbaycan dilində anlama və cavab vermək üçün yaradılmış süni intellekt.
          </p>
        </div>

        {/* Auth form */}
        <div className="w-full max-w-sm">
          <AuthButton />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex items-center justify-between px-8 py-4 border-t border-white/5">
        <span className="text-xs text-[#A8AAB0]">© 2025 ALMAZ</span>
        <a
          href="/about"
          className="text-xs text-[#A8AAB0] hover:text-[#C9A962] transition-colors"
        >
          Haqqımızda
        </a>
      </footer>
    </div>
  )
}
