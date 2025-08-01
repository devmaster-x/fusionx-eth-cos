// Cosmos/Neutron chain utilities for FusionX

import { SigningCosmWasmClient, CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { SigningStargateClient, StargateClient } from '@cosmjs/stargate'
import { OfflineSigner } from '@cosmjs/proto-signing'
import { GasPrice } from '@cosmjs/stargate'
import { config } from './config'

// Neutron chain configuration
export const neutronChainConfig = {
  chainId: config.chainIds.neutron,
  chainName: 'Neutron',
  rpc: config.rpc.neutron,
  rest: 'https://rest-kralum.neutron-1.neutron.org',
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'neutron',
    bech32PrefixAccPub: 'neutronpub',
    bech32PrefixValAddr: 'neutronvaloper',
    bech32PrefixValPub: 'neutronvaloperpub',
    bech32PrefixConsAddr: 'neutronvalcons',
    bech32PrefixConsPub: 'neutronvalconspub',
  },
  currencies: [
    {
      coinDenom: 'NTRN',
      coinMinimalDenom: 'untrn',
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: 'NTRN',
      coinMinimalDenom: 'untrn',
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.0053,
        average: 0.0053,
        high: 0.0053,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: 'NTRN',
    coinMinimalDenom: 'untrn',
    coinDecimals: 6,
  },
}

// Gas configuration for Neutron
export const neutronGasPrice = GasPrice.fromString('0.0053untrn')



/**
 * Get CosmWasm client for read-only operations
 */
export async function getCosmWasmClient(): Promise<CosmWasmClient> {
  return CosmWasmClient.connect(config.rpc.neutron)
}

/**
 * Get signing CosmWasm client for transactions
 */
export async function getSigningCosmWasmClient(
  signer: OfflineSigner
): Promise<SigningCosmWasmClient> {
  return SigningCosmWasmClient.connectWithSigner(config.rpc.neutron, signer, {
    gasPrice: neutronGasPrice,
  })
}

/**
 * Get Stargate client for read-only operations
 */
export async function getStargateClient(): Promise<StargateClient> {
  return StargateClient.connect(config.rpc.neutron)
}

/**
 * Get signing Stargate client for transactions
 */
export async function getSigningStargateClient(
  signer: OfflineSigner
): Promise<SigningStargateClient> {
  return SigningStargateClient.connectWithSigner(config.rpc.neutron, signer, {
    gasPrice: neutronGasPrice,
  })
}

/**
 * Suggest Neutron chain to Keplr wallet
 */
export async function suggestNeutronChain() {
  if (!window.keplr) {
    throw new Error('Keplr wallet not found')
  }

  try {
    await window.keplr.experimentalSuggestChain(neutronChainConfig)
  } catch (error) {
    console.error('Failed to suggest Neutron chain:', error)
    throw error
  }
}

/**
 * Connect to Keplr wallet and get signer
 */
export async function connectKeplr(): Promise<OfflineSigner> {
  if (!window.keplr) {
    throw new Error('Keplr wallet not found')
  }

  try {
    // Suggest chain first
    await suggestNeutronChain()

    // Enable the chain
    await window.keplr.enable(config.chainIds.neutron)

    // Get offline signer
    const offlineSigner = window.keplr.getOfflineSigner(config.chainIds.neutron)
    return offlineSigner
  } catch (error) {
    console.error('Failed to connect to Keplr:', error)
    throw error
  }
}

/**
 * Get user's Neutron address from Keplr
 */
export async function getNeutronAddress(): Promise<string> {
  if (!window.keplr) {
    throw new Error('Keplr wallet not found')
  }

  try {
    const key = await window.keplr.getKey(config.chainIds.neutron)
    return key.bech32Address
  } catch (error) {
    console.error('Failed to get Neutron address:', error)
    throw error
  }
}

/**
 * Check if Keplr is installed
 */
export function isKeplrAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.keplr
}

// Extend Window interface for Keplr
declare global {
  interface Window {
    keplr?: {
      enable: (chainId: string) => Promise<void>
      getOfflineSigner: (chainId: string) => OfflineSigner
      experimentalSuggestChain: (chainInfo: any) => Promise<void>
      getKey: (chainId: string) => Promise<{ bech32Address: string }>
    }
    leap?: any
  }
} 