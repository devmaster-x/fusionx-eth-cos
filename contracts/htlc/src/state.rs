use cosmwasm_schema::cw_serde;
use cosmwasm_std::{Addr, Uint128};
use cw_storage_plus::Item;
use cw_storage_plus::Map;

#[cw_serde]
pub struct Escrow {
    pub creator: Addr,
    pub recipient: Addr,
    pub hashlock: String,     // Hex-encoded keccak256(secret)
    pub timelock: u64,       // Expiration timestamp
    pub token: String,       // "uatom" or CW20 addr
    pub amount: Uint128,
    pub is_claimed: bool,
    pub is_refunded: bool,
}

// Key: hashlock, Value: Escrow
pub const ESCROWS: Map<String, Escrow> = Map::new("escrows");
