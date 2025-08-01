// cargo test --test execute_claim -- --nocapture

use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
use cosmwasm_std::{coins, Addr, BankMsg, Coin, Response, Uint128, DepsMut};
use hex_literal::hex;
use sha3::{Keccak256, Digest};

use htlc::contract::execute_claim;
use htlc::ContractError;
use htlc::state::{Escrow, ESCROWS};

// Helper to create a test escrow
fn setup_test_escrow(deps: DepsMut, hashlock: String, recipient: Addr) {
    let escrow = Escrow {
        creator: Addr::unchecked("creator"),
        recipient,
        hashlock: hashlock.clone(),
        timelock: mock_env().block.time.seconds() + 3600,
        token: "uatom".to_string(),
        amount: Uint128::new(1000),
        is_claimed: false,
        is_refunded: false,
    };
    ESCROWS.save(deps.storage, hashlock, &escrow).unwrap();
}

// Helper to create a default escrow for testing
fn create_test_escrow() -> Escrow {
    Escrow {
        creator: Addr::unchecked("creator"),
        recipient: Addr::unchecked("recipient"),
        hashlock: "test_hashlock".to_string(),
        timelock: mock_env().block.time.seconds() + 3600,
        token: "uatom".to_string(),
        amount: Uint128::new(1000),
        is_claimed: false,
        is_refunded: false,
    }
}

#[test]
fn happy_path_claim() {
    let mut deps = mock_dependencies();
    let env = mock_env();

    // Test data
    let secret = b"32_byte_secret_1234567890123456";
    let hashlock = hex::encode(Keccak256::digest(secret));
    let recipient = Addr::unchecked("recipient");

    // Setup escrow
    setup_test_escrow(deps.as_mut(), hashlock.clone(), recipient.clone());

    // Execute claim
    let info = mock_info("anyone", &[]);
    let res = execute_claim(
        deps.as_mut(),
        env,
        info,
        hashlock.clone(),
        String::from_utf8(secret.to_vec()).unwrap(),
    ).unwrap();

    // Verify response
    assert_eq!(
        res,
        Response::new()
            .add_message(BankMsg::Send {
                to_address: recipient.to_string(),
                amount: vec![Coin {
                    denom: "uatom".to_string(),
                    amount: Uint128::new(1000),
                }],
            })
            .add_attribute("action", "claim")
            .add_attribute("escrow", &hashlock)
            .add_attribute("recipient", recipient)
            .add_attribute("amount", "1000")
    );

    // Verify state updated
    let escrow = ESCROWS.load(&deps.storage, hashlock).unwrap();
    assert!(escrow.is_claimed);
}

#[test]
fn rejects_invalid_secret() {
    let mut deps = mock_dependencies();
    let hashlock = hex::encode(Keccak256::digest(b"real_secret"));
    setup_test_escrow(deps.as_mut(), hashlock.clone(), Addr::unchecked("recipient"));

    let err = execute_claim(
        deps.as_mut(),
        mock_env(),
        mock_info("anyone", &[]),
        hashlock,
        "wrong_secret".to_string(),
    ).unwrap_err();

    assert_eq!(err, ContractError::InvalidSecret);
}

#[test]
fn rejects_already_claimed() {
    let mut deps = mock_dependencies();
    let hashlock = hex::encode(Keccak256::digest(b"secret"));
    let mut escrow = create_test_escrow();
    escrow.is_claimed = true;
    ESCROWS.save(deps.as_mut().storage, hashlock.clone(), &escrow).unwrap();

    let err = execute_claim(
        deps.as_mut(),
        mock_env(),
        mock_info("anyone", &[]),
        hashlock.clone(),
        "secret".to_string(),
    ).unwrap_err();

    assert_eq!(err, ContractError::EscrowClosed);
}

#[test]
fn rejects_refunded_escrow() {
    let mut deps = mock_dependencies();
    let hashlock = hex::encode(Keccak256::digest(b"secret"));
    let mut escrow = create_test_escrow();
    escrow.is_refunded = true;
    ESCROWS.save(deps.as_mut().storage, hashlock.clone(), &escrow).unwrap();

    let err = execute_claim(
        deps.as_mut(),
        mock_env(),
        mock_info("anyone", &[]),
        hashlock,
        "secret".to_string(),
    ).unwrap_err();

    assert_eq!(err, ContractError::EscrowClosed);
}
