import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'
import { PROJECT } from '@/project.config'

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: `${PROJECT.name} · Sprint Dashboard`,
  description: PROJECT.description,
  icons: { icon: '/kapi_logo.png' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} font-mono antialiased bg-zinc-950 text-zinc-100`}>
        {children}
      </body>
    </html>
  )
}
