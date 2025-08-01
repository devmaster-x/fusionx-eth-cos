# FusionX Frontend Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- Your deployed contract addresses
- A WalletConnect Project ID

## Environment Configuration

### 1. Create Environment File

Create a `.env.local` file in the `frontend/` directory:

```bash
cd frontend
touch .env.local
```

### 2. Configure Environment Variables

Copy this template into your `.env.local` file and update with your actual values:

```env
# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# RPC URLs
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://ethereum.publicnode.com
NEXT_PUBLIC_NEUTRON_RPC_URL=https://rpc-kralum.neutron-1.neutron.org

# Chain IDs
NEXT_PUBLIC_ETHEREUM_CHAIN_ID=1
NEXT_PUBLIC_NEUTRON_CHAIN_ID=neutron-1

# Contract Addresses (UPDATE WITH YOUR DEPLOYED CONTRACT ADDRESSES)
NEXT_PUBLIC_ETHEREUM_HTLC_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_FUSION_ORDER_SETTLER_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_NEUTRON_HTLC_CODE_ID=123
NEXT_PUBLIC_NEUTRON_HTLC_ADDRESS=neutron1...

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
```

### 3. For Testnet Development

If you're using testnets (recommended for development), update these values:

```env
# Use Sepolia testnet for Ethereum
NEXT_PUBLIC_ETHEREUM_CHAIN_ID=11155111
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Use Neutron testnet
NEXT_PUBLIC_NEUTRON_CHAIN_ID=pion-1
NEXT_PUBLIC_NEUTRON_RPC_URL=https://rpc-palvus.pion-1.ntrn.tech
```

## Required Contract Information

You need the following deployed contract addresses:

### Ethereum Contracts
1. **HTLC Contract** (`NEXT_PUBLIC_ETHEREUM_HTLC_ADDRESS`)
   - The main HTLC contract for Ethereum side
   - Should implement: `newContract`, `withdraw`, `refund` functions

2. **Fusion Order Settler** (`NEXT_PUBLIC_FUSION_ORDER_SETTLER_ADDRESS`)
   - Contract for handling 1inch Fusion+ orders
   - Should implement: `fillOrder` function

### Neutron Contracts
1. **HTLC Code ID** (`NEXT_PUBLIC_NEUTRON_HTLC_CODE_ID`)
   - The CosmWasm code ID for the deployed HTLC contract on Neutron
2. **HTLC Contract Address** (`NEXT_PUBLIC_NEUTRON_HTLC_ADDRESS`)
   - The deployed HTLC contract address on Neutron

## Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Update `.env.local` with your contract addresses
   - Get a WalletConnect Project ID from https://cloud.walletconnect.com/

3. **Update Contract ABIs (if needed)**
   - If your contracts have different ABIs, update them in `lib/contracts.ts`
   - The current ABIs are generic examples

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Verify Configuration**
   - Visit `/admin` to check your configuration status
   - Ensure all contracts show as "Configured"

## Contract ABI Updates

If your deployed contracts have different ABIs than the defaults, update them in `frontend/lib/contracts.ts`:

```typescript
export const ETHEREUM_HTLC_ABI = [
  // Your actual contract ABI here
] as const

export const FUSION_ORDER_SETTLER_ABI = [
  // Your actual contract ABI here
] as const
```

## Troubleshooting

### Common Issues

1. **"Contracts Not Configured" Error**
   - Check that all environment variables are set correctly
   - Restart the development server after changing `.env.local`

2. **"HTLC contract address not configured" Error**
   - Verify `NEXT_PUBLIC_ETHEREUM_HTLC_ADDRESS` is set and valid
   - Check that the address starts with `0x`

3. **Transaction Failures**
   - Ensure your contracts are deployed and verified
   - Check that the ABI matches your deployed contract
   - Verify you're on the correct network

4. **Wallet Connection Issues**
   - Make sure you have a valid WalletConnect Project ID
   - Check that MetaMask is connected to the correct network

### Getting Contract Information

If you need to find your deployed contract addresses:

1. **From deployment scripts**: Check your deployment logs
2. **From block explorer**: Look up recent transactions from your deployer address
3. **From contract artifacts**: Check `deployments/` or `broadcasts/` directories

## Next Steps

Once configured:

1. **Test the swap functionality** on testnet first
2. **Verify HTLC creation** works with your contracts
3. **Test cross-chain interactions** with Neutron
4. **Update the UI** as needed for your specific use case

## Production Deployment

For production:

1. Update `NEXT_PUBLIC_ENVIRONMENT=production`
2. Use mainnet chain IDs and RPC URLs
3. Ensure all contracts are properly audited
4. Set up proper monitoring and error handling

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify contract addresses on block explorers
3. Test individual contract functions using a tool like Remix
4. Review the contract interaction logs 