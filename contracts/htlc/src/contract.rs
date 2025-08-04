use cosmwasm_std::{BankMsg, Coin, CosmosMsg, StdError};
use sha3::{Digest, Keccak256};
use cosmwasm_std::to_binary;
use crate::msg::EscrowResponse;
use cosmwasm_std::Deps;
use hex;
use cosmwasm_std::{
    entry_point, DepsMut, Env, MessageInfo, Response,
    StdResult, Addr, Uint128, Binary
};
use crate::msg::{InstantiateMsg, ExecuteMsg, QueryMsg};
use crate::state::{Escrow, ESCROWS};
use crate::error::ContractError;

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    Ok(Response::default())
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::CreateEscrow {
            recipient,
            hashlock,
            timelock,
            token,
            amount
        } => execute_create_escrow(deps, env, info, recipient, hashlock, timelock, token, amount),
        ExecuteMsg::Claim { hashlock, secret } => execute_claim(deps, env, info, hashlock, secret),
        ExecuteMsg::Refund { hashlock } => execute_refund(deps, env, info, hashlock),
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
    // Debug print the recipient address
    println!("[CONTRACT] Validating recipient: {}", recipient);
    println!("[CONTRACT] Address length: {}", recipient.len());

    // Check recipient is a valid Bech32 address
    let recipient_addr = deps.api.addr_validate(&recipient)
        .map_err(|e| {
            println!("[CONTRACT] Address validation failed: {:?}", e);
            ContractError::InvalidAddress
        })?;

    println!("[CONTRACT] Address validated successfully");

    // Validate hashlock is 32-byte hex (keccak256 format)
    let hashlock_bytes = hex::decode(hashlock.trim_start_matches("0x"))
        .map_err(|_| ContractError::InvalidHashlock(hashlock.clone()))?;

    if hashlock_bytes.len() != 32 {
        return Err(ContractError::InvalidHashlock(hashlock));
    }

    // Validate timelock is in the future
    if timelock <= env.block.time.seconds() {
        return Err(ContractError::InvalidTimelock {
            current: env.block.time.seconds(),
            timelock,
        });
    }

    // --- 2. HANDLE TOKEN TRANSFER ---
    let mut response = Response::new();

    match token.as_str() {
        // Case: Native token (e.g., "uatom")
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

            // No action needed (tokens already sent to contract)
        },
        // Case: CW20 (we'll implement later)
        _ => return Err(ContractError::UnsupportedToken(token)),
    }

    // --- 3. SAVE ESCROW TO STATE ---
    let escrow = Escrow {
        creator: info.sender.clone(),
        recipient: recipient_addr,
        hashlock,
        timelock,
        token,
        amount,
        is_claimed: false,
        is_refunded: false,
    };

    let hashlock_clone = escrow.hashlock.clone();
    ESCROWS.save(deps.storage, hashlock_clone, &escrow)?;

    // creator: info.sender.clone(),
    // --- 4. BUILD RESPONSE ---
    Ok(response
        .add_attribute("action", "create_escrow")
        .add_attribute("creator", info.sender)
        .add_attribute("recipient", recipient)
        .add_attribute("amount", amount.to_string()))
}

fn execute_claim(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    hashlock: String,
    secret: String,
) -> Result<Response, ContractError> {
    // --- 1. LOAD ESCROW ---
    let mut escrow = ESCROWS.load(deps.storage, hashlock.clone())
        .map_err(|_| ContractError::EscrowNotFound)?;

    // --- 2. VALIDATE CLAIM ---

    // Check escrow is still active
    if escrow.is_claimed || escrow.is_refunded {
        return Err(ContractError::EscrowClosed);
    }

    // Verify secret matches hashlock (keccak256(secret) == hashlock)
    let secret_bytes = secret.as_bytes();
    let secret_hash = hex::encode(Keccak256::digest(secret_bytes));

    if secret_hash != escrow.hashlock {
        return Err(ContractError::InvalidSecret);
    }

    // --- 3. TRANSFER FUNDS ---
    let mut response = Response::new();

    match escrow.token.as_str() {
        // Case: Native token (e.g., "uatom")
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
        // Case: CW20 (stretch goal)
        _ => return Err(ContractError::UnsupportedToken(escrow.token)),
    }

    // --- 4. UPDATE ESCROW STATE ---
    escrow.is_claimed = true;
    ESCROWS.save(deps.storage, hashlock.clone(), &escrow)?;

    // --- 5. BUILD RESPONSE ---
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
    // --- 1. LOAD ESCROW ---
    let mut escrow = ESCROWS.load(deps.storage, hashlock.clone())
        .map_err(|_| ContractError::EscrowNotFound)?;

    // --- 2. VALIDATE REFUND CONDITIONS ---

    // Check escrow is still active
    if escrow.is_claimed || escrow.is_refunded {
        return Err(ContractError::EscrowClosed);
    }

    // Verify timelock has expired
    if env.block.time.seconds() < escrow.timelock {
        return Err(ContractError::TimelockNotExpired {
            expires: escrow.timelock,
            current: env.block.time.seconds(),
        });
    }

    // --- 3. TRANSFER FUNDS BACK TO CREATOR ---
    let mut response = Response::new();

    match escrow.token.as_str() {
        // Case: Native token (e.g., "uatom")
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
        // Case: CW20 (stretch goal)
        _ => return Err(ContractError::UnsupportedToken(escrow.token)),
    }

    // --- 4. UPDATE ESCROW STATE ---
    escrow.is_refunded = true;
    ESCROWS.save(deps.storage, hashlock.clone(), &escrow)?;

    // --- 5. BUILD RESPONSE ---
    Ok(response
        .add_attribute("action", "refund")
        .add_attribute("escrow", hashlock)
        .add_attribute("creator", escrow.creator)
        .add_attribute("amount", escrow.amount.to_string()))
}

#[entry_point]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetEscrow { hashlock } => query_escrow(deps, hashlock),
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
        is_claimed: escrow.is_claimed,
        is_refunded: escrow.is_refunded,
    };
    to_binary(&res)
}
