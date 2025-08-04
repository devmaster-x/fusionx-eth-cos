'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  Copy,
  ExternalLink,
  AlertCircle,
  Settings
} from 'lucide-react'
import { useAccount, useNetwork } from 'wagmi'
import { Header } from '@/components/Header'
import { useContractStatus } from '@/lib/hooks/useContracts'
import { config } from '@/lib/config'

export default function AdminPage() {
  const { isConnected, address } = useAccount()
  const { chain } = useNetwork()
  const { 
    htlcConfigured, 
    fusionSettlerConfigured, 
    neutronConfigured, 
    allConfigured, 
    missingContracts 
  } = useContractStatus()
  
  const [copied, setCopied] = useState('')

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  const envTemplate = `# FusionX Frontend Environment Variables

# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# RPC URLs
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://ethereum.publicnode.com
NEXT_PUBLIC_NEUTRON_RPC_URL=https://rpc-kralum.neutron-1.neutron.org

# Chain IDs
NEXT_PUBLIC_ETHEREUM_CHAIN_ID=1
NEXT_PUBLIC_NEUTRON_CHAIN_ID=neutron-1

# Contract Addresses (UPDATE WITH YOUR DEPLOYED CONTRACT ADDRESSES)
NEXT_PUBLIC_ETHEREUM_HTLC_ADDRESS=0x...
NEXT_PUBLIC_FUSION_ORDER_SETTLER_ADDRESS=0x...
NEXT_PUBLIC_NEUTRON_HTLC_CODE_ID=...

# Environment
NEXT_PUBLIC_ENVIRONMENT=development

# For development/testing (use Sepolia testnet)
# NEXT_PUBLIC_ETHEREUM_CHAIN_ID=11155111
# NEXT_PUBLIC_ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY`

  const StatusIndicator = ({ isConfigured, label }: { isConfigured: boolean, label: string }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg border">
      {isConfigured ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <XCircle className="w-5 h-5 text-red-600" />
      )}
      <span className={`font-medium ${isConfigured ? 'text-green-900' : 'text-red-900'}`}>
        {label}
      </span>
      <span className={`text-sm ${isConfigured ? 'text-green-600' : 'text-red-600'}`}>
        {isConfigured ? 'Configured' : 'Missing'}
      </span>
    </div>
  )

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
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-8 h-8 text-primary-600" />
              <h1 className="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
            </div>
            
            <p className="text-neutral-600 mb-8">
              Configure and monitor your FusionX deployment status
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Connection Status */}
            <motion.div
              className="card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
              
              <div className="space-y-3">
                <StatusIndicator 
                  isConfigured={isConnected} 
                  label="Wallet Connected" 
                />
                {isConnected && (
                  <div className="ml-8 space-y-2 text-sm text-neutral-600">
                    <p><strong>Address:</strong> {address}</p>
                    <p><strong>Chain:</strong> {chain?.name} ({chain?.id})</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Contract Status */}
            <motion.div
              className="card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-4">Contract Status</h2>
              
              <div className="space-y-3">
                <StatusIndicator 
                  isConfigured={htlcConfigured} 
                  label="Ethereum HTLC" 
                />
                <StatusIndicator 
                  isConfigured={fusionSettlerConfigured} 
                  label="Fusion Order Settler" 
                />
                <StatusIndicator 
                  isConfigured={neutronConfigured} 
                  label="Neutron HTLC Code ID" 
                />
              </div>

              {!allConfigured && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Action Required</p>
                      <p className="text-sm text-amber-700">
                        Update your environment variables with deployed contract addresses
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Current Configuration */}
            <motion.div
              className="card lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-neutral-900 mb-2">Network Configuration</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Ethereum Chain ID:</span>
                      <span className="font-mono">{config.chainIds.ethereum}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Neutron Chain ID:</span>
                      <span className="font-mono">{config.chainIds.neutron}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Environment:</span>
                      <span className="font-mono">{config.isDevelopment ? 'Development' : 'Production'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-neutral-900 mb-2">Contract Addresses</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-neutral-600 block">Ethereum HTLC:</span>
                      <span className="font-mono text-xs break-all">
                        {config.contracts.ethereum.htlc || 'Not configured'}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-600 block">Fusion Order Settler:</span>
                      <span className="font-mono text-xs break-all">
                        {config.contracts.ethereum.fusionOrderSettler || 'Not configured'}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-600 block">Neutron HTLC Code ID:</span>
                      <span className="font-mono text-xs">
                        {config.contracts.neutron.htlcCodeId || 'Not configured'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Environment Template */}
            <motion.div
              className="card lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Environment Template</h2>
                <button
                  onClick={() => copyToClipboard(envTemplate, 'template')}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {copied === 'template' ? 'Copied!' : 'Copy Template'}
                </button>
              </div>
              
              <div className="bg-neutral-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                  {envTemplate}
                </pre>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Setup Instructions</p>
                    <ol className="text-sm text-blue-700 mt-1 list-decimal list-inside space-y-1">
                      <li>Create a <code>.env.local</code> file in your frontend directory</li>
                      <li>Copy the template above and update with your deployed contract addresses</li>
                      <li>Restart your development server</li>
                      <li>Refresh this page to verify configuration</li>
                    </ol>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
} 