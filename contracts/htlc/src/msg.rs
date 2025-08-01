use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::{Addr, Uint128};
use crate::state::Escrow;

#[cw_serde]
pub struct InstantiateMsg {
    pub admin: Option<Addr>, // Optional admin for upgrades
}

#[cw_serde]
pub enum ExecuteMsg {
    CreateEscrow {
        recipient: String,   // Bech32 address
        hashlock: String,    // Hex-encoded keccak256(secret)
        timelock: u64,       // Expiration timestamp (seconds)
        token: String,       // "uatom" or CW20 address
        amount: Uint128,
    },
    Claim {
        hashlock: String,    // Identify the escrow
        secret: String,      // Preimage to unlock
    },
    Refund {
        hashlock: String,    // Identify the escrow
    },
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns(Escrow)]
    GetEscrow { hashlock: String },
}

#[cw_serde]
pub struct EscrowResponse {
    pub creator: String,
    pub recipient: String,
    pub hashlock: String,
    pub timelock: u64,
    pub token: String,
    pub amount: Uint128,
    pub is_claimed: bool,
    pub is_refunded: bool,
}
