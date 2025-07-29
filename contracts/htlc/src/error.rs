use cosmwasm_std::{StdError};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Timelock must be in the future")]
    InvalidTimelock {},

    #[error("Hashlock must be 32-byte hex string")]
    InvalidHashlock {},

    #[error("Swap with this ID already exists")]
    SwapAlreadyExists {},

    #[error("Funds sent do not match required amount")]
    InvalidFunds {},

    #[error("No funds sent with escrow creation")]
    NoFundsSent {},

    #[error("Swap not found")]
    SwapNotFound {},

    #[error("Invalid secret provided")]
    InvalidSecret {},

    #[error("Swap already claimed")]
    SwapAlreadyClaimed {},

    #[error("Swap already refunded")]
    SwapAlreadyRefunded {},

    #[error("Timelock has not expired yet")]
    TimelockNotExpired {},

    #[error("Timelock has expired")]
    TimelockExpired {},

    #[error("Only initiator can refund")]
    UnauthorizedRefund {},

    #[error("Only recipient can redeem")]
    UnauthorizedRedeem {},
}
