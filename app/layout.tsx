import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CyberShoora - Smart Mail Management',
  description: 'Advanced email management system with AI-powered features',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
