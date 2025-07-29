'use client'

import { motion } from 'framer-motion'
import { 
  Shield, 
  Clock, 
  Users, 
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { Header } from '@/components/Header'

export default function HowItWorksPage() {
  const steps = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Create HTLC Intent",
      description: "Lock your ETH in a Hash Time-Locked Contract on Ethereum with a secret hash and time limit.",
      details: "The HTLC ensures your funds are secure and can only be claimed with the correct preimage or refunded after the time lock expires."
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Dutch Auction Starts",
      description: "Your swap enters a time-decay auction where the price decreases over time to find optimal fills.",
      details: "Resolvers compete to fill your order at the best possible price, with partial fills supported for better execution."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Resolvers Fill Order",
      description: "Professional resolvers monitor the auction and fill your order when profitable conditions are met.",
      details: "Resolvers cover gas costs and handle the complex cross-chain coordination, providing you with a seamless experience."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Atomic Settlement",
      description: "Once filled, the HTLC is settled atomically across both chains using the revealed preimage.",
      details: "The secret is revealed on Neutron, allowing you to claim your NTRN tokens while the resolver claims the ETH."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">How FusionX Works</h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Trustless cross-chain swaps between Ethereum and Neutron using HTLC technology and Dutch auctions
            </p>
          </motion.div>

          {/* Process Steps */}
          <div className="space-y-8 mb-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0">
                    {step.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                        Step {index + 1}
                      </span>
                      <h3 className="text-xl font-semibold text-neutral-900">{step.title}</h3>
                    </div>
                    
                    <p className="text-neutral-600 mb-3">{step.description}</p>
                    <p className="text-sm text-neutral-500">{step.details}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Technology Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="card mb-16"
          >
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Technology Stack</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900">Ethereum Side</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-neutral-600">Solidity HTLC Contracts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-neutral-600">1inch Fusion+ Integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-neutral-600">RainbowKit Wallet Support</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900">Neutron Side</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-neutral-600">CosmWasm HTLC Contracts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-neutral-600">Keplr/Leap Wallet Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-neutral-600">IBC Integration Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="card mb-16"
          >
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Security Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">HTLC Security</h3>
                <p className="text-sm text-neutral-600">
                  Hash Time-Locked Contracts ensure atomic swaps with cryptographic security
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">Time Locks</h3>
                <p className="text-sm text-neutral-600">
                  Automatic refund mechanism if swaps aren't completed within time limits
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">Resolver Network</h3>
                <p className="text-sm text-neutral-600">
                  Professional resolvers ensure reliable execution and optimal pricing
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-center"
          >
            <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Ready to Start Swapping?</h2>
              <p className="text-neutral-600 mb-6">
                Experience the future of cross-chain swaps with FusionX
              </p>
              <a
                href="/swap"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
              >
                Start Your First Swap
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
} 