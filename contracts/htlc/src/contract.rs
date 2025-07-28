use cosmwasm_std::{DepsMut, Env, MessageInfo, Response, StdResult};
use crate::msg::InstantiateMsg;
use crate::msg::ExecuteMsg;
use crate::ContractError;
use crate::state::ADMIN;
use cosmwasm_std::Coin;
use cosmwasm_std::Binary;
use crate::state::{Escrow, ESCROWS};

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
    amount: Coin,
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

    // Extract the amount of native tokens sent
    let amount = info.funds.iter().find(|coin| coin.denom == "untrn") // replace "untrn" with your denom
        .map(|coin| coin.amount)
        .unwrap_or_default(); 

    // Enforce: reject zero amounts
    if amount.is_zero() {
        return Err(ContractError::NoFundsSent {});
    }

    let escrow = Escrow {
        initiator: info.sender.clone(),
        recipient: recipient_addr.clone(),
        hashlock: Binary::from(hash_bytes),
        timelock,
        amount,
        claimed: false,
    };

    // Save to storage
    ESCROWS.save(deps.storage, swap_id.clone(), &escrow)?;

    // Respond
    Ok(Response::new()
        .add_attribute("action", "create_escrow")
        .add_attribute("initiator", info.sender)
        .add_attribute("recipient", recipient)
        .add_attribute("timelock", timelock.to_string())
        .add_attribute("amount", amount.to_string())
        .add_attribute("swap_id", swap_id))
}