import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant'
})
const dmSans = DM_Sans({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans'
})

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
    <html lang="az" className={`${inter.variable} ${cormorant.variable} ${dmSans.variable}`}>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
