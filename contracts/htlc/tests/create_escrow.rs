use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
use cosmwasm_std::{coins, Addr, Uint128};
use hex_literal::hex;
use htlc::state::ESCROWS;
use sha3::Keccak256;
use sha3::Digest;
use bech32::{self, ToBase32, Variant};
use rand::Rng;
use cosmwasm_std::testing::MockApi;

use htlc::contract::execute_create_escrow;
use htlc::ContractError;
use htlc::msg::ExecuteMsg;

/// Helper to create valid test data matching YOUR function requirements
fn mock_valid_create_params() -> (String, String, u64, String, Uint128) {
    // Must use valid bech32 address that passes deps.api.addr_validate()
    let recipient = "wasm1huydeevpz37sd9snkgul6070mstupukw00xkw9".to_string();

    // Must be valid 32-byte hex that passes your hashlock validation
    let secret = b"32_byte_secret_1234567890123456";
    let hashlock = hex::encode(Keccak256::digest(secret));

    // Must be future timestamp
    let timelock = mock_env().block.time.seconds() + 3600;

    // Must be "uatom" to pass your token check
    let token = "uatom".to_string();
    let amount = Uint128::new(1000);

    (recipient, hashlock, timelock, token, amount)
}

fn mock_valid_addr(prefix: &str) -> String {
    // Generate random 20 bytes (standard address length)
    let mut rng = rand::thread_rng();
    let mut data = [0u8; 20];
    rng.fill(&mut data);

    // Proper Bech32 encoding with checksum
    bech32::encode(prefix, data.to_base32(), Variant::Bech32).unwrap()
}

#[test]
fn happy_path_creates_escrow() {
    let mut deps = mock_dependencies();
    // CRITICAL: Configure mock API with proper settings
    deps.api = MockApi::default()
        .with_prefix("wasm");
        // .with_checksum(true);
    let env = mock_env();
    let (recipient, hashlock, timelock, token, amount) = mock_valid_create_params();

    println!("VALIDATION - Recipient address: {}", recipient);
    println!("VALIDATION - Address length: {}", recipient.len());

    // Must send exact amount of uatom
    let info = mock_info("creator", &coins(amount.u128(), "uatom"));

    let res = execute_create_escrow(
        deps.as_mut(),
        env,
        info,
        recipient.clone(),
        hashlock.clone(),
        timelock,
        token,
        amount,
    ).unwrap();

    // Verify response matches YOUR function's exact output
    assert_eq!(res.attributes, vec![
        ("action", "create_escrow"),
        ("creator", "creator"),
        ("recipient", recipient.as_str()),
        ("amount", amount.to_string().as_str()),
    ]);

    // Verify state matches YOUR escrow structure
    let escrow = ESCROWS.load(&deps.storage, hashlock).unwrap();
    assert_eq!(escrow.amount, amount);
    assert!(!escrow.is_claimed);
}

#[test]
fn rejects_invalid_recipient() {
    let mut deps = mock_dependencies();
    let (_, hashlock, timelock, token, amount) = mock_valid_create_params();

    let err = execute_create_escrow(
        deps.as_mut(),
        mock_env(),
        mock_info("creator", &[]),
        "invalid_address".to_string(), // Will fail addr_validate
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
    let (recipient, _, timelock, token, amount) = mock_valid_create_params();

    let err = execute_create_escrow(
        deps.as_mut(),
        mock_env(),
        mock_info("creator", &coins(amount.u128(), "uatom")),
        recipient,
        "not_32_byte_hex".to_string(), // Will fail hex decode or length check
        timelock,
        token,
        amount,
    ).unwrap_err();

    assert!(matches!(err, ContractError::InvalidHashlock(_)));
}

#[test]
fn rejects_past_timelock() {
    let mut deps = mock_dependencies();
    let env = mock_env();
    let (recipient, hashlock, _, token, amount) = mock_valid_create_params();

    let past_timelock = env.block.time.seconds() - 1;
    println!("Current time: {}, Past timelock: {}", env.block.time.seconds(), past_timelock);

    let result = execute_create_escrow(
        deps.as_mut(),
        env.clone(),
        mock_info("creator", &coins(amount.u128(), "uatom")),
        recipient,
        hashlock,
        past_timelock,
        token,
        amount,
    );

    println!("Result: {:?}", result); // Add this line

    let err = result.unwrap_err();
    println!("Error: {:?}", err); // Add this line

    assert!(matches!(
        err,
        ContractError::InvalidTimelock {
            current: _,
            timelock: _
        }
    ));
}

#[test]
fn rejects_insufficient_funds() {
    let mut deps = mock_dependencies();
    let (recipient, hashlock, timelock, token, amount) = mock_valid_create_params();

    let err = execute_create_escrow(
        deps.as_mut(),
        mock_env(),
        mock_info("creator", &coins(amount.u128() - 1, "uatom")), // 1 less than required
        recipient,
        hashlock,
        timelock,
        token,
        amount,
    ).unwrap_err();

    assert!(matches!(err, ContractError::InsufficientFunds { .. }));
}
