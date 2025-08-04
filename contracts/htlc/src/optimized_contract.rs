use cosmwasm_std::{BankMsg, Coin, CosmosMsg, StdError, Response, Addr, Uint128, Binary, Deps, DepsMut, Env, MessageInfo, StdResult, to_binary};
use sha3::{Digest, Keccak256};
use hex;
use cw_storage_plus::{Map, Item};
use cosmwasm_schema::cw_serde;
use crate::msg::{InstantiateMsg, ExecuteMsg, QueryMsg, EscrowResponse, BatchEscrowResponse};
use crate::error::ContractError;

// Optimized state management
#[cw_serde]
pub struct Escrow {
    pub creator: Addr,
    pub recipient: Addr,
    pub hashlock: String,     // Hex-encoded keccak256(secret)
    pub timelock: u64,       // Expiration timestamp
    pub token: String,       // "uatom" or CW20 addr
    pub amount: Uint128,
    pub status: u8,          // 0=active, 1=claimed, 2=refunded
}

// Batch operations tracking
#[cw_serde]
pub struct UserEscrows {
    pub escrow_ids: Vec<String>,
    pub count: u32,
}

// Contract configuration
#[cw_serde]
pub struct Config {
    pub claim_fee: Uint128,
    pub refund_fee: Uint128,
    pub max_batch_size: u32,
    pub paused: bool,
}

// Storage keys
pub const ESCROWS: Map<String, Escrow> = Map::new("escrows");
pub const USER_ESCROWS: Map<&Addr, UserEscrows> = Map::new("user_escrows");
pub const CONFIG: Item<Config> = Item::new("config");

// Status constants
pub const STATUS_ACTIVE: u8 = 0;
pub const STATUS_CLAIMED: u8 = 1;
pub const STATUS_REFUNDED: u8 = 2;

// Entry points
#[cfg_attr(not(feature = "library"), cosmwasm_std::entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    _msg: InstantiateMsg,
) -> StdResult<Response> {
    // Initialize default configuration
    let config = Config {
        claim_fee: Uint128::new(1000), // 1000 uatom
        refund_fee: Uint128::new(500),  // 500 uatom
        max_batch_size: 10,
        paused: false,
    };
    CONFIG.save(deps.storage, &config)?;
    
    Ok(Response::default())
}

#[cfg_attr(not(feature = "library"), cosmwasm_std::entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    // Check if contract is paused
    let config = CONFIG.load(deps.storage)?;
    if config.paused {
        return Err(ContractError::ContractPaused);
    }

    match msg {
        ExecuteMsg::CreateEscrow {
            recipient,
            hashlock,
            timelock,
            token,
            amount
        } => execute_create_escrow(deps, env, info, recipient, hashlock, timelock, token, amount),
        ExecuteMsg::CreateBatchEscrows {
            escrows
        } => execute_create_batch_escrows(deps, env, info, escrows),
        ExecuteMsg::Claim { hashlock, secret } => execute_claim(deps, env, info, hashlock, secret),
        ExecuteMsg::Refund { hashlock } => execute_refund(deps, env, info, hashlock),
        ExecuteMsg::UpdateConfig {
            claim_fee,
            refund_fee,
            max_batch_size,
            paused
        } => execute_update_config(deps, info, claim_fee, refund_fee, max_batch_size, paused),
    }
}

pub fn execute_create_escrow(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    recipient: String,
    hashlock: String,
    timelock: u64,
    token: String,
    amount: Uint128,
) -> Result<Response, ContractError> {
    // Validate recipient address
    let recipient_addr = deps.api.addr_validate(&recipient)
        .map_err(|_| ContractError::InvalidAddress)?;

    // Validate hashlock format
    let hashlock_bytes = hex::decode(hashlock.trim_start_matches("0x"))
        .map_err(|_| ContractError::InvalidHashlock(hashlock.clone()))?;

    if hashlock_bytes.len() != 32 {
        return Err(ContractError::InvalidHashlock(hashlock));
    }

    // Validate timelock
    if timelock <= env.block.time.seconds() {
        return Err(ContractError::InvalidTimelock {
            current: env.block.time.seconds(),
            timelock,
        });
    }

    // Check if escrow already exists
    if ESCROWS.has(deps.storage, hashlock.clone()) {
        return Err(ContractError::EscrowAlreadyExists);
    }

    // Handle token transfer
    let mut response = Response::new();
    match token.as_str() {
        "uatom" => {
            let sent_amount = info.funds.iter()
                .find(|coin| coin.denom == "uatom")
                .map(|coin| coin.amount)
                .unwrap_or_default();

            if sent_amount < amount {
                return Err(ContractError::InsufficientFunds {
                    required: amount,
                    sent: sent_amount,
                });
            }
        },
        _ => return Err(ContractError::UnsupportedToken(token)),
    }

    // Create escrow
    let escrow = Escrow {
        creator: info.sender.clone(),
        recipient: recipient_addr,
        hashlock: hashlock.clone(),
        timelock,
        token,
        amount,
        status: STATUS_ACTIVE,
    };

    // Save escrow
    ESCROWS.save(deps.storage, hashlock.clone(), &escrow)?;

    // Update user escrows tracking
    update_user_escrows(deps.storage, &info.sender, &hashlock)?;

    Ok(response
        .add_attribute("action", "create_escrow")
        .add_attribute("creator", info.sender)
        .add_attribute("recipient", recipient)
        .add_attribute("hashlock", hashlock)
        .add_attribute("amount", amount.to_string()))
}

pub fn execute_create_batch_escrows(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    escrows: Vec<crate::msg::EscrowInput>,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;
    
    if escrows.is_empty() || escrows.len() > config.max_batch_size as usize {
        return Err(ContractError::InvalidBatchSize);
    }

    let mut response = Response::new();
    let mut total_amount = Uint128::zero();
    let mut created_escrows = Vec::new();

    for escrow_input in escrows {
        // Validate recipient
        let recipient_addr = deps.api.addr_validate(&escrow_input.recipient)
            .map_err(|_| ContractError::InvalidAddress)?;

        // Validate hashlock
        let hashlock_bytes = hex::decode(escrow_input.hashlock.trim_start_matches("0x"))
            .map_err(|_| ContractError::InvalidHashlock(escrow_input.hashlock.clone()))?;

        if hashlock_bytes.len() != 32 {
            return Err(ContractError::InvalidHashlock(escrow_input.hashlock.clone()));
        }

        // Validate timelock
        if escrow_input.timelock <= env.block.time.seconds() {
            return Err(ContractError::InvalidTimelock {
                current: env.block.time.seconds(),
                timelock: escrow_input.timelock,
            });
        }

        // Check if escrow already exists
        if ESCROWS.has(deps.storage, escrow_input.hashlock.clone()) {
            return Err(ContractError::EscrowAlreadyExists);
        }

        // Handle token transfer
        match escrow_input.token.as_str() {
            "uatom" => {
                let sent_amount = info.funds.iter()
                    .find(|coin| coin.denom == "uatom")
                    .map(|coin| coin.amount)
                    .unwrap_or_default();

                total_amount += escrow_input.amount;
            },
            _ => return Err(ContractError::UnsupportedToken(escrow_input.token)),
        }

        // Create escrow
        let escrow = Escrow {
            creator: info.sender.clone(),
            recipient: recipient_addr,
            hashlock: escrow_input.hashlock.clone(),
            timelock: escrow_input.timelock,
            token: escrow_input.token,
            amount: escrow_input.amount,
            status: STATUS_ACTIVE,
        };

        // Save escrow
        ESCROWS.save(deps.storage, escrow_input.hashlock.clone(), &escrow)?;

        // Update user escrows tracking
        update_user_escrows(deps.storage, &info.sender, &escrow_input.hashlock)?;

        created_escrows.push(escrow_input.hashlock);
    }

    // Verify total amount matches sent funds
    let sent_amount = info.funds.iter()
        .find(|coin| coin.denom == "uatom")
        .map(|coin| coin.amount)
        .unwrap_or_default();

    if sent_amount < total_amount {
        return Err(ContractError::InsufficientFunds {
            required: total_amount,
            sent: sent_amount,
        });
    }

    Ok(response
        .add_attribute("action", "create_batch_escrows")
        .add_attribute("creator", info.sender)
        .add_attribute("count", created_escrows.len().to_string())
        .add_attribute("total_amount", total_amount.to_string()))
}

fn execute_claim(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    hashlock: String,
    secret: String,
) -> Result<Response, ContractError> {
    let mut escrow = ESCROWS.load(deps.storage, hashlock.clone())
        .map_err(|_| ContractError::EscrowNotFound)?;

    // Check escrow status
    if escrow.status != STATUS_ACTIVE {
        return Err(ContractError::EscrowClosed);
    }

    // Verify secret matches hashlock
    let secret_bytes = secret.as_bytes();
    let secret_hash = hex::encode(Keccak256::digest(secret_bytes));

    if secret_hash != escrow.hashlock {
        return Err(ContractError::InvalidSecret);
    }

    // Check timelock hasn't expired
    if env.block.time.seconds() >= escrow.timelock {
        return Err(ContractError::TimelockExpired);
    }

    // Transfer funds
    let mut response = Response::new();
    match escrow.token.as_str() {
        "uatom" => {
            let transfer_msg = BankMsg::Send {
                to_address: escrow.recipient.to_string(),
                amount: vec![Coin {
                    denom: "uatom".to_string(),
                    amount: escrow.amount,
                }],
            };
            response = response.add_message(transfer_msg);
        },
        _ => return Err(ContractError::UnsupportedToken(escrow.token)),
    }

    // Update escrow status
    escrow.status = STATUS_CLAIMED;
    ESCROWS.save(deps.storage, hashlock.clone(), &escrow)?;

    Ok(response
        .add_attribute("action", "claim")
        .add_attribute("escrow", hashlock)
        .add_attribute("recipient", escrow.recipient)
        .add_attribute("amount", escrow.amount.to_string()))
}

fn execute_refund(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    hashlock: String,
) -> Result<Response, ContractError> {
    let mut escrow = ESCROWS.load(deps.storage, hashlock.clone())
        .map_err(|_| ContractError::EscrowNotFound)?;

    // Check escrow status
    if escrow.status != STATUS_ACTIVE {
        return Err(ContractError::EscrowClosed);
    }

    // Verify timelock has expired
    if env.block.time.seconds() < escrow.timelock {
        return Err(ContractError::TimelockNotExpired {
            expires: escrow.timelock,
            current: env.block.time.seconds(),
        });
    }

    // Verify caller is creator
    if info.sender != escrow.creator {
        return Err(ContractError::UnauthorizedRefund);
    }

    // Transfer funds back to creator
    let mut response = Response::new();
    match escrow.token.as_str() {
        "uatom" => {
            let transfer_msg = BankMsg::Send {
                to_address: escrow.creator.to_string(),
                amount: vec![Coin {
                    denom: "uatom".to_string(),
                    amount: escrow.amount,
                }],
            };
            response = response.add_message(transfer_msg);
        },
        _ => return Err(ContractError::UnsupportedToken(escrow.token)),
    }

    // Update escrow status
    escrow.status = STATUS_REFUNDED;
    ESCROWS.save(deps.storage, hashlock.clone(), &escrow)?;

    Ok(response
        .add_attribute("action", "refund")
        .add_attribute("escrow", hashlock)
        .add_attribute("creator", escrow.creator)
        .add_attribute("amount", escrow.amount.to_string()))
}

fn execute_update_config(
    deps: DepsMut,
    info: MessageInfo,
    claim_fee: Option<Uint128>,
    refund_fee: Option<Uint128>,
    max_batch_size: Option<u32>,
    paused: Option<bool>,
) -> Result<Response, ContractError> {
    // Only contract owner can update config
    // This would need to be implemented with proper access control
    
    let mut config = CONFIG.load(deps.storage)?;
    
    if let Some(fee) = claim_fee {
        config.claim_fee = fee;
    }
    if let Some(fee) = refund_fee {
        config.refund_fee = fee;
    }
    if let Some(size) = max_batch_size {
        config.max_batch_size = size;
    }
    if let Some(pause) = paused {
        config.paused = pause;
    }
    
    CONFIG.save(deps.storage, &config)?;
    
    Ok(Response::new()
        .add_attribute("action", "update_config")
        .add_attribute("claim_fee", config.claim_fee.to_string())
        .add_attribute("refund_fee", config.refund_fee.to_string())
        .add_attribute("max_batch_size", config.max_batch_size.to_string())
        .add_attribute("paused", config.paused.to_string()))
}

// Helper function to update user escrows tracking
fn update_user_escrows(
    storage: &mut cosmwasm_std::Storage,
    user: &Addr,
    hashlock: &str,
) -> StdResult<()> {
    let mut user_escrows = USER_ESCROWS.load(storage, user).unwrap_or(UserEscrows {
        escrow_ids: Vec::new(),
        count: 0,
    });
    
    user_escrows.escrow_ids.push(hashlock.to_string());
    user_escrows.count += 1;
    
    USER_ESCROWS.save(storage, user, &user_escrows)
}

#[cfg_attr(not(feature = "library"), cosmwasm_std::entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetEscrow { hashlock } => query_escrow(deps, hashlock),
        QueryMsg::GetBatchEscrows { hashlocks } => query_batch_escrows(deps, hashlocks),
        QueryMsg::GetUserEscrows { user } => query_user_escrows(deps, user),
        QueryMsg::GetConfig {} => query_config(deps),
    }
}

fn query_escrow(deps: Deps, hashlock: String) -> StdResult<Binary> {
    let escrow = ESCROWS.load(deps.storage, hashlock)?;
    let res = EscrowResponse {
        creator: escrow.creator.to_string(),
        recipient: escrow.recipient.to_string(),
        hashlock: escrow.hashlock,
        timelock: escrow.timelock,
        token: escrow.token,
        amount: escrow.amount,
        status: escrow.status,
    };
    to_binary(&res)
}

fn query_batch_escrows(deps: Deps, hashlocks: Vec<String>) -> StdResult<Binary> {
    let mut escrows = Vec::new();
    
    for hashlock in hashlocks {
        if let Ok(escrow) = ESCROWS.load(deps.storage, hashlock.clone()) {
            escrows.push(EscrowResponse {
                creator: escrow.creator.to_string(),
                recipient: escrow.recipient.to_string(),
                hashlock: escrow.hashlock,
                timelock: escrow.timelock,
                token: escrow.token,
                amount: escrow.amount,
                status: escrow.status,
            });
        }
    }
    
    let res = BatchEscrowResponse { escrows };
    to_binary(&res)
}

fn query_user_escrows(deps: Deps, user: String) -> StdResult<Binary> {
    let user_addr = deps.api.addr_validate(&user)?;
    let user_escrows = USER_ESCROWS.load(deps.storage, &user_addr).unwrap_or(UserEscrows {
        escrow_ids: Vec::new(),
        count: 0,
    });
    
    to_binary(&user_escrows)
}

fn query_config(deps: Deps) -> StdResult<Binary> {
    let config = CONFIG.load(deps.storage)?;
    to_binary(&config)
} 