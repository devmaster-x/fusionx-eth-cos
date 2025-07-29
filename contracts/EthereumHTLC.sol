// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title EthereumHTLC
 * @dev Hash Time Lock Contract for Ethereum side of cross-chain swaps
 * Allows locking ETH or ERC20 tokens with a hashlock and timelock
 */
contract EthereumHTLC is ReentrancyGuard {
    
    struct Escrow {
        address initiator;      // Address that created the escrow
        address recipient;      // Address that can claim by revealing secret
        address tokenContract;  // ERC20 token contract (address(0) for ETH)
        uint256 amount;         // Amount of tokens/ETH locked
        bytes32 hashlock;       // Hash of the secret (keccak256)
        uint256 timelock;       // Unix timestamp when refund becomes available
        bool claimed;           // Whether funds have been claimed
        bool refunded;          // Whether funds have been refunded
    }
    
    mapping(string => Escrow) public escrows;
    
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
    
    error SwapAlreadyExists();
    error SwapNotFound();
    error SwapAlreadyClaimed();
    error SwapAlreadyRefunded();
    error InvalidTimelock();
    error InvalidHashlock();
    error InvalidSecret();
    error TimelockNotExpired();
    error UnauthorizedClaim();
    error UnauthorizedRefund();
    error TransferFailed();
    error InvalidAmount();
    
    /**
     * @dev Create a new escrow for ETH
     */
    function createEscrowETH(
        string calldata swapId,
        address recipient,
        bytes32 hashlock,
        uint256 timelock
    ) external payable nonReentrant {
        if (msg.value == 0) revert InvalidAmount();
        
        _createEscrow(
            swapId,
            recipient,
            address(0),
            msg.value,
            hashlock,
            timelock
        );
    }
    
    /**
     * @dev Create a new escrow for ERC20 tokens
     */
    function createEscrowERC20(
        string calldata swapId,
        address recipient,
        address tokenContract,
        uint256 amount,
        bytes32 hashlock,
        uint256 timelock
    ) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        if (tokenContract == address(0)) revert InvalidAmount();
        
        // Transfer tokens from sender to this contract
        IERC20 token = IERC20(tokenContract);
        if (!token.transferFrom(msg.sender, address(this), amount)) {
            revert TransferFailed();
        }
        
        _createEscrow(
            swapId,
            recipient,
            tokenContract,
            amount,
            hashlock,
            timelock
        );
    }
    
    /**
     * @dev Internal function to create escrow
     */
    function _createEscrow(
        string calldata swapId,
        address recipient,
        address tokenContract,
        uint256 amount,
        bytes32 hashlock,
        uint256 timelock
    ) internal {
        // Validation
        if (escrows[swapId].initiator != address(0)) revert SwapAlreadyExists();
        if (timelock <= block.timestamp) revert InvalidTimelock();
        if (hashlock == bytes32(0)) revert InvalidHashlock();
        if (recipient == address(0)) revert InvalidAmount();
        
        // Create escrow
        escrows[swapId] = Escrow({
            initiator: msg.sender,
            recipient: recipient,
            tokenContract: tokenContract,
            amount: amount,
            hashlock: hashlock,
            timelock: timelock,
            claimed: false,
            refunded: false
        });
        
        emit EscrowCreated(
            swapId,
            msg.sender,
            recipient,
            tokenContract,
            amount,
            hashlock,
            timelock
        );
    }
    
    /**
     * @dev Claim funds by revealing the secret
     */
    function claim(string calldata swapId, bytes calldata secret) 
        external 
        nonReentrant 
    {
        Escrow storage escrow = escrows[swapId];
        
        // Validation
        if (escrow.initiator == address(0)) revert SwapNotFound();
        if (escrow.claimed) revert SwapAlreadyClaimed();
        if (escrow.refunded) revert SwapAlreadyRefunded();
        if (msg.sender != escrow.recipient) revert UnauthorizedClaim();
        if (block.timestamp >= escrow.timelock) revert TimelockNotExpired();
        
        // Verify secret matches hashlock
        if (keccak256(secret) != escrow.hashlock) revert InvalidSecret();
        
        // Mark as claimed
        escrow.claimed = true;
        
        // Transfer funds to recipient
        _transferFunds(escrow.tokenContract, escrow.recipient, escrow.amount);
        
        emit EscrowClaimed(swapId, escrow.recipient, keccak256(secret));
    }
    
    /**
     * @dev Refund funds after timelock expires
     */
    function refund(string calldata swapId) external nonReentrant {
        Escrow storage escrow = escrows[swapId];
        
        // Validation
        if (escrow.initiator == address(0)) revert SwapNotFound();
        if (escrow.claimed) revert SwapAlreadyClaimed();
        if (escrow.refunded) revert SwapAlreadyRefunded();
        if (msg.sender != escrow.initiator) revert UnauthorizedRefund();
        if (block.timestamp < escrow.timelock) revert TimelockNotExpired();
        
        // Mark as refunded
        escrow.refunded = true;
        
        // Transfer funds back to initiator
        _transferFunds(escrow.tokenContract, escrow.initiator, escrow.amount);
        
        emit EscrowRefunded(swapId, escrow.initiator);
    }
    
    /**
     * @dev Internal function to transfer funds
     */
    function _transferFunds(
        address tokenContract, 
        address to, 
        uint256 amount
    ) internal {
        if (tokenContract == address(0)) {
            // Transfer ETH
            (bool success, ) = to.call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            // Transfer ERC20
            IERC20 token = IERC20(tokenContract);
            if (!token.transfer(to, amount)) revert TransferFailed();
        }
    }
    
    /**
     * @dev Get escrow details
     */
    function getEscrow(string calldata swapId) 
        external 
        view 
        returns (Escrow memory) 
    {
        return escrows[swapId];
    }
    
    /**
     * @dev Check if escrow exists
     */
    function escrowExists(string calldata swapId) external view returns (bool) {
        return escrows[swapId].initiator != address(0);
    }
} 