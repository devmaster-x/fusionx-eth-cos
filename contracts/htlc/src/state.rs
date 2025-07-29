use cosmwasm_schema::cw_serde;
use cosmwasm_std::{Addr, Binary, Coin};
use cw_storage_plus::Map;
use cw_storage_plus::Item;

pub type SwapId = String;

pub const ADMIN: Item<Addr> = Item::new("admin");

/// The Escrow represents an active swap
#[cw_serde]
pub struct Escrow {
    pub initiator: Addr,         // Cosmos address that created the escrow
    pub recipient: Addr,         // Recipient address for the funds
    pub hashlock: Binary,        // keccak256(secret)
    pub timelock: u64,           // Expiration timestamp (in seconds)
    pub amount: Coin,            // Amount and denomination of tokens locked
    pub claimed: bool,           // Whether the funds have been claimed
    pub refunded: bool,          // Whether the funds have been refunded
}

/// Map of swap ID → Escrow
pub const ESCROWS: Map<SwapId, Escrow> = Map::new("escrows");
