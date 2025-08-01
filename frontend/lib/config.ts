// Configuration for FusionX DApp

export const config = {
  // WalletConnect Configuration
  walletConnect: {
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  },

  // RPC URLs
  rpc: {
    ethereum: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://ethereum.publicnode.com',
    neutron: process.env.NEXT_PUBLIC_NEUTRON_RPC_URL || 'https://rpc-kralum.neutron-1.neutron.org',
  },

  // Chain IDs
  chainIds: {
    ethereum: parseInt(process.env.NEXT_PUBLIC_ETHEREUM_CHAIN_ID || '1'),
    neutron: process.env.NEXT_PUBLIC_NEUTRON_CHAIN_ID || 'neutron-1',
  },

  // Contract Addresses (to be updated after deployment)
  contracts: {
    ethereum: {
      htlc: process.env.NEXT_PUBLIC_ETHEREUM_HTLC_ADDRESS || '',
      fusionOrderSettler: process.env.NEXT_PUBLIC_FUSION_ORDER_SETTLER_ADDRESS || '',
    },
    neutron: {
      htlcCodeId: process.env.NEXT_PUBLIC_NEUTRON_HTLC_CODE_ID || '',
      htlcAddress: process.env.NEXT_PUBLIC_NEUTRON_HTLC_ADDRESS || '',
    },
  },

  // Environment
  isDevelopment: process.env.NEXT_PUBLIC_ENVIRONMENT === 'development',
  isProduction: process.env.NODE_ENV === 'production',
}

// Validation function
export function validateConfig() {
  const errors: string[] = []

  if (!config.walletConnect.projectId) {
    errors.push('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required')
  }

  if (!config.rpc.ethereum) {
    errors.push('NEXT_PUBLIC_ETHEREUM_RPC_URL is required')
  }

  if (!config.rpc.neutron) {
    errors.push('NEXT_PUBLIC_NEUTRON_RPC_URL is required')
  }

  if (errors.length > 0) {
    console.warn('Configuration validation failed:', errors)
    return false
  }

  return true
}

// Helper to get RPC URL for a specific chain
export function getRpcUrl(chain: 'ethereum' | 'neutron'): string {
  return config.rpc[chain]
}

// Helper to check if contracts are deployed
export function areContractsDeployed(): boolean {
  return !!(
    config.contracts.ethereum.htlc &&
    config.contracts.ethereum.fusionOrderSettler &&
    config.contracts.neutron.htlcCodeId
  )
} 