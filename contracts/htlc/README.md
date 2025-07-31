# 1inch Fusion+ Cross-Chain HTLC

A CosmWasm implementation of Hash Time-Locked Contracts enabling secure bidirectional swaps between Ethereum and Cosmos chains, extending 1inch Fusion+ functionality.

## Architecture Overview

This implementation adapts Ethereum's HTLC pattern to Cosmos while adding cross-chain capabilities:

### Key Enhancements Over Traditional HTLC
- **Bidirectional Swaps**: Supports both Ethereum→Cosmos and Cosmos→Ethereum flows  
- **1inch Fusion+ Integration**: Compatible with RFQ order matching  
- **Cross-Chain Verification**: IBC/axelar ready for message passing  
- **Partial Fills**: Supports splitting large orders  

## Core Components

### Smart Contracts
- **HTLC Core** (`src/contract.rs`) - Main escrow logic with hashlock/timelock  
- **Factory** (planned) - Manages escrow instances  
- **Relayer** (planned) - Cross-chain message forwarding  

### Message Handlers
- **Execute** (`src/msg.rs`):  
  `CreateEscrow`, `Claim`, `Refund`, `UpdateParameters`  
- **Query** (`src/msg.rs`):  
  `GetEscrow`, `ListActiveSwaps`  

## Technical Specifications

### Key Differences from Ethereum HTLC
| Feature          | Ethereum Version | This Implementation |
|------------------|------------------|---------------------|
| Platform         | Solidity         | CosmWasm (Rust)     |
| Address Format   | Hex (0x...)      | Bech32 (cosmos1...) |
| Token Standards  | ERC20            | CW20 + Native       |
| Cross-Chain      | Bridge Dependent | Native IBC Support  |

## Getting Started

### Prerequisites
- Rust 1.68+  
- `wasm32-unknown-unknown` target  
- CosmWasm 1.2+  
- Node.js (for deployment scripts)  

### Build & Test
```bash
# Compile optimized WASM
cargo wasm
wasm-opt -Os ./target/wasm32-unknown-unknown/release/htlc.wasm -o ./artifacts/htlc-optimized.wasm

# Run tests
cargo test --features=testing

---
Deployment
# Deploy to Neutron testnet
wasmd tx wasm store artifacts/htlc-optimized.wasm \
  --from wallet \
  --chain-id pion-1 \
  --gas auto \
  --gas-adjustment 1.3 \
  -y

---
Contract Structure
text
src/
├── contract.rs  # Core HTLC logic (create/claim/refund)
├── state.rs     # Escrow state and storage
├── msg.rs       # Message schemas
├── error.rs     # Custom error handling
└── lib.rs       # Contract entry points
tests/
├── unit/        # Isolated function tests
└── integration/ # End-to-end flow tests

---
Security Features
Hashlock Verification: SHA-256 secret matching

Timelock Enforcement: Block-based expiration

Funds Safeguards:

Automatic refunds after expiry

Rescue mode for stuck funds
