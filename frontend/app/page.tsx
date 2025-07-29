'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Zap,
  Github,
  BookOpen,
  Shield
} from 'lucide-react'
import { Header } from '@/components/Header'
import { StatsCard } from '@/components/StatsCard'

export default function HomePage() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Header />
      
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gradient">Cross-Chain</span>
            <br />
            <span className="text-neutral-900">Fusion+ Swaps</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Swap ETH on Ethereum → NTRN on Neutron via Dutch auction and HTLC-based atomic swaps. 
            Built on Fusion+ principles with flexibility, visibility, and security.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/swap">
              <motion.button
                className="btn-primary text-lg px-8 py-4 flex items-center gap-2 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
              >
                Swap ETH to NTRN
                <motion.div
                  animate={{ x: isHovered ? 5 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.button>
            </Link>
            
            <div className="flex items-center gap-2 text-neutral-600">
              <p>Wallet Connect</p>
            </div>
          </motion.div>
        </div>
        
        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <StatsCard/>
        </motion.div>
        
        {/* Features Section */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">HTLC Security</h3>
            <p className="text-neutral-600">
              Trustless atomic swaps with hash time-locked contracts ensuring secure cross-chain transfers.
            </p>
          </div>
          
          <div className="card text-center">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-secondary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Dutch Auctions</h3>
            <p className="text-neutral-600">
              Optimal price discovery through time-decay auctions with partial fill support.
            </p>
          </div>
          
          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Gas-Free Fills</h3>
            <p className="text-neutral-600">
              Resolvers cover gas costs, providing seamless user experience with no hidden fees.
            </p>
          </div>
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg"></div>
              <span className="text-xl font-bold">FusionX</span>
            </div>
            
            <div className="flex gap-6">
              <Link href="https://github.com/devmaster-x/fusionx-eth-cos" className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                <Github className="w-5 h-5" />
                GitHub
              </Link>
              <Link href="/docs" className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                <BookOpen className="w-5 h-5" />
                Docs
              </Link>
              <Link href="/governance" className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                <Shield className="w-5 h-5" />
                DAO
              </Link>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
            <p>&copy; 2025 FusionX. Built for the Unite DeFi Hackathon.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 