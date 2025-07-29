// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./EthereumHTLC.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FusionOrderSettler
 * @dev Integration contract for 1inch Fusion+ orders that creates HTLCs
 * Handles cross-chain swap initiation and settlement
 */
contract FusionOrderSettler is ReentrancyGuard, Ownable {
    
    struct FusionOrder {
        address maker;          // Order creator
        address takerAsset;     // Asset to receive
        address makerAsset;     // Asset to give
        uint256 takingAmount;   // Amount to receive
        uint256 makingAmount;   // Amount to give
        uint256 expiration;     // Order expiration timestamp
        bytes32 orderHash;      // Hash of the order
        bool executed;          // Whether order has been executed
    }
    
    struct CrossChainSwap {
        string swapId;          // Unique swap identifier
        address initiator;      // Swap initiator
        string cosmosRecipient; // Cosmos chain recipient address
        bytes32 hashlock;       // Hash of the secret
        uint256 timelock;       // Expiration timestamp
        uint256 amount;         // Amount in the swap
        address tokenContract;  // Token contract (address(0) for ETH)
        bool active;            // Whether swap is active
    }
    
    EthereumHTLC public immutable htlcContract;
    
    mapping(bytes32 => FusionOrder) public fusionOrders;
    mapping(string => CrossChainSwap) public crossChainSwaps;
    mapping(address => bool) public authorizedResolvers;
    
    uint256 public constant MIN_TIMELOCK_DURATION = 3600; // 1 hour
    uint256 public constant MAX_TIMELOCK_DURATION = 86400 * 7; // 7 days
    
    event FusionOrderCreated(
        bytes32 indexed orderHash,
        address indexed maker,
        address takerAsset,
        address makerAsset,
        uint256 takingAmount,
        uint256 makingAmount,
        uint256 expiration
    );
    
    event CrossChainSwapInitiated(
        string indexed swapId,
        address indexed initiator,
        string cosmosRecipient,
        bytes32 hashlock,
        uint256 timelock,
        uint256 amount,
        address tokenContract
    );
    
    event OrderSettled(
        bytes32 indexed orderHash,
        string swapId,
        address settler
    );
    
    event ResolverAuthorized(address indexed resolver, bool authorized);
    
    error OrderNotFound();
    error OrderExpired();
    error OrderAlreadyExecuted();
    error InvalidTimelock();
    error InvalidHashlock();
    error InvalidAmount();
    error UnauthorizedResolver();
    error SwapNotFound();
    error SwapNotActive();
    error TransferFailed();
    
    constructor(address _htlcContract) {
        htlcContract = EthereumHTLC(_htlcContract);
    }
    
    /**
     * @dev Set authorized resolver status
     */
    function setAuthorizedResolver(address resolver, bool authorized) 
        external 
        onlyOwner 
    {
        authorizedResolvers[resolver] = authorized;
        emit ResolverAuthorized(resolver, authorized);
    }
    
    /**
     * @dev Create a Fusion order
     */
    function createFusionOrder(
        address takerAsset,
        address makerAsset,
        uint256 takingAmount,
        uint256 makingAmount,
        uint256 expiration
    ) external returns (bytes32 orderHash) {
        if (expiration <= block.timestamp) revert InvalidTimelock();
        if (takingAmount == 0 || makingAmount == 0) revert InvalidAmount();
        
        orderHash = keccak256(abi.encodePacked(
            msg.sender,
            takerAsset,
            makerAsset,
            takingAmount,
            makingAmount,
            expiration,
            block.timestamp
        ));
        
        fusionOrders[orderHash] = FusionOrder({
            maker: msg.sender,
            takerAsset: takerAsset,
            makerAsset: makerAsset,
            takingAmount: takingAmount,
            makingAmount: makingAmount,
            expiration: expiration,
            orderHash: orderHash,
            executed: false
        });
        
        emit FusionOrderCreated(
            orderHash,
            msg.sender,
            takerAsset,
            makerAsset,
            takingAmount,
            makingAmount,
            expiration
        );
        
        return orderHash;
    }
    
    /**
     * @dev Initiate cross-chain swap with HTLC creation
     */
    function initiateCrossChainSwap(
        string calldata swapId,
        string calldata cosmosRecipient,
        bytes32 hashlock,
        uint256 timelock,
        address tokenContract,
        uint256 amount
    ) external payable nonReentrant {
        if (hashlock == bytes32(0)) revert InvalidHashlock();
        if (timelock <= block.timestamp + MIN_TIMELOCK_DURATION) revert InvalidTimelock();
        if (timelock > block.timestamp + MAX_TIMELOCK_DURATION) revert InvalidTimelock();
        if (amount == 0) revert InvalidAmount();
        
        // Check if swap already exists
        if (crossChainSwaps[swapId].active) revert SwapNotFound();
        
        if (tokenContract == address(0)) {
            // ETH swap
            if (msg.value != amount) revert InvalidAmount();
            
            // Create HTLC for ETH
            htlcContract.createEscrowETH{value: amount}(
                swapId,
                address(this), // This contract will manage the HTLC
                hashlock,
                timelock
            );
        } else {
            // ERC20 swap
            if (msg.value != 0) revert InvalidAmount();
            
            // Transfer tokens from sender to this contract
            IERC20 token = IERC20(tokenContract);
            if (!token.transferFrom(msg.sender, address(this), amount)) {
                revert TransferFailed();
            }
            
            // Approve HTLC contract to spend tokens
            if (!token.approve(address(htlcContract), amount)) {
                revert TransferFailed();
            }
            
            // Create HTLC for ERC20
            htlcContract.createEscrowERC20(
                swapId,
                address(this), // This contract will manage the HTLC
                tokenContract,
                amount,
                hashlock,
                timelock
            );
        }
        
        // Store cross-chain swap info
        crossChainSwaps[swapId] = CrossChainSwap({
            swapId: swapId,
            initiator: msg.sender,
            cosmosRecipient: cosmosRecipient,
            hashlock: hashlock,
            timelock: timelock,
            amount: amount,
            tokenContract: tokenContract,
            active: true
        });
        
        emit CrossChainSwapInitiated(
            swapId,
            msg.sender,
            cosmosRecipient,
            hashlock,
            timelock,
            amount,
            tokenContract
        );
    }
    
    /**
     * @dev Settle a Fusion order by creating cross-chain swap
     */
    function settleFusionOrder(
        bytes32 orderHash,
        string calldata swapId,
        string calldata cosmosRecipient,
        bytes32 hashlock,
        uint256 timelock
    ) external nonReentrant {
        if (!authorizedResolvers[msg.sender]) revert UnauthorizedResolver();
        
        FusionOrder storage order = fusionOrders[orderHash];
        if (order.maker == address(0)) revert OrderNotFound();
        if (order.executed) revert OrderAlreadyExecuted();
        if (block.timestamp > order.expiration) revert OrderExpired();
        
        // Mark order as executed
        order.executed = true;
        
        // Transfer maker asset to this contract for HTLC creation
        if (order.makerAsset == address(0)) {
            // ETH transfer should be handled separately
            revert InvalidAmount();
        } else {
            IERC20 token = IERC20(order.makerAsset);
            if (!token.transferFrom(order.maker, address(this), order.makingAmount)) {
                revert TransferFailed();
            }
            
            // Approve HTLC contract
            if (!token.approve(address(htlcContract), order.makingAmount)) {
                revert TransferFailed();
            }
            
            // Create HTLC
            htlcContract.createEscrowERC20(
                swapId,
                address(this),
                order.makerAsset,
                order.makingAmount,
                hashlock,
                timelock
            );
        }
        
        // Store cross-chain swap info
        crossChainSwaps[swapId] = CrossChainSwap({
            swapId: swapId,
            initiator: order.maker,
            cosmosRecipient: cosmosRecipient,
            hashlock: hashlock,
            timelock: timelock,
            amount: order.makingAmount,
            tokenContract: order.makerAsset,
            active: true
        });
        
        emit OrderSettled(orderHash, swapId, msg.sender);
        emit CrossChainSwapInitiated(
            swapId,
            order.maker,
            cosmosRecipient,
            hashlock,
            timelock,
            order.makingAmount,
            order.makerAsset
        );
    }
    
    /**
     * @dev Complete cross-chain swap by claiming HTLC
     */
    function completeCrossChainSwap(
        string calldata swapId,
        bytes calldata secret
    ) external nonReentrant {
        CrossChainSwap storage swap = crossChainSwaps[swapId];
        if (!swap.active) revert SwapNotActive();
        
        // Verify caller is the initiator or authorized resolver
        if (msg.sender != swap.initiator && !authorizedResolvers[msg.sender]) {
            revert UnauthorizedResolver();
        }
        
        // Claim from HTLC
        htlcContract.claim(swapId, secret);
        
        // Mark swap as inactive
        swap.active = false;
    }
    
    /**
     * @dev Refund cross-chain swap after timelock expiry
     */
    function refundCrossChainSwap(string calldata swapId) external nonReentrant {
        CrossChainSwap storage swap = crossChainSwaps[swapId];
        if (!swap.active) revert SwapNotActive();
        if (msg.sender != swap.initiator) revert UnauthorizedResolver();
        
        // Refund from HTLC
        htlcContract.refund(swapId);
        
        // Mark swap as inactive
        swap.active = false;
    }
    
    /**
     * @dev Get fusion order details
     */
    function getFusionOrder(bytes32 orderHash) 
        external 
        view 
        returns (FusionOrder memory) 
    {
        return fusionOrders[orderHash];
    }
    
    /**
     * @dev Get cross-chain swap details
     */
    function getCrossChainSwap(string calldata swapId) 
        external 
        view 
        returns (CrossChainSwap memory) 
    {
        return crossChainSwaps[swapId];
    }
    
    /**
     * @dev Emergency function to receive ETH
     */
    receive() external payable {}
} 