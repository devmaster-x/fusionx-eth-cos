'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'

export function SwapSettings() {
  const [slippage, setSlippage] = useState('0.5')
  const [expiration, setExpiration] = useState('30')
  const [allowPartialFills, setAllowPartialFills] = useState(true)

  const slippageOptions = ['0.1', '0.5', '1.0']

  return (
    <div className="space-y-4 p-4 bg-neutral-50 rounded-lg">
      <h3 className="font-medium text-neutral-900">Advanced Settings</h3>
      
      {/* Max Slippage */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-neutral-700">
            Max Slippage
          </label>
          <div className="flex items-center gap-1 text-neutral-500">
            <Info className="w-4 h-4" />
            <span className="text-xs">Tolerance</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {slippageOptions.map((option) => (
            <button
              key={option}
              onClick={() => setSlippage(option)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                slippage === option
                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                  : 'bg-white text-neutral-600 border border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {option}%
            </button>
          ))}
          <input
            type="number"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            className="flex-1 px-3 py-1 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Custom"
            min="0.1"
            max="50"
            step="0.1"
          />
        </div>
      </div>

      {/* Expiration Time */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-neutral-700">
            Expiration Time
          </label>
          <span className="text-xs text-neutral-500">Minutes</span>
        </div>
        
        <input
          type="number"
          value={expiration}
          onChange={(e) => setExpiration(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="30"
          min="1"
          max="1440"
        />
      </div>

      {/* Allow Partial Fills */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-neutral-700">
            Allow Partial Fills
          </label>
          <p className="text-xs text-neutral-500">
            Enable multiple resolvers to fill your order
          </p>
        </div>
        
        <button
          onClick={() => setAllowPartialFills(!allowPartialFills)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            allowPartialFills ? 'bg-primary-600' : 'bg-neutral-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              allowPartialFills ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Gas Estimate */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-800">Estimated Gas Cost</span>
          <span className="font-medium text-blue-900">~$12.50</span>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          Gas costs are covered by resolvers for optimal fills
        </p>
      </div>
    </div>
  )
} 