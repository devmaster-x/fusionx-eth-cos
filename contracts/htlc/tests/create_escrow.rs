// tests/contract_tests.rs

use cosmwasm_std::{coin, coins, Addr, Timestamp};
use cw_multi_test::{App, AppBuilder, Contract, ContractWrapper, Executor};

use crate::contract::{instantiate, execute};
use crate::msg::{InstantiateMsg, ExecuteMsg};
use crate::ContractError;

// Import your crate here (replace "your_crate" with actual name)
use your_crate::{contract, state}; // if lib.rs exports those modules

fn mock_app() -> App {
    AppBuilder::new().build(|_router, _api, _storage| {})
}

fn contract_htlc() -> Box<dyn Contract<Empty>> {
    let contract = ContractWrapper::new(execute, instantiate, |_deps, _env, _msg| {
        unimplemented!("query not needed for this test")
    });
    Box::new(contract)
}

#[test]
fn test_create_escrow_success() {
    let mut app = mock_app();

    let sender = Addr::unchecked("sender");
    let recipient = Addr::unchecked("recipient");

    // Instantiate the contract
    let code_id = app.store_code(contract_htlc());

    let instantiate_msg = InstantiateMsg {}; // adjust if your msg has fields

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

    let timelock = 1_700_000_000u64;

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
