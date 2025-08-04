use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::{Addr, Uint128};

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
    CreateBatchEscrows {
        escrows: Vec<EscrowInput>, // Batch escrow creation
    },
    Claim {
        hashlock: String,    // Identify the escrow
        secret: String,      // Preimage to unlock
    },
    Refund {
        hashlock: String,    // Identify the escrow
    },
    UpdateConfig {
        claim_fee: Option<Uint128>,
        refund_fee: Option<Uint128>,
        max_batch_size: Option<u32>,
        paused: Option<bool>,
    },
}

#[cw_serde]
pub struct EscrowInput {
    pub recipient: String,
    pub hashlock: String,
    pub timelock: u64,
    pub token: String,
    pub amount: Uint128,
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns(EscrowResponse)]
    GetEscrow { hashlock: String },
    #[returns(BatchEscrowResponse)]
    GetBatchEscrows { hashlocks: Vec<String> },
    #[returns(UserEscrowsResponse)]
    GetUserEscrows { user: String },
    #[returns(ConfigResponse)]
    GetConfig {},
}

#[cw_serde]
pub struct EscrowResponse {
    pub creator: String,
    pub recipient: String,
    pub hashlock: String,
    pub timelock: u64,
    pub token: String,
    pub amount: Uint128,
    pub status: u8, // 0=active, 1=claimed, 2=refunded
}

#[cw_serde]
pub struct BatchEscrowResponse {
    pub escrows: Vec<EscrowResponse>,
}

#[cw_serde]
pub struct UserEscrowsResponse {
    pub escrow_ids: Vec<String>,
    pub count: u32,
}

#[cw_serde]
pub struct ConfigResponse {
    pub claim_fee: Uint128,
    pub refund_fee: Uint128,
    pub max_batch_size: u32,
    pub paused: bool,
}
