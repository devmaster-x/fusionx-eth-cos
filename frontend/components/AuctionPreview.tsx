'use client'

interface AuctionPreviewProps {
  fromAmount: string
  toAmount: string
}

export function AuctionPreview({ fromAmount, toAmount }: AuctionPreviewProps) {
  const currentPrice = fromAmount ? 1820 : 0
  const estimatedReturn = fromAmount ? (parseFloat(fromAmount) * currentPrice).toFixed(2) : '0'

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Auction Preview</h3>
      
      {/* Price Curve Chart */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-neutral-700">Dutch Auction Curve</span>
          <span className="text-sm text-neutral-500">30 min duration</span>
        </div>
        
        <div className="h-48 bg-neutral-50 rounded-lg p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-neutral-600">Chart loading...</p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Current Price</span>
          <span className="font-medium text-neutral-900">${currentPrice}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Estimated Return</span>
          <span className="font-medium text-neutral-900">{estimatedReturn} NTRN</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Time Remaining</span>
          <span className="font-medium text-neutral-900">30:00</span>
        </div>
      </div>

      {/* Resolver Status */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-800">Resolvers Active</span>
        </div>
        <p className="text-xs text-green-700">
          3 resolvers monitoring this auction for optimal fills
        </p>
      </div>

      {/* Fill Events Preview */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-neutral-700 mb-2">Recent Fills</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-600">0x1234...5678</span>
            <span className="text-green-600">+0.5 ETH</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-600">0xabcd...efgh</span>
            <span className="text-green-600">+1.2 ETH</span>
          </div>
        </div>
      </div>
    </div>
  )
} 