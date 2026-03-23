'use client'

import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import type { Message } from '@/app/chat/page'

interface ChatWindowProps {
  messages: Message[]
  sending: boolean
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 bg-gold rounded-full flex items-center justify-center flex-shrink-0">
        <svg className="w-3.5 h-3.5 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
      <div className="bg-midnight-light border border-midnight-lighter shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-silver rounded-full animate-pulse-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function ChatWindow({ messages, sending }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  if (messages.length === 0 && !sending) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-midnight-lighter rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-pearl font-display text-xl tracking-wide">Salam! Sizə necə kömək edə bilərəm?</p>
          <p className="text-sm text-silver mt-1 font-body">Azərbaycan dilində sualınızı yazın</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto py-4 space-y-4">
      {messages.map((msg, i) => (
        <MessageBubble key={i} message={msg} />
      ))}
      {sending && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  )
}
