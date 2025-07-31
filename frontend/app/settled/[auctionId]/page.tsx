'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  Copy, 
  ExternalLink,
  Download,
  Clock,
  Users,
  Zap
} from 'lucide-react'
import { Header } from '@/components/Header'

export default function OrderSettledPage() {
  const params = useParams()
  const auctionId = params.auctionId as string
  
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  const handleClaim = async () => {
    setIsClaiming(true)
    // Simulate claiming process
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsClaiming(false)
    setShowClaimModal(false)
    // Show success message
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Swap Complete!</h1>
            <p className="text-neutral-600">Your ETH has been successfully swapped to NTRN</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Swap Summary */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Swap Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="text-sm text-neutral-600">Swapped</p>
                    <p className="text-lg font-semibold text-neutral-900">5 ETH</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                      <span className="text-sm">→</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-600">Received</p>
                    <p className="text-lg font-semibold text-neutral-900">9,100 NTRN</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Filled by</span>
                    <span className="text-sm font-medium text-neutral-900">3 resolvers</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Duration</span>
                    <span className="text-sm font-medium text-neutral-900">4 minutes</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Average Price</span>
                    <span className="text-sm font-medium text-neutral-900">$1,820</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Gas Savings</span>
                    <span className="text-sm font-medium text-green-600">$45.20</span>
                  </div>
                </div>
              </div>

              {/* Claim Button */}
              <div className="mt-6">
                <button
                  onClick={() => setShowClaimModal(true)}
                  className="w-full btn-primary text-lg py-4"
                >
                  Claim NTRN
                </button>
              </div>
            </motion.div>

            {/* Transaction Details */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Transaction Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Auction ID</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-neutral-900">{auctionId}</span>
                    <button className="text-neutral-400 hover:text-neutral-600">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Order Hash</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-neutral-900">0x1234...abcd</span>
                    <button className="text-neutral-400 hover:text-neutral-600">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">HTLC Address</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-neutral-900">0xabcd...efgh</span>
                    <button className="text-neutral-400 hover:text-neutral-600">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Completion Time</span>
                  <span className="text-sm font-medium text-neutral-900">2:45 PM UTC</span>
                </div>
              </div>

              {/* Resolver Details */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-3">Resolver Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-700">0x1234...5678</span>
                    <span className="text-blue-600">+2.1 ETH</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-700">0xabcd...efgh</span>
                    <span className="text-blue-600">+1.8 ETH</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-700">0x9876...5432</span>
                    <span className="text-blue-600">+1.1 ETH</span>
                  </div>
                </div>
              </div>

              {/* Export Receipt */}
              <div className="mt-6">
                <button className="w-full btn-secondary flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Receipt
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Claim NTRN</h2>
              <p className="text-neutral-600 mb-6">
                Connect your Neutron wallet to claim your NTRN tokens. 
                The tokens will be sent to your connected wallet address.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-900 mb-1">Neutron Wallet Required</h3>
                      <p className="text-xs text-blue-700">
                        Please install and connect Keplr or Leap wallet to claim your tokens.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Amount to Claim</span>
                  <span className="text-sm font-medium text-neutral-900">9,100 NTRN</span>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {isClaiming ? 'Claiming...' : 'Connect Wallet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 