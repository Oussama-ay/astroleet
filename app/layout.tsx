import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, IBM_Plex_Mono } from 'next/font/google'
import ThemeRegistry from '@/components/theme-registry'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Astroleat — Environmental Monitoring for Morocco',
  description:
    'Astroleat turns satellite Earth observation into trustworthy, evidence-based environmental intelligence for Morocco: vegetation, soil moisture and land surface temperature.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#050607',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`}>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
