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
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { useAccount } from 'wagmi'
import { Header } from '@/components/Header'
import { SwapInput } from '@/components/SwapInput'
import { SwapSettings } from '@/components/SwapSettings'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { useContractStatus } from '@/lib/hooks/useContracts'
import { 
  executeAtomicSwap, 
  SwapFlowState, 
  SwapParams,
  queryCosmosHTLCStatus 
} from '@/lib/swap-flow'

export default function AtomicSwapPage() {
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [swapState, setSwapState] = useState<SwapFlowState>({
    step: 0,
    status: 'idle'
  })
  const [isExecuting, setIsExecuting] = useState(false)
  
  const { address, isConnected } = useAccount()
  const { allConfigured, missingContracts } = useContractStatus()

  const handleStepUpdate = (step: number, status: string) => {
    setSwapState(prev => ({
      ...prev,
      step,
      status: status.includes('error') ? 'error' : 'preparing'
    }))
    console.log(`Step ${step}: ${status}`)
  }

  const handleAtomicSwap = async () => {
    if (!isConnected || !address) {
      setSwapState(prev => ({ ...prev, status: 'error', error: 'Please connect your wallet first' }))
      return
    }

    if (!allConfigured) {
      setSwapState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: `Missing contract configuration: ${missingContracts.join(', ')}` 
      }))
      return
    }

    if (!fromAmount || !toAmount || !recipientAddress) {
      setSwapState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: 'Please fill in all required fields' 
      }))
      return
    }

    setIsExecuting(true)
    setSwapState({ step: 0, status: 'preparing' })

    try {
      const params: SwapParams = {
        fromAmount,
        toAmount,
        recipientAddress,
        timeoutMinutes: 60
      }

      const result = await executeAtomicSwap(params, handleStepUpdate)
      setSwapState(result)
      setShowConfirmation(false)
      
      // Show success message
      alert(`Atomic swap completed successfully!`)
      
    } catch (error: any) {
      console.error('Atomic swap error:', error)
      setSwapState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: error.message || 'Failed to execute atomic swap' 
      }))
    } finally {
      setIsExecuting(false)
    }
  }

  const resetSwap = () => {
    setSwapState({ step: 0, status: 'idle' })
    setFromAmount('')
    setToAmount('')
    setRecipientAddress('')
  }

  const getStepStatus = (step: number) => {
    if (swapState.step > step) return 'completed'
    if (swapState.step === step) return 'active'
    return 'pending'
  }

  const getStepIcon = (step: number) => {
    const status = getStepStatus(step)
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-600" />
    if (status === 'active') return <Play className="w-5 h-5 text-blue-600" />
    return <Clock className="w-5 h-5 text-gray-400" />
  }

  const steps = [
    { number: 1, title: 'Generate Secret & Hashlock', description: 'Create cryptographic lock for testnet atomic swap' },
    { number: 2, title: 'Lock NTRN Test on Neutron', description: 'Bob locks test tokens in Neutron testnet HTLC contract' },
    { number: 3, title: 'Fill Fusion+ Order on Sepolia', description: 'Alice fills order on Sepolia testnet with secret' },
    { number: 4, title: 'Claim NTRN Test Tokens', description: 'Alice claims test tokens using revealed secret' },
    { number: 5, title: 'Claim Sepolia ETH from Fusion+', description: 'Bob claims Sepolia ETH using the same secret' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Atomic Swap: Sepolia ETH ↔ NTRN Test</h1>
            <p className="text-neutral-600 mb-4">
              Execute a trustless cross-chain swap using HTLC and Fusion+ technology on testnet
            </p>
            
            {/* Testnet Information Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800 mb-1">Testnet Environment</h3>
                  <p className="text-sm text-blue-700">
                    This swap uses Sepolia testnet ETH and Neutron testnet NTRN tokens. 
                    Conversion rate: 1 Sepolia ETH = 1000 NTRN Test tokens. 
                    No real value is involved in testnet transactions.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Contract Status Warning */}
            {!allConfigured && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-800 mb-1">Contracts Not Configured</h3>
                    <p className="text-sm text-amber-700">
                      Missing: {missingContracts.join(', ')}. Please update your environment variables.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {swapState.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{swapState.error}</p>
                </div>
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Swap Interface */}
            <motion.div
              className="card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold mb-6">Swap Parameters</h2>
              
              {/* From Token */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  From (Sepolia Testnet)
                </label>
                <SwapInput
                  token="Sepolia ETH"
                  network="Sepolia"
                  amount={fromAmount}
                  onAmountChange={setFromAmount}
                  balance="0.0 Sepolia ETH"
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
                  To (Neutron Testnet)
                </label>
                <SwapInput
                  token="NTRN Test"
                  network="Pion-1"
                  amount={toAmount}
                  onAmountChange={setToAmount}
                  balance="0 NTRN Test"
                  isFrom={false}
                  estimated={fromAmount ? `${(parseFloat(fromAmount) * 1000).toFixed(2)} NTRN Test` : ''}
                />
              </div>

              {/* Recipient Address */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Recipient Address (Neutron Testnet Address)
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="neutron1..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  The Neutron testnet address that will receive the NTRN test tokens
                </p>
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

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setShowConfirmation(true)}
                  disabled={!fromAmount || !toAmount || !recipientAddress || isExecuting || !isConnected || !allConfigured}
                  className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isExecuting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Executing Atomic Swap...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Start Atomic Swap
                    </>
                  )}
                </button>

                {swapState.status !== 'idle' && (
                  <button
                    onClick={resetSwap}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Swap
                  </button>
                )}
              </div>
            </motion.div>

            {/* Swap Progress */}
            <motion.div
              className="card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-6">Swap Progress</h2>
              
              <div className="space-y-4">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      getStepStatus(step.number) === 'completed' 
                        ? 'bg-green-50 border-green-200' 
                        : getStepStatus(step.number) === 'active'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-neutral-50 border-neutral-200'
                    }`}
                  >
                    {getStepIcon(step.number)}
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900">{step.title}</h3>
                      <p className="text-sm text-neutral-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Swap Details */}
              {swapState.secret && (
                <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                  <h3 className="font-medium text-neutral-900 mb-2">Swap Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Secret:</span>
                      <span className="font-mono text-xs break-all">{swapState.secret}</span>
                    </div>
                    {swapState.hashlock && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Hashlock:</span>
                        <span className="font-mono text-xs break-all">{swapState.hashlock}</span>
                      </div>
                    )}
                    {swapState.cosmosContractId && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Cosmos Contract:</span>
                        <span className="font-mono text-xs break-all">{swapState.cosmosContractId}</span>
                      </div>
                    )}
                    {swapState.ethereumTxHash && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Ethereum TX:</span>
                        <span className="font-mono text-xs break-all">{swapState.ethereumTxHash}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleAtomicSwap}
        fromAmount={fromAmount}
        toAmount={toAmount}
        isLoading={isExecuting}
      />
    </div>
  )
} 