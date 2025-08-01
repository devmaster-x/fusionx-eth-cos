// cargo test --test execute_refund -- --nocapture

use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
use cosmwasm_std::{Addr, BankMsg, Coin, Response, Uint128, DepsMut};
use htlc::contract::execute_refund;
use htlc::ContractError;
use htlc::state::{Escrow, ESCROWS};

// Helper to create a basic escrow struct (doesn't save to storage)
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

// Helper to save an escrow to storage with custom hashlock and timelock
fn save_test_escrow(deps: DepsMut, hashlock: String, timelock: u64) {
    let escrow = Escrow {
        hashlock: hashlock.clone(),
        timelock,
        ..create_test_escrow()
    };
    ESCROWS.save(deps.storage, hashlock, &escrow).unwrap();
}

#[test]
fn happy_path_refund() {
    let mut deps = mock_dependencies();
    let env = mock_env();
    let hashlock = "test_hashlock".to_string();

    // Set escrow to expire 1 second ago
    let expired_timelock = env.block.time.seconds() - 1;
    save_test_escrow(deps.as_mut(), hashlock.clone(), expired_timelock);

    // Execute refund
    let info = mock_info("anyone", &[]);
    let res = execute_refund(
        deps.as_mut(),
        env,
        info,
        hashlock.clone(),
    ).unwrap();

    // Verify response
    assert_eq!(
        res,
        Response::new()
            .add_message(BankMsg::Send {
                to_address: "creator".to_string(),
                amount: vec![Coin {
                    denom: "uatom".to_string(),
                    amount: Uint128::new(1000),
                }],
            })
            .add_attribute("action", "refund")
            .add_attribute("escrow", &hashlock)
            .add_attribute("creator", "creator")
            .add_attribute("amount", "1000")
    );

    // Verify state updated
    let escrow = ESCROWS.load(&deps.storage, hashlock).unwrap();
    assert!(escrow.is_refunded);
}

#[test]
fn rejects_nonexistent_escrow() {
    let mut deps = mock_dependencies();
    let hashlock = "nonexistent_hash".to_string();

    let err = execute_refund(
        deps.as_mut(),
        mock_env(),
        mock_info("anyone", &[]),
        hashlock,
    ).unwrap_err();

    assert_eq!(err, ContractError::EscrowNotFound);
}

#[test]
fn rejects_already_claimed() {
    let mut deps = mock_dependencies();
    let hashlock = "test_hashlock".to_string();
    let mut escrow = create_test_escrow();
    escrow.is_claimed = true;
    ESCROWS.save(deps.as_mut().storage, hashlock.clone(), &escrow).unwrap();

    let err = execute_refund(
        deps.as_mut(),
        mock_env(),
        mock_info("anyone", &[]),
        hashlock,
    ).unwrap_err();

    assert_eq!(err, ContractError::EscrowClosed);
}

#[test]
fn rejects_already_refunded() {
    let mut deps = mock_dependencies();
    let hashlock = "test_hashlock".to_string();
    let mut escrow = create_test_escrow();
    escrow.is_refunded = true;
    ESCROWS.save(deps.as_mut().storage, hashlock.clone(), &escrow).unwrap();

    let err = execute_refund(
        deps.as_mut(),
        mock_env(),
        mock_info("anyone", &[]),
        hashlock,
    ).unwrap_err();

    assert_eq!(err, ContractError::EscrowClosed);
}

#[test]
fn rejects_premature_refund() {
    let mut deps = mock_dependencies();
    let env = mock_env();
    let hashlock = "test_hashlock".to_string();

    // Set escrow to expire in the future
    let future_timelock = env.block.time.seconds() + 3600;
    save_test_escrow(deps.as_mut(), hashlock.clone(), future_timelock);

    let err = execute_refund(
        deps.as_mut(),
        env,
        mock_info("anyone", &[]),
        hashlock,
    ).unwrap_err();

    match err {
        ContractError::TimelockNotExpired { .. } => (),
        _ => panic!("Expected TimelockNotExpired error"),
    }
}

#[test]
fn rejects_unsupported_token() {
    let mut deps = mock_dependencies();
    let env = mock_env();
    let hashlock = "test_hashlock".to_string();

    // Create escrow with unsupported token
    let mut escrow = create_test_escrow();
    escrow.token = "unsupported_token".to_string();
    escrow.timelock = env.block.time.seconds() - 1; // Expired
    ESCROWS.save(deps.as_mut().storage, hashlock.clone(), &escrow).unwrap();

    let err = execute_refund(
        deps.as_mut(),
        env,
        mock_info("anyone", &[]),
        hashlock,
    ).unwrap_err();

    assert_eq!(err, ContractError::UnsupportedToken("unsupported_token".to_string()));
}
