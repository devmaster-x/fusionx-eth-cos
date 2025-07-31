# FusionX Frontend

A modern, responsive web application for cross-chain swaps between Ethereum and Neutron using HTLC and 1inch Fusion+ technology.

## 🚀 Features

- **Cross-Chain Swaps**: ETH ↔ NTRN swaps with HTLC security
- **Dutch Auction System**: Time-decay price discovery with partial fills
- **Real-time Tracking**: Live auction progress and fill events
- **Wallet Integration**: RainbowKit (Ethereum) + Keplr (Neutron)
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Order Management**: Track active, settled, and expired orders

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Ethereum**: Wagmi + RainbowKit + Viem
- **Cosmos**: CosmJS for Neutron integration
- **Icons**: Lucide React
- **Charts**: Recharts (for auction curves)

## 📦 Installation

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Setup**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/your_key
   NEXT_PUBLIC_NEUTRON_RPC_URL=https://neutron-rpc.publicnode.com
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (`#0ea5e9` to `#0284c7`)
- **Secondary**: Purple gradient (`#d946ef` to `#c026d3`)
- **Neutral**: Gray scale for text and backgrounds

### Components
- **Cards**: Clean, elevated containers with subtle shadows
- **Buttons**: Primary (filled) and secondary (outlined) variants
- **Inputs**: Consistent form fields with focus states
- **Modals**: Overlay dialogs for confirmations and actions

## 📱 Pages & Routes

### `/` - Landing Page
- Hero section with main CTA
- Live statistics (ETH/NTRN prices, active auctions)
- Feature highlights (HTLC security, Dutch auctions, gas-free fills)

### `/swap` - Swap Interface
- Token input fields with balance display
- Advanced settings (slippage, expiration, partial fills)
- Live auction preview with price curve
- Confirmation modal with HTLC details

### `/swap/[auctionId]` - Auction Progress
- Real-time auction timeline
- Dutch curve visualization
- Fill events from resolvers
- Cancel functionality for active orders

### `/settled/[auctionId]` - Order Settlement
- Swap summary with transaction details
- Resolver information
- Claim functionality for NTRN tokens
- Export receipt option

### `/my-orders` - Order Management
- Tabbed view (Active/Settled/Expired)
- Order cards with status indicators
- Quick actions (View/Claim)
- Empty states with CTAs

## 🔧 Configuration

### WalletConnect Setup
1. Get a project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Add it to your environment variables
3. Update the project ID in `app/providers.tsx`

### Network Configuration
- **Ethereum**: Mainnet and Sepolia testnet
- **Neutron**: Mainnet and testnet support
- Add custom RPC URLs in environment variables

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

## 📊 Analytics & Monitoring

- **Performance**: Core Web Vitals tracking
- **User Analytics**: Page views and interactions
- **Error Tracking**: Sentry integration (optional)
- **Auction Metrics**: Fill rates and resolver performance

## 🔒 Security Features

- **HTLC Integration**: Hash Time-Locked Contracts for atomic swaps
- **Wallet Validation**: Secure wallet connection handling
- **Transaction Signing**: Safe transaction confirmation flows
- **Input Validation**: Client-side validation with server verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

Built with ❤️ for the Unite DeFi Hackathon 