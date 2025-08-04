use cosmwasm_schema::cw_serde;
use cosmwasm_std::{Addr, Uint128};
use cw_storage_plus::Item;
use cw_storage_plus::Map;

// Note: Escrow struct is now defined in contract.rs for optimization
// This file is kept for backward compatibility and future state structures

// Storage keys for backward compatibility
pub const ESCROWS: Map<String, crate::contract::Escrow> = Map::new("escrows");
