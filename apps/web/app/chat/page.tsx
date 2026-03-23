'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { sendMessage } from '@/lib/api'
import ChatWindow from '@/components/ChatWindow'
import LanguageNotice from '@/components/LanguageNotice'
import UsageCounter from '@/components/UsageCounter'
import type { User } from '@supabase/supabase-js'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [usage, setUsage] = useState({ used: 0, max: 20 })
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error || !session) {
        if (error) {
          console.error('Chat page session check error:', error)
          if (error.message.includes('Refresh Token Not Found')) {
            supabase.auth.signOut().catch(() => {})
          }
        }
        router.replace('/')
        return
      }
      setUser(session.user)

      setLoading(false)
    }).catch((err) => {
      console.error('Chat page unhandled session error:', err)
      router.replace('/')
    })
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return

    const userMessage: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setSending(true)

    try {
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        if (error) console.error('Send message session error:', error)
        router.replace('/')
        return
      }

      const result = await sendMessage(
        text,
        messages,
        session.access_token
      )

      if (result.error === 'limit_reached') {
        router.replace('/limit-reached')
        return
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response,
      }
      setMessages((prev) => [...prev, assistantMessage])
      setUsage(result.usage)

      if (result.usage.used >= result.usage.max) {
        setTimeout(() => router.replace('/limit-reached'), 1500)
      }
    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.',
        },
      ])
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-midnight font-body">
      {/* Header */}
      <header className="bg-midnight-light border-b border-midnight-lighter px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-midnight" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 8l2 1.5L12 22l8-12.5L22 8 12 2zm0 2.5l6.5 4-1.2.9L12 5.8l-5.3 3.6-1.2-.9L12 4.5zM6.2 10.3L12 8.2l5.8 2.1L12 19.5 6.2 10.3z"/>
            </svg>
          </div>
          <span className="font-semibold text-pearl font-display text-xl tracking-wide">ALMAZ</span>
        </div>

        <div className="flex items-center gap-4">
          <UsageCounter used={usage.used} max={usage.max} />
          <div className="flex items-center gap-2">
            {user?.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-midnight-lighter"
              />
            )}
            <button
              onClick={handleSignOut}
              className="text-sm text-silver hover:text-gold transition-colors"
            >
              Çıxış
            </button>
          </div>
        </div>
      </header>

      {/* Language Notice */}
      <LanguageNotice />

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-3xl w-full mx-auto px-4 pb-4">
        <ChatWindow messages={messages} sending={sending} />

        {/* Input Area */}
        <div className="mt-4 bg-midnight-light rounded-2xl border border-midnight-lighter shadow-sm p-3 flex items-end gap-3 transition-colors focus-within:border-gold/50">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Azərbaycan dilində yazın..."
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-pearl placeholder-silver text-sm leading-6 max-h-32"
            style={{ minHeight: '24px' }}
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-9 h-9 bg-gold hover:bg-gold-light disabled:bg-midnight-lighter disabled:text-silver text-midnight rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-midnight border-t-transparent border-l-transparent opacity-50 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-silver text-center mt-2">
          Enter ilə göndərin · Shift+Enter ilə yeni sətir
        </p>
      </div>
    </div>
  )
}
