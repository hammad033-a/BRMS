// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductPayment {
    struct Payment {
        address buyer;
        uint256 amount;
        string productId;
        uint256 timestamp;
        bool exists;
    }
    
    mapping(string => Payment) public payments;
    mapping(address => string[]) public userPayments;
    
    event PaymentReceived(
        address indexed buyer,
        string productId,
        uint256 amount,
        uint256 timestamp
    );
    
    function payForProduct(string memory productId) external payable {
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(!payments[productId].exists, "Product already paid for");
        
        payments[productId] = Payment({
            buyer: msg.sender,
            amount: msg.value,
            productId: productId,
            timestamp: block.timestamp,
            exists: true
        });
        userPayments[msg.sender].push(productId);
        emit PaymentReceived(msg.sender, productId, msg.value, block.timestamp);
    }
    
    function hasPaid(address user, string memory productId) public view returns (bool) {
        return payments[productId].exists && payments[productId].buyer == user;
    }
    
    function getPayment(string memory productId) public view returns (address, uint256, string memory, uint256, bool) {
        Payment memory p = payments[productId];
        return (p.buyer, p.amount, p.productId, p.timestamp, p.exists);
    }
} 