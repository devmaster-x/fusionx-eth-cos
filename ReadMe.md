# FusionX – Ethereum ↔ Cosmos Cross-Chain Swaps with Hashlocks & Timelocks

A Unite DeFi Hackathon project building a **fully onchain, bidirectional swap bridge** between Ethereum and Cosmos using **HTLC (Hash Time Locked Contracts)** and **1inch Fusion+** order settlement.

## 🌉 Project Overview

**FusionX** enables secure, atomic cross-chain swaps between Ethereum and Cosmos chains. Leveraging **1inch Fusion+** and a **CosmWasm-based HTLC**, users can trustlessly initiate swaps from one chain and settle on the other—without relying on off-chain infrastructure.

- Ethereum → Cosmos swaps via HTLC & secret reveal
- Cosmos → Ethereum swaps with preimage symmetry
- Powered by **Solidity**, **CosmWasm**, and **Next.js**
- Compatible with MetaMask, Keplr, and Leap wallets

---

## 👥 Team Roles

### 🔐 Smart Contract Dev
- Solidity HTLC + Fusion+ settlement (`FusionOrderSettler.sol`, `EthereumHTLC.sol`)
- CosmWasm HTLC in Rust (`CosmosHTLC.rs`)
- Deploy to testnets (e.g., Sepolia, Juno, Osmosis)
- Provide ABI and deployment metadata

### 🖥 Frontend Dev
- Build **React/Next.js** DApp
- Connect Ethereum (MetaMask) and Cosmos (Keplr/Leap)
- Use Viem, Wagmi, RainbowKit (Ethereum)
- Use CosmJS (Cosmos)
- UI for swap initiation, tracking, claiming

---

## 🔧 Core Components

### 1. Ethereum Side – Solidity
- `FusionOrderSettler.sol`: Initiates HTLCs based on 1inch Fusion+ orders
- `EthereumHTLC.sol`: Locks ETH/ERC20 with hashlock + timelock
- Preimage reveal enables secure claim

### 2. Cosmos Side – CosmWasm
- `CosmosHTLC.rs`: Locks ATOM/CW20 with identical hash and timelock
- Claim enabled once preimage is revealed from Ethereum

### 3. Frontend DApp – Next.js
- Wallet connections: MetaMask (EVM), Keplr/Leap (Cosmos)
- Swap creation UI: amount, chain, hashlock, timelock
- Status tracking:
  - `Locked`
  - `Awaiting secret`
  - `Claimed` / `Refunded`
- Visuals for Ethereum ↔ Cosmos flow

---

## 🔄 Swap Flow

### Ethereum → Cosmos
1. Alice locks ETH in Ethereum HTLC via FusionOrderSettler
2. Bob claims ATOM on Cosmos by revealing the secret
3. Alice uses revealed secret to unlock ETH

### Cosmos → Ethereum
1. Bob locks ATOM in Cosmos HTLC
2. Alice claims ATOM by revealing preimage
3. Bob uses revealed preimage to unlock ETH

✅ Hashlock and timelock enforced on both chains for trustless swaps.

---

## 🧱 Tech Stack

### Smart Contracts
- **Ethereum**: Solidity + Foundry
- **Cosmos**: CosmWasm + Rust

### Frontend
- React + Next.js
- Tailwind CSS
- Ethereum: Viem + Wagmi + RainbowKit
- Cosmos: CosmJS + Keplr/Leap

### Dev Tools
- GitHub
- Foundry / Hardhat Anvil
- Remix (EVM test)
- Neutron Testnet

---

## ✨ Stretch Goals

| Feature            | Description                                |
|--------------------|--------------------------------------------|
| UI/UX Polish       | Clean, intuitive design for end users      |
| Partial Fill Logic | Support claiming partial HTLC balances     |
| Relayer Service    | Automate claims with offchain script       |
| Resolver Registry  | Select best claimant for atomic routing    |
| Realtime OrderBook | Fusion+-style order book display           |

---

## ✅ Submission Checklist

- [x] Bidirectional HTLCs with hashlock + timelock
- [x] Working Ethereum ↔ Cosmos preimage swap
- [x] Contracts deployed and verifiable
- [x] Frontend DApp with wallet integration
- [x] Demo showcasing full flow (ETH → NTRN)

---

## 📂 Project Structure

