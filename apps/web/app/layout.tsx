import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'ALMAZ — Native Azerbaijani AI',
  description: 'The first production-grade large language model purpose-built for native Azerbaijani language understanding and generation.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="az" className={`${inter.variable}`}>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
