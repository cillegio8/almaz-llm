'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AuthButton from '@/components/AuthButton'

export default function LandingPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/chat')
      } else {
        setChecking(false)
      }
    })
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Logo / Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-accent-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 8l2 1.5L12 22l8-12.5L22 8 12 2zm0 2.5l6.5 4-1.2.9L12 5.8l-5.3 3.6-1.2-.9L12 4.5zM6.2 10.3L12 8.2l5.8 2.1L12 19.5 6.2 10.3z"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">
            <span className="text-accent-600">ALMAZ</span>
          </h1>
          <p className="text-lg text-gray-600">
            Süni intellekt əsaslı köməkçiniz — yalnız Azərbaycan dilində
          </p>
        </div>

        {/* Feature bullets */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left space-y-4">
          {[
            { icon: '🇦🇿', text: 'Yalnız Azərbaycan dilində cavab verir' },
            { icon: '⚡', text: 'Sürətli və dəqiq cavablar' },
            { icon: '🎁', text: 'Hər 8 saatda 20 pulsuz sual' },
            { icon: '🔒', text: 'E-poçt ilə sürətli və təhlükəsiz giriş' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-gray-700">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Auth Button */}
        <AuthButton />

        {/* Footer note */}
        <p className="text-sm text-gray-400">
          Daxil olmaqla istifadə şərtlərini qəbul etmiş olursunuz
        </p>
      </div>
    </main>
  )
}
