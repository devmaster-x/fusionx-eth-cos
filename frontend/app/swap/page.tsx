'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Settings, 
  Info,
  ChevronDown,
  Clock,
  Users,
  Zap
} from 'lucide-react'
import { Header } from '@/components/Header'
import { SwapInput } from '@/components/SwapInput'
import { SwapSettings } from '@/components/SwapSettings'
import { AuctionPreview } from '@/components/AuctionPreview'
import { ConfirmationModal } from '@/components/ConfirmationModal'

export default function SwapPage() {
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSwap = async () => {
    setIsLoading(true)
    // Simulate swap creation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    setShowConfirmation(false)
    // Redirect to auction progress page
    window.location.href = '/swap/auction-123'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Swap ETH to NTRN</h1>
            <p className="text-neutral-600 mb-8">
              Create a Dutch auction for optimal price discovery with HTLC security
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Swap Interface */}
            <div className="lg:col-span-2">
              <motion.div
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {/* From Token */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    From
                  </label>
                  <SwapInput
                    token="ETH"
                    network="Ethereum"
                    amount={fromAmount}
                    onAmountChange={setFromAmount}
                    balance="2.45 ETH"
                    isFrom={true}
                  />
                </div>

                {/* Swap Arrow */}
                <div className="flex justify-center my-4">
                  <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-neutral-600" />
                  </div>
                </div>

                {/* To Token */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    To
                  </label>
                  <SwapInput
                    token="NTRN"
                    network="Neutron"
                    amount={toAmount}
                    onAmountChange={setToAmount}
                    balance="0 NTRN"
                    isFrom={false}
                    estimated={fromAmount ? `${(parseFloat(fromAmount) * 1820).toFixed(2)} NTRN` : ''}
                  />
                </div>

                {/* Settings Toggle */}
                <div className="border-t border-neutral-200 pt-4">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Advanced Settings
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} 
                    />
                  </button>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    <SwapSettings />
                  </motion.div>
                )}

                {/* Start Auction Button */}
                <div className="mt-6">
                  <button
                    onClick={() => setShowConfirmation(true)}
                    disabled={!fromAmount || isLoading}
                    className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating Auction...' : 'Start Auction'}
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Auction Preview */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <AuctionPreview 
                  fromAmount={fromAmount}
                  toAmount={toAmount}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleSwap}
        fromAmount={fromAmount}
        toAmount={toAmount}
        isLoading={isLoading}
      />
    </div>
  )
} 