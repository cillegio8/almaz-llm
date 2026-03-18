'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LimitReachedPage() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-5xl">🎯</span>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">
            Pulsuz limitiniz bitdi
          </h1>
          <p className="text-gray-600 text-lg">
            16 pulsuz sualınızdan istifadə etdiniz.
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-left space-y-3">
          <h2 className="font-semibold text-amber-900">Nə baş verdi?</h2>
          <p className="text-amber-800 text-sm">
            Hər istifadəçi 16 pulsuz sual hüququna malikdir. Bu demo versiya üçün
            məhdudiyyət belədir. Bizimlə əlaqə saxlayaraq daha çox hüquq əldə edə bilərsiniz.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <a
            href="mailto:info@example.com"
            className="block w-full bg-accent-600 hover:bg-accent-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            Bizimlə əlaqə saxlayın
          </a>
          <button
            onClick={handleSignOut}
            className="block w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl border border-gray-200 transition-colors"
          >
            Çıxış
          </button>
        </div>
      </div>
    </main>
  )
}
