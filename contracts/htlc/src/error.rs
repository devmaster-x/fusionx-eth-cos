use cosmwasm_std::StdError;
use thiserror::Error;
use cosmwasm_std::Uint128;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Invalid bech32 address")]
    InvalidAddress,

    #[error("Hashlock must be 32-byte hex (got {0})")]
    InvalidHashlock(String),

    #[error("Timelock must be in future (current {current}, got {timelock})")]
    InvalidTimelock { current: u64, timelock: u64 },

    #[error("Insufficient funds (required {required}, got {sent})")]
    InsufficientFunds { required: Uint128, sent: Uint128 },

    #[error("Escrow already claimed or refunded")]
    EscrowClosed,

    #[error("Escrow not found")]
    EscrowNotFound,

    #[error("Invalid secret (does not match hashlock)")]
    InvalidSecret,

    #[error("Timelock not expired (expires: {expires}, current: {current})")]
    TimelockNotExpired { expires: u64, current: u64 },

    #[error("Unsupported token: {0}")]
    UnsupportedToken(String),
}
