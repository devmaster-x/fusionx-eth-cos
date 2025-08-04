'use client'

import { useState } from 'react'
import { ChevronDown, Copy } from 'lucide-react'

interface SwapInputProps {
  token: string
  network: string
  amount: string
  onAmountChange: (amount: string) => void
  balance: string
  isFrom: boolean
  estimated?: string
}

export function SwapInput({ 
  token, 
  network, 
  amount, 
  onAmountChange, 
  balance, 
  isFrom,
  estimated 
}: SwapInputProps) {
  const [showNetworkSelect, setShowNetworkSelect] = useState(false)

  const handleMaxClick = () => {
    // Extract numeric value from balance
    const balanceValue = balance.split(' ')[0]
    onAmountChange(balanceValue)
  }

  return (
    <div className="relative">
      {/* Token/Network Selector */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
          <span className="font-medium text-neutral-900">{token}</span>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowNetworkSelect(!showNetworkSelect)}
            className="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            {network}
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showNetworkSelect && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 min-w-[120px]">
              <div className="py-1">
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50">
                  {network}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Amount Input */}
      <div className="relative">
        <input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.0"
          className="input-field text-2xl font-medium pr-20"
          disabled={!isFrom}
        />
        
        {isFrom && (
          <button
            onClick={handleMaxClick}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            MAX
          </button>
        )}
      </div>

      {/* Balance and Estimated */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <span>Balance: {balance}</span>
          <button className="hover:text-neutral-900 transition-colors">
            <Copy className="w-3 h-3" />
          </button>
        </div>
        
        {estimated && !isFrom && (
          <div className="text-sm text-neutral-600">
            ≈ {estimated}
          </div>
        )}
      </div>
    </div>
  )
} 