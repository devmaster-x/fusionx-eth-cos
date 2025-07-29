'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Users, 
  TrendingUp,
  Shield,
  ExternalLink,
  Save
} from 'lucide-react'
import { Header } from '@/components/Header'

export default function AdminPage() {
  const [resolverFee, setResolverFee] = useState('0.1')
  const [maxSwapCap, setMaxSwapCap] = useState('100')
  const [minDuration, setMinDuration] = useState('5')
  const [maxDuration, setMaxDuration] = useState('60')

  const handleSave = () => {
    // Simulate saving settings
    console.log('Saving admin settings...')
  }

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
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">DAO Governance</h1>
                <p className="text-neutral-600">Manage FusionX protocol parameters and settings</p>
              </div>
              <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                Admin Access
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Protocol Parameters */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Protocol Parameters
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Resolver Fee (%)
                  </label>
                  <input
                    type="number"
                    value={resolverFee}
                    onChange={(e) => setResolverFee(e.target.value)}
                    className="input-field"
                    min="0"
                    max="10"
                    step="0.1"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Fee charged to resolvers for filling orders
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Max Swap Cap (ETH)
                  </label>
                  <input
                    type="number"
                    value={maxSwapCap}
                    onChange={(e) => setMaxSwapCap(e.target.value)}
                    className="input-field"
                    min="1"
                    max="1000"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Maximum amount per swap to prevent large slippage
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Min Auction Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={minDuration}
                    onChange={(e) => setMinDuration(e.target.value)}
                    className="input-field"
                    min="1"
                    max="30"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Max Auction Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={maxDuration}
                    onChange={(e) => setMaxDuration(e.target.value)}
                    className="input-field"
                    min="5"
                    max="1440"
                  />
                </div>
              </div>
              
              <button
                onClick={handleSave}
                className="w-full mt-6 btn-primary flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </motion.div>

            {/* Governance Links */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Governance Links
              </h2>
              
              <div className="space-y-4">
                <a
                  href="https://snapshot.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-900">Snapshot Platform</h3>
                      <p className="text-sm text-blue-700">Learn about DAO governance voting</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                </a>
                
                <a
                  href="https://ethereum.org/en/dao/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-green-900">DAO Education</h3>
                      <p className="text-sm text-green-700">Learn about decentralized governance</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-green-600" />
                </a>
                
                <a
                  href="https://docs.1inch.io/docs/fusion-swap/introduction"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-purple-900">1inch Fusion+ Docs</h3>
                      <p className="text-sm text-purple-700">Technical documentation for Fusion swaps</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-purple-600" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Current Stats */}
          <motion.div
            className="card mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Protocol Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-neutral-900">$2.4M</div>
                <div className="text-sm text-neutral-600">Total Volume</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-neutral-900">1,247</div>
                <div className="text-sm text-neutral-600">Total Swaps</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-neutral-900">15</div>
                <div className="text-sm text-neutral-600">Active Resolvers</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-neutral-900">99.2%</div>
                <div className="text-sm text-neutral-600">Success Rate</div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
} 