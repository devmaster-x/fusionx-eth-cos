// cargo test --test execute_escrow -- --nocapture
// tests/execute_escrow.rs

use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info, MockApi};
use cosmwasm_std::{coins, Uint128};
use hex_literal::hex;
use sha3::{Keccak256, Digest};
use htlc::state::ESCROWS;
use htlc::contract::execute_create_escrow;
use htlc::ContractError;

// Helper to create valid test data
fn mock_valid_create_params(api: &MockApi) -> (String, String, u64, String, Uint128) {
    // Generate valid bech32 address
    let recipient = api.addr_make("recipient").to_string();

    // Valid 32-byte hex
    let secret = b"32_byte_secret_1234567890123456";
    let hashlock = hex::encode(Keccak256::digest(secret));

    // Future timestamp
    let timelock = mock_env().block.time.seconds() + 3600;

    let token = "uatom".to_string();
    let amount = Uint128::new(1000);

    (recipient, hashlock, timelock, token, amount)
}

#[test]
fn happy_path_creates_escrow() {
    let mut deps = mock_dependencies();
    let api = MockApi::default().with_prefix("wasm");
    deps.api = api.clone(); // Set the mock API in dependencies

    let (recipient, hashlock, timelock, token, amount) = mock_valid_create_params(&api);

    // No need to validate here since addr_make already creates valid addresses
    let info = mock_info("creator", &coins(amount.u128(), "uatom"));

    let res = execute_create_escrow(
        deps.as_mut(),
        mock_env(),
        info,
        recipient.clone(),
        hashlock.clone(),
        timelock,
        token,
        amount,
    ).expect("Should successfully create escrow");

    assert_eq!(res.attributes, vec![
        ("action", "create_escrow"),
        ("creator", "creator"),
        ("recipient", recipient.as_str()),
        ("amount", amount.to_string().as_str()),
    ]);

    let escrow = ESCROWS.load(&deps.storage, hashlock)
        .expect("Escrow should be saved");
    assert_eq!(escrow.amount, amount);
    assert!(!escrow.is_claimed);
}

#[test]
fn rejects_invalid_recipient() {
    let mut deps = mock_dependencies();
    let api = MockApi::default().with_prefix("wasm");
    let (_, hashlock, timelock, token, amount) = mock_valid_create_params(&api);

    let err = execute_create_escrow(
        deps.as_mut(),
        mock_env(),
        mock_info("creator", &[]),
        "invalid_address".to_string(),
        hashlock,
        timelock,
        token,
        amount,
    ).unwrap_err();

    assert_eq!(err, ContractError::InvalidAddress);
}


#[test]
fn rejects_invalid_hashlock() {
    let mut deps = mock_dependencies();
    let api = MockApi::default().with_prefix("wasm");
    deps.api = api.clone();
    let (recipient, _, timelock, token, amount) = mock_valid_create_params(&api);

    let err = execute_create_escrow(
        deps.as_mut(),
        mock_env(),
        mock_info("creator", &coins(amount.u128(), "uatom")),
        recipient,
        "not_hex_and_wrong_length".to_string(), // Invalid hex and length
        timelock,
        token,
        amount,
    ).unwrap_err();

    assert!(matches!(err, ContractError::InvalidHashlock(_)));
}

#[test]
fn rejects_past_timelock() {
    let mut deps = mock_dependencies();
    let api = MockApi::default().with_prefix("wasm");
    deps.api = api.clone();
    let env = mock_env();
    let (recipient, hashlock, _, token, amount) = mock_valid_create_params(&api);

    let past_timelock = env.block.time.seconds() - 1;
    let err = execute_create_escrow(
        deps.as_mut(),
        env,
        mock_info("creator", &coins(amount.u128(), "uatom")),
        recipient,
        hashlock,
        past_timelock,
        token,
        amount,
    ).unwrap_err();

    match err {
        ContractError::InvalidTimelock { .. } => (),
        _ => panic!("Expected InvalidTimelock error, got {:?}", err),
    }
}

#[test]
fn rejects_insufficient_funds() {
    let mut deps = mock_dependencies();
    let api = MockApi::default().with_prefix("wasm");
    deps.api = api.clone();
    let (recipient, hashlock, timelock, token, amount) = mock_valid_create_params(&api);

    let err = execute_create_escrow(
        deps.as_mut(),
        mock_env(),
        mock_info("creator", &coins(amount.u128() - 1, "uatom")), // Send 1 less than required
        recipient,
        hashlock,
        timelock,
        token,
        amount,
    ).unwrap_err();

    match err {
        ContractError::InsufficientFunds { .. } => (),
        _ => panic!("Expected InsufficientFunds error, got {:?}", err),
    }
}
