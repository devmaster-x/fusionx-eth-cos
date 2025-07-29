// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../EthereumHTLC.sol";

contract EthereumHTLCTest is Test {
    EthereumHTLC public htlc;
    
    address public alice = address(0x1);
    address public bob = address(0x2);
    
    string public swapId = "test-swap-1";
    bytes32 public hashlock;
    bytes public secret = "mysecret123";
    uint256 public timelock;
    uint256 public amount = 1 ether;
    
    event EscrowCreated(
        string indexed swapId,
        address indexed initiator,
        address indexed recipient,
        address tokenContract,
        uint256 amount,
        bytes32 hashlock,
        uint256 timelock
    );
    
    event EscrowClaimed(
        string indexed swapId,
        address indexed recipient,
        bytes32 secret
    );
    
    event EscrowRefunded(
        string indexed swapId,
        address indexed initiator
    );
    
    function setUp() public {
        htlc = new EthereumHTLC();
        hashlock = keccak256(secret);
        timelock = block.timestamp + 3600; // 1 hour from now
        
        // Fund alice with ETH
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }
    
    function test_CreateEscrowETH() public {
        vm.startPrank(alice);
        
        vm.expectEmit(true, true, true, true);
        emit EscrowCreated(
            swapId,
            alice,
            bob,
            address(0),
            amount,
            hashlock,
            timelock
        );
        
        htlc.createEscrowETH{value: amount}(
            swapId,
            bob,
            hashlock,
            timelock
        );
        
        EthereumHTLC.Escrow memory escrow = htlc.getEscrow(swapId);
        assertEq(escrow.initiator, alice);
        assertEq(escrow.recipient, bob);
        assertEq(escrow.amount, amount);
        assertEq(escrow.hashlock, hashlock);
        assertEq(escrow.timelock, timelock);
        assertEq(escrow.claimed, false);
        assertEq(escrow.refunded, false);
        
        vm.stopPrank();
    }
    
    function test_ClaimEscrow() public {
        // Create escrow first
        vm.prank(alice);
        htlc.createEscrowETH{value: amount}(
            swapId,
            bob,
            hashlock,
            timelock
        );
        
        uint256 bobBalanceBefore = bob.balance;
        
        // Bob claims with correct secret
        vm.startPrank(bob);
        
        vm.expectEmit(true, true, true, true);
        emit EscrowClaimed(swapId, bob, hashlock);
        
        htlc.claim(swapId, secret);
        
        uint256 bobBalanceAfter = bob.balance;
        assertEq(bobBalanceAfter - bobBalanceBefore, amount);
        
        EthereumHTLC.Escrow memory escrow = htlc.getEscrow(swapId);
        assertEq(escrow.claimed, true);
        
        vm.stopPrank();
    }
    
    function test_RefundEscrow() public {
        // Create escrow first
        vm.prank(alice);
        htlc.createEscrowETH{value: amount}(
            swapId,
            bob,
            hashlock,
            timelock
        );
        
        // Fast forward past timelock
        vm.warp(timelock + 1);
        
        uint256 aliceBalanceBefore = alice.balance;
        
        // Alice refunds after timelock expires
        vm.startPrank(alice);
        
        vm.expectEmit(true, true, true, true);
        emit EscrowRefunded(swapId, alice);
        
        htlc.refund(swapId);
        
        uint256 aliceBalanceAfter = alice.balance;
        assertEq(aliceBalanceAfter - aliceBalanceBefore, amount);
        
        EthereumHTLC.Escrow memory escrow = htlc.getEscrow(swapId);
        assertEq(escrow.refunded, true);
        
        vm.stopPrank();
    }
    
    function test_RevertInvalidSecret() public {
        // Create escrow first
        vm.prank(alice);
        htlc.createEscrowETH{value: amount}(
            swapId,
            bob,
            hashlock,
            timelock
        );
        
        // Bob tries to claim with wrong secret
        vm.startPrank(bob);
        
        vm.expectRevert(EthereumHTLC.InvalidSecret.selector);
        htlc.claim(swapId, "wrongsecret");
        
        vm.stopPrank();
    }
    
    function test_RevertUnauthorizedClaim() public {
        // Create escrow first
        vm.prank(alice);
        htlc.createEscrowETH{value: amount}(
            swapId,
            bob,
            hashlock,
            timelock
        );
        
        // Alice tries to claim (should be bob)
        vm.startPrank(alice);
        
        vm.expectRevert(EthereumHTLC.UnauthorizedClaim.selector);
        htlc.claim(swapId, secret);
        
        vm.stopPrank();
    }
    
    function test_RevertRefundBeforeTimelock() public {
        // Create escrow first
        vm.prank(alice);
        htlc.createEscrowETH{value: amount}(
            swapId,
            bob,
            hashlock,
            timelock
        );
        
        // Alice tries to refund before timelock expires
        vm.startPrank(alice);
        
        vm.expectRevert(EthereumHTLC.TimelockNotExpired.selector);
        htlc.refund(swapId);
        
        vm.stopPrank();
    }
    
    function test_RevertDuplicateSwapId() public {
        // Create first escrow
        vm.prank(alice);
        htlc.createEscrowETH{value: amount}(
            swapId,
            bob,
            hashlock,
            timelock
        );
        
        // Try to create another with same swapId
        vm.startPrank(alice);
        
        vm.expectRevert(EthereumHTLC.SwapAlreadyExists.selector);
        htlc.createEscrowETH{value: amount}(
            swapId,
            bob,
            hashlock,
            timelock
        );
        
        vm.stopPrank();
    }
} 