// tests/create_escrow.rs

use cosmwasm_std::{coin, coins, Addr, Timestamp, Empty};
use cw_multi_test::{App, AppBuilder, Contract, ContractWrapper, Executor};

use htlc::contract::{instantiate, execute, query};
use htlc::msg::{InstantiateMsg, ExecuteMsg};
use htlc::ContractError;

fn mock_app() -> App {
    AppBuilder::new().build(|_router, _api, _storage| {})
}

fn contract_htlc() -> Box<dyn Contract<Empty>> {
    let contract = ContractWrapper::new(execute, instantiate, query);
    Box::new(contract)
}

#[test]
fn test_create_escrow_success() {
    let mut app = mock_app();

    let sender = Addr::unchecked("sender");
    let recipient = Addr::unchecked("recipient");

    // Instantiate the contract
    let code_id = app.store_code(contract_htlc());

    let instantiate_msg = InstantiateMsg { admin: None };

    let contract_addr = app
        .instantiate_contract(
            code_id,
            sender.clone(),
            &instantiate_msg,
            &[],
            "HTLC",
            None,
        )
        .unwrap();

    // Hash the secret
    let secret = b"mysecret";
    let hashlock = sha2::Sha256::digest(secret);
    let hashlock_hex = hex::encode(&hashlock);

    let timelock = 2_000_000_000u64; // Far future timestamp

    let execute_msg = ExecuteMsg::CreateEscrow {
        swap_id: "swap1".to_string(),
        recipient: recipient.to_string(),
        hashlock: hashlock_hex.clone(),
        timelock,
        amount: coin(1_000_000, "untrn"),
    };

    // Execute create escrow
    let res = app.execute_contract(
        sender.clone(),
        contract_addr.clone(),
        &execute_msg,
        &coins(1_000_000, "untrn"),
    );

    assert!(res.is_ok());
}

#[test]
fn test_redeem_escrow_success() {
    let mut app = mock_app();

    let sender = Addr::unchecked("sender");
    let recipient = Addr::unchecked("recipient");

    // Set initial balances
    app = app.init_modules(|router, _, storage| {
        router
            .bank
            .init_balance(storage, &sender, coins(2_000_000, "untrn"))
            .unwrap()
    });

    // Instantiate the contract
    let code_id = app.store_code(contract_htlc());
    let instantiate_msg = InstantiateMsg { admin: None };
    let contract_addr = app
        .instantiate_contract(code_id, sender.clone(), &instantiate_msg, &[], "HTLC", None)
        .unwrap();

    // Create escrow
    let secret = b"mysecret";
    let hashlock = sha2::Sha256::digest(secret);
    let hashlock_hex = hex::encode(&hashlock);
    let timelock = 2_000_000_000u64;

    let create_msg = ExecuteMsg::CreateEscrow {
        swap_id: "swap1".to_string(),
        recipient: recipient.to_string(),
        hashlock: hashlock_hex.clone(),
        timelock,
        amount: coin(1_000_000, "untrn"),
    };

    app.execute_contract(
        sender.clone(),
        contract_addr.clone(),
        &create_msg,
        &coins(1_000_000, "untrn"),
    ).unwrap();

    // Redeem escrow
    let redeem_msg = ExecuteMsg::Redeem {
        swap_id: "swap1".to_string(),
        secret: hex::encode(secret),
    };

    let res = app.execute_contract(
        recipient.clone(),
        contract_addr.clone(),
        &redeem_msg,
        &[],
    );

    assert!(res.is_ok());
}
