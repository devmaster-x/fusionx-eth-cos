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
  Zap,
  AlertCircle
} from 'lucide-react'
import { useAccount } from 'wagmi'
import { Header } from '@/components/Header'
import { SwapInput } from '@/components/SwapInput'
import { SwapSettings } from '@/components/SwapSettings'
import { AuctionPreview } from '@/components/AuctionPreview'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { useHTLCContract, useContractStatus } from '@/lib/hooks/useContracts'

export default function SwapPage() {
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState('')
  
  const { address, isConnected } = useAccount()
  const { createHTLC, isLoading } = useHTLCContract()
  const { allConfigured, missingContracts } = useContractStatus()

  const handleSwap = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first')
      return
    }

    if (!allConfigured) {
      setError(`Missing contract configuration: ${missingContracts.join(', ')}`)
      return
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      setError('')
      
      // For demo purposes, using a mock receiver address
      // In production, this would come from cross-chain matching
      const mockReceiver = '0x742d35Cc6734C4332c256e4aaF89fDeeCF06F8c7' as `0x${string}`
      
      const result = await createHTLC({
        amount: fromAmount,
        receiver: mockReceiver,
        timeoutMinutes: 60
      })

      console.log('HTLC created:', result)
      setShowConfirmation(false)
      
      // In production, navigate to order tracking page with the contract ID
      alert(`HTLC created successfully! Transaction: ${result.txHash}`)
      
    } catch (err: any) {
      console.error('Swap error:', err)
      setError(err.message || 'Failed to create swap')
    }
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
            <p className="text-neutral-600 mb-4">
              Create a Dutch auction for optimal price discovery with HTLC security
            </p>
            
            {/* Contract Status Warning */}
            {!allConfigured && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-800 mb-1">Contracts Not Configured</h3>
                    <p className="text-sm text-amber-700">
                      Missing: {missingContracts.join(', ')}. Please update your environment variables with deployed contract addresses.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
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
                    disabled={!fromAmount || isLoading || !isConnected || !allConfigured}
                    className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating HTLC...' : 
                     !isConnected ? 'Connect Wallet' :
                     !allConfigured ? 'Contracts Not Configured' :
                     'Start Auction'}
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