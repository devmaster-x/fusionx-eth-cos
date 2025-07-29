use cosmwasm_std::{DepsMut, Env, MessageInfo, Response, StdResult, Deps, Binary, BankMsg, to_json_binary};
use crate::msg::{InstantiateMsg, ExecuteMsg, QueryMsg, EscrowResponse};
use crate::ContractError;
use crate::state::{ADMIN, Escrow, ESCROWS};
use cosmwasm_std::Coin;
use sha2::{Digest, Sha256};

pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    let admin = msg.admin.unwrap_or(info.sender);
    ADMIN.save(deps.storage, &admin)?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("admin", admin))
}

pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::CreateEscrow {
            swap_id,
            hashlock,
            timelock,
            recipient,
            amount,
        } => execute_create_escrow(deps, env, info, swap_id, hashlock, timelock, recipient, amount),
        ExecuteMsg::Redeem { swap_id, secret } => execute_redeem(deps, env, info, swap_id, secret),
        ExecuteMsg::Refund { swap_id } => execute_refund(deps, env, info, swap_id),
    }
}

pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetEscrow { swap_id } => to_json_binary(&query_escrow(deps, swap_id)?),
        QueryMsg::GetEscrowsByInitiator { initiator } => {
            to_json_binary(&query_escrows_by_initiator(deps, initiator)?)
        }
        QueryMsg::GetEscrowsByRecipient { recipient } => {
            to_json_binary(&query_escrows_by_recipient(deps, recipient)?)
        }
    }
}

pub fn execute_create_escrow(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    swap_id: String,
    hashlock: String,
    timelock: u64,
    recipient: String,
    expected_amount: Coin,
) -> Result<Response, ContractError> {
    // 1. Check if timelock is in the future
    let now = env.block.time.seconds();
    if timelock <= now {
        return Err(ContractError::InvalidTimelock {});
    }

    // 2. Check if hashlock is a valid 32-byte hex string
    let hash_bytes = match hex::decode(&hashlock) {
        Ok(bytes) if bytes.len() == 32 => bytes,
        _ => return Err(ContractError::InvalidHashlock {}),
    };

    // Prevent duplicate swap_id
    if ESCROWS.has(deps.storage, swap_id.clone()) {
        return Err(ContractError::SwapAlreadyExists {});
    }

    let recipient_addr = deps.api.addr_validate(&recipient)?;

    // Find the sent amount that matches the expected denomination
    let sent_amount = info.funds.iter()
        .find(|coin| coin.denom == expected_amount.denom)
        .ok_or(ContractError::NoFundsSent {})?;

    // Validate sent amount matches expected amount
    if sent_amount.amount != expected_amount.amount {
        return Err(ContractError::InvalidFunds {});
    }

    let escrow = Escrow {
        initiator: info.sender.clone(),
        recipient: recipient_addr.clone(),
        hashlock: Binary::from(hash_bytes),
        timelock,
        amount: expected_amount.clone(),
        claimed: false,
        refunded: false,
    };

    // Save to storage
    ESCROWS.save(deps.storage, swap_id.clone(), &escrow)?;

    // Respond
    Ok(Response::new()
        .add_attribute("action", "create_escrow")
        .add_attribute("initiator", info.sender)
        .add_attribute("recipient", recipient)
        .add_attribute("timelock", timelock.to_string())
        .add_attribute("amount", expected_amount.to_string())
        .add_attribute("swap_id", swap_id))
}

pub fn execute_redeem(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    swap_id: String,
    secret: String,
) -> Result<Response, ContractError> {
    let mut escrow = ESCROWS.load(deps.storage, swap_id.clone())
        .map_err(|_| ContractError::SwapNotFound {})?;

    // Check if already claimed or refunded
    if escrow.claimed {
        return Err(ContractError::SwapAlreadyClaimed {});
    }
    if escrow.refunded {
        return Err(ContractError::SwapAlreadyRefunded {});
    }

    // Check if timelock has not expired yet (we can only redeem before expiry)
    let now = env.block.time.seconds();
    if now >= escrow.timelock {
        return Err(ContractError::TimelockExpired {});
    }

    // Only recipient can redeem
    if info.sender != escrow.recipient {
        return Err(ContractError::UnauthorizedRedeem {});
    }

    // Verify the secret matches the hashlock
    let secret_bytes = hex::decode(&secret).map_err(|_| ContractError::InvalidSecret {})?;
    let hash = Sha256::digest(&secret_bytes);
    if hash.as_slice() != escrow.hashlock.as_slice() {
        return Err(ContractError::InvalidSecret {});
    }

    // Mark as claimed
    escrow.claimed = true;
    ESCROWS.save(deps.storage, swap_id.clone(), &escrow)?;

    // Send funds to recipient
    let send_msg = BankMsg::Send {
        to_address: escrow.recipient.to_string(),
        amount: vec![escrow.amount.clone()],
    };

    Ok(Response::new()
        .add_message(send_msg)
        .add_attribute("action", "redeem")
        .add_attribute("swap_id", swap_id)
        .add_attribute("recipient", escrow.recipient)
        .add_attribute("amount", escrow.amount.to_string())
        .add_attribute("secret", secret))
}

pub fn execute_refund(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    swap_id: String,
) -> Result<Response, ContractError> {
    let mut escrow = ESCROWS.load(deps.storage, swap_id.clone())
        .map_err(|_| ContractError::SwapNotFound {})?;

    // Check if already claimed or refunded
    if escrow.claimed {
        return Err(ContractError::SwapAlreadyClaimed {});
    }
    if escrow.refunded {
        return Err(ContractError::SwapAlreadyRefunded {});
    }

    // Check if timelock has expired
    let now = env.block.time.seconds();
    if now < escrow.timelock {
        return Err(ContractError::TimelockNotExpired {});
    }

    // Only initiator can refund
    if info.sender != escrow.initiator {
        return Err(ContractError::UnauthorizedRefund {});
    }

    // Mark as refunded
    escrow.refunded = true;
    ESCROWS.save(deps.storage, swap_id.clone(), &escrow)?;

    // Send funds back to initiator
    let send_msg = BankMsg::Send {
        to_address: escrow.initiator.to_string(),
        amount: vec![escrow.amount.clone()],
    };

    Ok(Response::new()
        .add_message(send_msg)
        .add_attribute("action", "refund")
        .add_attribute("swap_id", swap_id)
        .add_attribute("initiator", escrow.initiator)
        .add_attribute("amount", escrow.amount.to_string()))
}

// Query functions
pub fn query_escrow(deps: Deps, swap_id: String) -> StdResult<EscrowResponse> {
    let escrow = ESCROWS.load(deps.storage, swap_id.clone())?;
    Ok(EscrowResponse {
        swap_id,
        initiator: escrow.initiator,
        recipient: escrow.recipient,
        hashlock: hex::encode(escrow.hashlock),
        timelock: escrow.timelock,
        amount: escrow.amount,
        claimed: escrow.claimed,
        refunded: escrow.refunded,
    })
}

pub fn query_escrows_by_initiator(deps: Deps, initiator: String) -> StdResult<Vec<EscrowResponse>> {
    let initiator_addr = deps.api.addr_validate(&initiator)?;
    let escrows: StdResult<Vec<_>> = ESCROWS
        .range(deps.storage, None, None, cosmwasm_std::Order::Ascending)
        .filter_map(|item| {
            match item {
                Ok((swap_id, escrow)) if escrow.initiator == initiator_addr => {
                    Some(Ok(EscrowResponse {
                        swap_id,
                        initiator: escrow.initiator,
                        recipient: escrow.recipient,
                        hashlock: hex::encode(escrow.hashlock),
                        timelock: escrow.timelock,
                        amount: escrow.amount,
                        claimed: escrow.claimed,
                        refunded: escrow.refunded,
                    }))
                }
                Ok(_) => None,
                Err(e) => Some(Err(e)),
            }
        })
        .collect();
    escrows
}

pub fn query_escrows_by_recipient(deps: Deps, recipient: String) -> StdResult<Vec<EscrowResponse>> {
    let recipient_addr = deps.api.addr_validate(&recipient)?;
    let escrows: StdResult<Vec<_>> = ESCROWS
        .range(deps.storage, None, None, cosmwasm_std::Order::Ascending)
        .filter_map(|item| {
            match item {
                Ok((swap_id, escrow)) if escrow.recipient == recipient_addr => {
                    Some(Ok(EscrowResponse {
                        swap_id,
                        initiator: escrow.initiator,
                        recipient: escrow.recipient,
                        hashlock: hex::encode(escrow.hashlock),
                        timelock: escrow.timelock,
                        amount: escrow.amount,
                        claimed: escrow.claimed,
                        refunded: escrow.refunded,
                    }))
                }
                Ok(_) => None,
                Err(e) => Some(Err(e)),
            }
        })
        .collect();
    escrows
}