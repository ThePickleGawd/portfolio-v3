import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
})

const url = 'https://dylanlu.com'
const title = 'Dylan Lu — AI Researcher, UCSB'
const description =
  'Dylan Lu is an undergraduate AI researcher at UC Santa Barbara (UCSB NLP Group) working on agentic AI, long-horizon reasoning, multi-agent collaboration, and reinforcement learning.'

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  keywords: [
    'Dylan Lu',
    'AI researcher',
    'UCSB',
    'NLP',
    'reinforcement learning',
    'agentic AI',
    'machine learning',
    'UC Santa Barbara',
  ],
  authors: [{ name: 'Dylan Lu', url }],
  creator: 'Dylan Lu',
  openGraph: {
    type: 'website',
    url,
    title,
    description,
    siteName: 'Dylan Lu',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
  alternates: {
    canonical: url,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Dylan Lu',
  url,
  jobTitle: 'Undergraduate AI Researcher',
  affiliation: {
    '@type': 'Organization',
    name: 'UC Santa Barbara',
    department: {
      '@type': 'Organization',
      name: 'NLP Group',
    },
  },
  alumniOf: {
    '@type': 'EducationalOrganization',
    name: 'UC Santa Barbara',
  },
  knowsAbout: [
    'Artificial Intelligence',
    'Natural Language Processing',
    'Reinforcement Learning',
    'Agentic AI',
    'Multi-Agent Systems',
  ],
  sameAs: [
    'https://github.com/ThePickleGawd',
    'https://www.linkedin.com/in/dylanelu/',
    'https://blog.dylanlu.com',
    'https://www.instagram.com/_dylan_lu/',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="ucsb" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-[var(--font-dm-sans)] antialiased">{children}</body>
    </html>
  )
}
