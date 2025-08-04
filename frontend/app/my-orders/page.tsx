'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Copy,
  ExternalLink
} from 'lucide-react'
import { Header } from '@/components/Header'

type OrderStatus = 'active' | 'settled' | 'expired'

interface Order {
  id: string
  status: OrderStatus
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  fillPercentage: number
  timeElapsed: string
  createdAt: string
}

export default function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus>('active')

  // Sample data
  const orders: Order[] = [
    {
      id: 'auction-123',
      status: 'active',
      fromToken: 'ETH',
      toToken: 'NTRN',
      fromAmount: '5.0',
      toAmount: '9,100',
      fillPercentage: 65,
      timeElapsed: '12:30',
      createdAt: '2 hours ago'
    },
    {
      id: 'auction-456',
      status: 'settled',
      fromToken: 'ETH',
      toToken: 'NTRN',
      fromAmount: '2.5',
      toAmount: '4,550',
      fillPercentage: 100,
      timeElapsed: '4:15',
      createdAt: '1 day ago'
    },
    {
      id: 'auction-789',
      status: 'expired',
      fromToken: 'ETH',
      toToken: 'NTRN',
      fromAmount: '1.0',
      toAmount: '1,820',
      fillPercentage: 0,
      timeElapsed: '30:00',
      createdAt: '3 days ago'
    }
  ]

  const filteredOrders = orders.filter(order => order.status === activeTab)

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'active':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'settled':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-600" />
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'settled':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
    }
  }

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'settled':
        return 'Settled'
      case 'expired':
        return 'Expired'
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
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">My Orders</h1>
            <p className="text-neutral-600">Track your cross-chain swap orders and their status</p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex space-x-1 bg-white p-1 rounded-lg border border-neutral-200">
              {(['active', 'settled', 'expired'] as OrderStatus[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {getStatusText(tab)} Orders
                </button>
              ))}
            </div>
          </motion.div>

          {/* Orders List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {filteredOrders.length === 0 ? (
              <div className="card text-center py-12">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No {activeTab} orders</h3>
                <p className="text-neutral-600 mb-6">
                  {activeTab === 'active' && "You don't have any active orders at the moment."}
                  {activeTab === 'settled' && "You don't have any settled orders yet."}
                  {activeTab === 'expired' && "You don't have any expired orders."}
                </p>
                {activeTab === 'active' && (
                  <Link href="/swap" className="btn-primary">
                    Create New Swap
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="card hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                          {getStatusIcon(order.status)}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-neutral-900">
                              {order.fromAmount} {order.fromToken} → {order.toAmount} {order.toToken}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-neutral-600">
                            <span>Fill: {order.fillPercentage}%</span>
                            <span>Time: {order.timeElapsed}</span>
                            <span>{order.createdAt}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/swap/${order.id}`}
                          className="btn-secondary text-sm px-4 py-2"
                        >
                          View
                        </Link>
                        
                        {order.status === 'settled' && (
                          <Link
                            href={`/settled/${order.id}`}
                            className="btn-primary text-sm px-4 py-2"
                          >
                            Claim
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
} 