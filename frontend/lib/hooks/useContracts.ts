// React hooks for contract interactions with wagmi

import { useAccount, usePublicClient, useWalletClient, useContractRead } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { 
  generateSecret,
  calculateTimelock,
  parseEthAmount,
  ETHEREUM_HTLC_ABI,
  FUSION_ORDER_SETTLER_ABI
} from '../contracts'
import { config } from '../config'
import { useState } from 'react'

export function useHTLCContract() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const [isLoading, setIsLoading] = useState(false)

  // Create a new HTLC
  const createHTLC = async (params: {
    amount: string
    receiver: `0x${string}`
    timeoutMinutes?: number
  }) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected')
    }

    if (!config.contracts.ethereum.htlc) {
      throw new Error('HTLC contract address not configured')
    }

    setIsLoading(true)
    try {
      const { secret, hash } = generateSecret()
      const timelock = calculateTimelock(params.timeoutMinutes || 60)
      const amount = parseEthAmount(params.amount)

      const txHash = await walletClient.writeContract({
        address: config.contracts.ethereum.htlc as `0x${string}`,
        abi: ETHEREUM_HTLC_ABI,
        functionName: 'newContract',
        args: [hash, timelock, params.receiver],
        value: amount
      })

      return {
        txHash,
        secret,
        hash,
        timelock,
        amount: params.amount
      }
    } catch (error) {
      console.error('Error creating HTLC:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Withdraw from HTLC using secret
  const withdrawHTLC = async (contractId: `0x${string}`, secret: string) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected')
    }

    if (!config.contracts.ethereum.htlc) {
      throw new Error('HTLC contract address not configured')
    }

    setIsLoading(true)
    try {
      const txHash = await walletClient.writeContract({
        address: config.contracts.ethereum.htlc as `0x${string}`,
        abi: ETHEREUM_HTLC_ABI,
        functionName: 'withdraw',
        args: [contractId, secret]
      })

      return txHash
    } catch (error) {
      console.error('Error withdrawing from HTLC:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Refund HTLC after timeout
  const refundHTLC = async (contractId: `0x${string}`) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected')
    }

    if (!config.contracts.ethereum.htlc) {
      throw new Error('HTLC contract address not configured')
    }

    setIsLoading(true)
    try {
      const txHash = await walletClient.writeContract({
        address: config.contracts.ethereum.htlc as `0x${string}`,
        abi: ETHEREUM_HTLC_ABI,
        functionName: 'refund',
        args: [contractId]
      })

      return txHash
    } catch (error) {
      console.error('Error refunding HTLC:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createHTLC,
    withdrawHTLC,
    refundHTLC,
    isLoading
  }
}

// Hook to read HTLC contract data
export function useHTLCData(contractId?: `0x${string}`) {
  const { data: contractData, isLoading, error } = useContractRead({
    address: config.contracts.ethereum.htlc as `0x${string}`,
    abi: ETHEREUM_HTLC_ABI,
    functionName: 'contracts',
    args: contractId ? [contractId] : undefined,
    enabled: !!contractId && !!config.contracts.ethereum.htlc
  })

  return {
    contractData,
    isLoading,
    error,
    isWithdrawn: contractData?.[5] || false,
    isRefunded: contractData?.[6] || false,
    amount: contractData?.[2] ? formatEther(contractData[2]) : '0',
    timelock: contractData?.[4] ? Number(contractData[4]) : 0,
    sender: contractData?.[0],
    receiver: contractData?.[1],
    hashlock: contractData?.[3],
    preimage: contractData?.[7]
  }
}

// Hook for Fusion Order operations
export function useFusionOrderSettler() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [isLoading, setIsLoading] = useState(false)

  const fillOrder = async (orderParams: {
    salt: bigint
    makerAsset: `0x${string}`
    takerAsset: `0x${string}`
    maker: `0x${string}`
    receiver: `0x${string}`
    allowedSender: `0x${string}`
    makingAmount: bigint
    takingAmount: bigint
    signature: `0x${string}`
    fillMakingAmount: bigint
    fillTakingAmount: bigint
  }) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected')
    }

    if (!config.contracts.ethereum.fusionOrderSettler) {
      throw new Error('FusionOrderSettler contract address not configured')
    }

    const order = {
      salt: orderParams.salt,
      makerAsset: orderParams.makerAsset,
      takerAsset: orderParams.takerAsset,
      maker: orderParams.maker,
      receiver: orderParams.receiver,
      allowedSender: orderParams.allowedSender,
      makingAmount: orderParams.makingAmount,
      takingAmount: orderParams.takingAmount
    }

    setIsLoading(true)
    try {
      const txHash = await walletClient.writeContract({
        address: config.contracts.ethereum.fusionOrderSettler as `0x${string}`,
        abi: FUSION_ORDER_SETTLER_ABI,
        functionName: 'fillOrder',
        args: [
          order,
          orderParams.signature,
          orderParams.fillMakingAmount,
          orderParams.fillTakingAmount
        ]
      })

      return txHash
    } catch (error) {
      console.error('Error filling order:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    fillOrder,
    isLoading
  }
}

// Hook to check if contracts are configured
export function useContractStatus() {
  const htlcConfigured = !!config.contracts.ethereum.htlc
  const fusionSettlerConfigured = !!config.contracts.ethereum.fusionOrderSettler
  const neutronConfigured = !!config.contracts.neutron.htlcCodeId

  return {
    htlcConfigured,
    fusionSettlerConfigured,
    neutronConfigured,
    allConfigured: htlcConfigured && fusionSettlerConfigured && neutronConfigured,
    missingContracts: [
      !htlcConfigured && 'Ethereum HTLC',
      !fusionSettlerConfigured && 'Fusion Order Settler',
      !neutronConfigured && 'Neutron HTLC'
    ].filter(Boolean)
  }
} 