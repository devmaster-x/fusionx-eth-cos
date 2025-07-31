'use client'

import { X, Shield, Clock, Hash } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  fromAmount: string
  toAmount: string
  isLoading: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  fromAmount,
  toAmount,
  isLoading
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const estimatedNTRN = fromAmount ? (parseFloat(fromAmount) * 1820).toFixed(2) : '0'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">Confirm Swap</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Swap Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <p className="text-sm text-neutral-600">You pay</p>
                <p className="text-lg font-semibold text-neutral-900">{fromAmount} ETH</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-600">You receive</p>
                <p className="text-lg font-semibold text-neutral-900">~{estimatedNTRN} NTRN</p>
              </div>
            </div>

            {/* HTLC Security Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-1">HTLC Security</h3>
                  <p className="text-xs text-blue-700">
                    Your ETH will be locked in a Hash Time-Locked Contract. 
                    The swap is atomic and secure.
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-neutral-700">Transaction Details</h3>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Network</span>
                <span className="text-neutral-900">Ethereum → Neutron</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Auction Duration</span>
                <span className="text-neutral-900">30 minutes</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Max Slippage</span>
                <span className="text-neutral-900">0.5%</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Gas Cost</span>
                <span className="text-green-600">Covered by resolvers</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 btn-secondary disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Creating Auction...' : 'Confirm Swap'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 