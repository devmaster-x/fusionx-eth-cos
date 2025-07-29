use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::Addr;
use cosmwasm_std::Coin;


/// InstantiateMsg allows optional admin setup during deployment
#[cw_serde]
pub struct InstantiateMsg {
    pub admin: Option<Addr>,
}

#[cw_serde]
pub enum ExecuteMsg {
    CreateEscrow {
        swap_id: String,
        hashlock: String,      // hex-encoded SHA-256 hash
        timelock: u64,         // UNIX timestamp in seconds
        recipient: String,     // address to receive funds if hash is revealed
        amount: Coin,      // includes denom + amount
    },
    // Redeem funds by revealing the secret
    Redeem {
        swap_id: String,
        secret: String,        // hex-encoded secret that hashes to the hashlock
    },
    // Refund funds after timelock expires
    Refund {
        swap_id: String,
    },
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    /// Get escrow details by swap_id
    #[returns(EscrowResponse)]
    GetEscrow { swap_id: String },
    
    /// Get all escrows for a specific initiator
    #[returns(Vec<EscrowResponse>)]
    GetEscrowsByInitiator { initiator: String },
    
    /// Get all escrows for a specific recipient
    #[returns(Vec<EscrowResponse>)]
    GetEscrowsByRecipient { recipient: String },
}

#[cw_serde]
pub struct EscrowResponse {
    pub swap_id: String,
    pub initiator: Addr,
    pub recipient: Addr,
    pub hashlock: String,      // hex-encoded hash
    pub timelock: u64,
    pub amount: Coin,
    pub claimed: bool,
    pub refunded: bool,
}
