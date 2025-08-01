// Atomic Swap Flow Implementation for FusionX
// Based on the teammate's detailed flow description

import { generateSecret, calculateTimelock } from './contracts'
import { 
  connectKeplr,
  getSigningCosmWasmClient,
  getCosmWasmClient,
  getNeutronAddress,
  neutronGasPrice
} from './cosmos'
import { config } from './config'

export interface SwapFlowState {
  step: number
  secret?: string
  hashlock?: string
  timelock?: number
  cosmosContractId?: string
  ethereumTxHash?: string
  status: 'idle' | 'preparing' | 'cosmos_locked' | 'ethereum_filled' | 'claimed' | 'completed' | 'error'
  error?: string
}

export interface SwapParams {
  fromAmount: string
  toAmount: string
  recipientAddress: string // Bob's address
  timeoutMinutes?: number
}

// Utility to convert amount to microunits
function toMicroNeutron(amount: string): string {
  return (parseFloat(amount) * 1_000_000).toString()
}

// Step 1: Generate Secret and Hashlock
export async function generateSwapSecret(): Promise<{ secret: string; hashlock: string }> {
  const { secret, hash } = generateSecret()
  return {
    secret,
    hashlock: hash
  }
}

// Step 2: Create HTLC on Cosmos (Bob's action)
export async function createCosmosHTLC(
  params: {
    amount: string
    recipient: string
    hashlock: string
    timeoutMinutes?: number
  }
): Promise<{ contractId: string; txHash: string }> {
  try {
    // Connect to Keplr and get address
    const offlineSigner = await connectKeplr()
    const address = await getNeutronAddress()
    
    // Create signing client
    const client = await getSigningCosmWasmClient(offlineSigner)
    
    // Calculate timelock
    const timelock = calculateTimelock(params.timeoutMinutes || 60)
    
    // Convert amount to microunits
    const amountInMicro = toMicroNeutron(params.amount)
    
    // Create HTLC message for Neutron contract
    const msg = {
      create_htlc: {
        hashlock: params.hashlock,
        timelock: Number(timelock),
        receiver: params.recipient,
      }
    }

    const funds = [{ denom: 'untrn', amount: amountInMicro }]

    // Execute the contract
    const result = await client.execute(
      address,
      config.contracts.neutron.htlcAddress || '',
      msg,
      'auto',
      undefined,
      funds
    )
    
    return {
      contractId: result.transactionHash, // This might need adjustment based on your contract
      txHash: result.transactionHash
    }
  } catch (error) {
    console.error('Error creating Cosmos HTLC:', error)
    throw error
  }
}

// Step 3: Fill Fusion+ Order on Ethereum (Alice's action)
export async function fillFusionOrder(
  params: {
    secret: string
    amount: string
    recipient: string
  }
): Promise<{ txHash: string }> {
  // This would integrate with 1inch Fusion+ API
  // For demo purposes, we'll simulate this step
  
  console.log('Filling Fusion+ order with secret:', params.secret)
  console.log('Amount:', params.amount)
  console.log('Recipient:', params.recipient)
  
  // In real implementation, this would:
  // 1. Create a Fusion+ order on 1inch
  // 2. Include the secret in the order
  // 3. Wait for the order to be filled
  // 4. Return the transaction hash
  
  return {
    txHash: '0x' + Math.random().toString(16).substring(2, 66) // Mock tx hash
  }
}

// Step 4: Claim tokens on Cosmos using secret
export async function claimCosmosTokens(
  params: {
    contractId: string
    secret: string
  }
): Promise<{ txHash: string }> {
  try {
    // Connect to Keplr and get address
    const offlineSigner = await connectKeplr()
    const address = await getNeutronAddress()
    
    // Create signing client
    const client = await getSigningCosmWasmClient(offlineSigner)
    
    // Claim message for Neutron contract
    const msg = {
      claim: {
        contract_id: params.contractId,
        secret: params.secret,
      }
    }

    // Execute the claim
    const result = await client.execute(
      address,
      config.contracts.neutron.htlcAddress || '',
      msg,
      'auto'
    )
    
    return {
      txHash: result.transactionHash
    }
  } catch (error) {
    console.error('Error claiming Cosmos tokens:', error)
    throw error
  }
}

// Step 5: Claim ETH from Fusion+ (Bob's action)
export async function claimEthereumTokens(
  params: {
    secret: string
    orderId: string
  }
): Promise<{ txHash: string }> {
  // This would integrate with 1inch LOP settlement
  // For demo purposes, we'll simulate this step
  
  console.log('Claiming ETH from Fusion+ with secret:', params.secret)
  console.log('Order ID:', params.orderId)
  
  // In real implementation, this would:
  // 1. Submit the secret to the LOP settlement contract
  // 2. Claim the ETH from the Fusion+ order
  // 3. Return the transaction hash
  
  return {
    txHash: '0x' + Math.random().toString(16).substring(2, 66) // Mock tx hash
  }
}

// Query HTLC status on Cosmos
export async function queryCosmosHTLCStatus(contractId: string): Promise<any> {
  try {
    const client = await getCosmWasmClient()
    
    const query = {
      get_htlc: {
        contract_id: contractId,
      }
    }

    const status = await client.queryContractSmart(
      config.contracts.neutron.htlcAddress || '',
      query
    )
    
    return status
  } catch (error) {
    console.error('Error querying Cosmos HTLC status:', error)
    throw error
  }
}

// Complete swap flow orchestrator
export async function executeAtomicSwap(
  params: SwapParams,
  onStepUpdate?: (step: number, status: string) => void
): Promise<SwapFlowState> {
  const state: SwapFlowState = {
    step: 0,
    status: 'preparing'
  }
  
  try {
    // Step 1: Generate secret and hashlock
    onStepUpdate?.(1, 'Generating secret and hashlock...')
    const { secret, hashlock } = await generateSwapSecret()
    state.secret = secret
    state.hashlock = hashlock
    state.step = 1
    
    // Step 2: Create HTLC on Cosmos (Bob's action)
    onStepUpdate?.(2, 'Creating HTLC on Cosmos...')
    const cosmosResult = await createCosmosHTLC({
      amount: params.toAmount,
      recipient: params.recipientAddress,
      hashlock: hashlock,
      timeoutMinutes: params.timeoutMinutes || 60
    })
    state.cosmosContractId = cosmosResult.contractId
    state.step = 2
    state.status = 'cosmos_locked'
    
    // Step 3: Fill Fusion+ order on Ethereum (Alice's action)
    onStepUpdate?.(3, 'Filling Fusion+ order on Ethereum...')
    const fusionResult = await fillFusionOrder({
      secret: secret,
      amount: params.fromAmount,
      recipient: params.recipientAddress
    })
    state.ethereumTxHash = fusionResult.txHash
    state.step = 3
    state.status = 'ethereum_filled'
    
    // Step 4: Claim tokens on Cosmos
    onStepUpdate?.(4, 'Claiming tokens on Cosmos...')
    const claimResult = await claimCosmosTokens({
      contractId: cosmosResult.contractId,
      secret: secret
    })
    state.step = 4
    state.status = 'claimed'
    
    // Step 5: Claim ETH from Fusion+ (Bob's action)
    onStepUpdate?.(5, 'Claiming ETH from Fusion+...')
    const ethClaimResult = await claimEthereumTokens({
      secret: secret,
      orderId: fusionResult.txHash // This would be the actual order ID
    })
    state.step = 5
    state.status = 'completed'
    
    return state
    
  } catch (error: any) {
    state.status = 'error'
    state.error = error.message
    throw error
  }
} 