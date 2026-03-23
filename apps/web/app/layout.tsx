import type { Metadata } from 'next'
import { Inter, Open_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const openSans = Open_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-open-sans' })

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
    <html lang="az" className={`${inter.variable} ${openSans.variable}`}>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
