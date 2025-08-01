// Contract ABIs and integration utilities for FusionX

import { config } from './config'
import { createPublicClient, createWalletClient, http, getContract } from 'viem'
import { mainnet, sepolia } from 'viem/chains'

// HTLC Contract ABI (you'll need to replace with your actual ABI)
export const ETHEREUM_HTLC_ABI = [
  {
    "inputs": [
      { "name": "_hashlock", "type": "bytes32" },
      { "name": "_timelock", "type": "uint256" },
      { "name": "_receiver", "type": "address" }
    ],
    "name": "newContract",
    "outputs": [{ "name": "contractId", "type": "bytes32" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "_contractId", "type": "bytes32" },
      { "name": "_preimage", "type": "string" }
    ],
    "name": "withdraw",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "_contractId", "type": "bytes32" }],
    "name": "refund",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "", "type": "bytes32" }],
    "name": "contracts",
    "outputs": [
      { "name": "sender", "type": "address" },
      { "name": "receiver", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "hashlock", "type": "bytes32" },
      { "name": "timelock", "type": "uint256" },
      { "name": "withdrawn", "type": "bool" },
      { "name": "refunded", "type": "bool" },
      { "name": "preimage", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "contractId", "type": "bytes32" },
      { "indexed": true, "name": "sender", "type": "address" },
      { "indexed": true, "name": "receiver", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "hashlock", "type": "bytes32" },
      { "name": "timelock", "type": "uint256" }
    ],
    "name": "HTLCNew",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "contractId", "type": "bytes32" }
    ],
    "name": "HTLCWithdraw",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "contractId", "type": "bytes32" }
    ],
    "name": "HTLCRefund",
    "type": "event"
  }
] as const

// FusionOrderSettler ABI (you'll need to replace with your actual ABI)
export const FUSION_ORDER_SETTLER_ABI = [
  {
    "inputs": [
      { "name": "order", "type": "tuple", "components": [
        { "name": "salt", "type": "uint256" },
        { "name": "makerAsset", "type": "address" },
        { "name": "takerAsset", "type": "address" },
        { "name": "maker", "type": "address" },
        { "name": "receiver", "type": "address" },
        { "name": "allowedSender", "type": "address" },
        { "name": "makingAmount", "type": "uint256" },
        { "name": "takingAmount", "type": "uint256" }
      ]},
      { "name": "signature", "type": "bytes" },
      { "name": "makingAmount", "type": "uint256" },
      { "name": "takingAmount", "type": "uint256" }
    ],
    "name": "fillOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

// Helper function to get the appropriate chain
export function getChain() {
  const chainId = config.chainIds.ethereum
  if (chainId === 1) return mainnet
  if (chainId === 11155111) return sepolia
  throw new Error(`Unsupported chain ID: ${chainId}`)
}

// Create public client for reading blockchain data
export function createEthereumPublicClient() {
  return createPublicClient({
    chain: getChain(),
    transport: http(config.rpc.ethereum)
  })
}

// Helper to get HTLC contract instance
export function getHTLCContract(walletClient?: any) {
  const client = walletClient || createEthereumPublicClient()
  
  if (!config.contracts.ethereum.htlc) {
    throw new Error('HTLC contract address not configured')
  }
  
  return getContract({
    address: config.contracts.ethereum.htlc as `0x${string}`,
    abi: ETHEREUM_HTLC_ABI,
    client
  })
}

// Helper to get FusionOrderSettler contract instance
export function getFusionOrderSettlerContract(walletClient?: any) {
  const client = walletClient || createEthereumPublicClient()
  
  if (!config.contracts.ethereum.fusionOrderSettler) {
    throw new Error('FusionOrderSettler contract address not configured')
  }
  
  return getContract({
    address: config.contracts.ethereum.fusionOrderSettler as `0x${string}`,
    abi: FUSION_ORDER_SETTLER_ABI,
    client
  })
}

// Contract interaction utilities
export interface HTLCParams {
  hashlock: `0x${string}`
  timelock: bigint
  receiver: `0x${string}`
  amount: bigint
}

export interface SwapOrder {
  fromAmount: string
  toAmount: string
  fromToken: string
  toToken: string
  receiver: `0x${string}`
}

// Generate a random secret and its hash
export function generateSecret(): { secret: string; hash: `0x${string}` } {
  const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const hash = `0x${require('crypto').createHash('sha256').update(secret).digest('hex')}` as `0x${string}`
  return { secret, hash }
}

// Calculate timelock (current time + duration in seconds)
export function calculateTimelock(durationMinutes: number = 60): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + (durationMinutes * 60))
}

// Format amount to wei
export function parseEthAmount(amount: string): bigint {
  return BigInt(Math.floor(parseFloat(amount) * 1e18))
}

// Format wei to ETH
export function formatEthAmount(wei: bigint): string {
  return (Number(wei) / 1e18).toFixed(6)
} 