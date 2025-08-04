'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Copy,
  ExternalLink,
  X
} from 'lucide-react'
import { Header } from '@/components/Header'

export default function AuctionProgressPage() {
  const params = useParams()
  const auctionId = params.auctionId as string
  
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes in seconds
  const [auctionStatus, setAuctionStatus] = useState<'created' | 'partial' | 'complete' | 'expired'>('partial')
  const [fillPercentage, setFillPercentage] = useState(65)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setAuctionStatus('expired')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created':
        return 'bg-blue-100 text-blue-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      case 'complete':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'created':
        return 'Created'
      case 'partial':
        return 'Partial Fill'
      case 'complete':
        return 'Complete'
      case 'expired':
        return 'Expired'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Auction Progress</h1>
                <p className="text-neutral-600">Auction ID: {auctionId}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(auctionStatus)}`}>
                {getStatusText(auctionStatus)}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Auction Timeline */}
            <div className="lg:col-span-2">
              <motion.div
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">Auction Timeline</h2>
                
                {/* Dutch Curve Graph */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-neutral-700">Price Curve</h3>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(timeLeft)} remaining</span>
                    </div>
                  </div>
                  
                  <div className="h-64 bg-neutral-50 rounded-lg p-4 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                      <p className="text-sm text-neutral-600">Loading price curve...</p>
                    </div>
                  </div>
                </div>

                {/* Fill Events */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-700 mb-4">Fill Events</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">0x1234...5678</p>
                          <p className="text-xs text-neutral-600">Resolver</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">+0.5 ETH</p>
                        <p className="text-xs text-neutral-600">2 min ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">0xabcd...efgh</p>
                          <p className="text-xs text-neutral-600">Resolver</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">+1.2 ETH</p>
                        <p className="text-xs text-neutral-600">5 min ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Auction Details */}
            <div className="lg:col-span-1">
              <motion.div
                className="card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">Auction Details</h2>
                
                <div className="space-y-4">
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
                    <span className="text-sm text-neutral-600">Amount Remaining</span>
                    <span className="text-sm font-medium text-neutral-900">1.8 ETH</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Fill Percentage</span>
                    <span className="text-sm font-medium text-neutral-900">{fillPercentage}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Current Price</span>
                    <span className="text-sm font-medium text-neutral-900">$1,820</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Time Elapsed</span>
                    <span className="text-sm font-medium text-neutral-900">12:30</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-600">Fill Progress</span>
                    <span className="text-sm font-medium text-neutral-900">{fillPercentage}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${fillPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status Message */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-900 mb-1">Waiting for optimal fill</h3>
                      <p className="text-xs text-blue-700">
                        Resolvers are actively monitoring this auction. 
                        Your order will be filled at the best available price.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cancel Button */}
                {auctionStatus === 'partial' && (
                  <button className="w-full mt-6 btn-secondary text-red-600 border-red-300 hover:bg-red-50">
                    Cancel Intent
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 