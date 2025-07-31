import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FusionX - Cross-Chain ETH ↔ NTRN Swaps',
  description: 'Trustless cross-chain swaps between Ethereum and Neutron using HTLC and 1inch Fusion+',
  keywords: 'cross-chain, swap, ethereum, neutron, htlc, fusion, defi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 