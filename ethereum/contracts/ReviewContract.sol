pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

contract ReviewContract {
    address public owner;

    enum ReviewStatus { Active, Flagged, Resolved }

    // Struct to represent a review
    struct Review {
        uint256 id;
        address reviewer;
        address store;
        uint256 productId;
        uint256 rating;
        string comment;
        uint256 timestamp;
        bool verified;
        string vendorResponse;
        uint256 responseTimestamp;
        ReviewStatus status;
        address flagger;
    }
    
    // Central array for all reviews
    Review[] public allReviews;

    // Mapping from store address to array of review indices
    mapping(address => uint256[]) public storeReviewIndices;
    
    // Mapping from product ID to array of review indices
    mapping(uint256 => uint256[]) public productReviewIndices;
    
    // Mapping from store address to average rating
    mapping(address => uint256) public storeAverageRatings;
    
    // Mapping from product ID to average rating
    mapping(uint256 => uint256) public productAverageRatings;
    
    // Mapping from store address to number of reviews
    mapping(address => uint256) public storeReviewCounts;
    
    // Mapping from product ID to number of reviews
    mapping(uint256 => uint256) public productReviewCounts;
    
    // Events
    event ReviewSubmitted(address indexed reviewer, address indexed store, uint256 productId, uint256 rating, string comment);
    event ReviewVerified(uint256 indexed reviewId, address indexed store, uint256 productId);
    event VendorResponded(uint256 indexed reviewId, address indexed store, uint256 productId);
    event ReviewFlagged(uint256 indexed reviewId, address indexed flagger);
    event FlagResolved(uint256 indexed reviewId, address indexed resolver, ReviewStatus newStatus);
    
    constructor() {
        owner = msg.sender;
    }
    
    // Submit a review for a product
    function submitReview(address store, uint256 productId, uint256 rating, string memory comment) public {
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        require(bytes(comment).length > 0, "Comment cannot be empty");
        
        uint256 reviewId = allReviews.length;

        // Create a new review
        allReviews.push(Review({
            id: reviewId,
            reviewer: msg.sender,
            store: store,
            productId: productId,
            rating: rating,
            comment: comment,
            timestamp: block.timestamp,
            verified: false,
            vendorResponse: "",
            responseTimestamp: 0,
            status: ReviewStatus.Active,
            flagger: address(0)
        }));
        
        // Add the review index to the store's reviews
        storeReviewIndices[store].push(reviewId);
        
        // Add the review index to the product's reviews
        productReviewIndices[productId].push(reviewId);
        
        // Update the store's average rating
        uint256 storeCount = storeReviewCounts[store];
        uint256 storeTotal = storeAverageRatings[store] * storeCount;
        storeReviewCounts[store] = storeCount + 1;
        storeAverageRatings[store] = (storeTotal + rating) / (storeCount + 1);
        
        // Update the product's average rating
        uint256 productCount = productReviewCounts[productId];
        uint256 productTotal = productAverageRatings[productId] * productCount;
        productReviewCounts[productId] = productCount + 1;
        productAverageRatings[productId] = (productTotal + rating) / (productCount + 1);
        
        // Emit the event
        emit ReviewSubmitted(msg.sender, store, productId, rating, comment);
    }
    
    // Get all reviews for a store
    function getStoreReviews(address store) public view returns (Review[] memory) {
        uint256[] memory indices = storeReviewIndices[store];
        Review[] memory reviews = new Review[](indices.length);

        for(uint i = 0; i < indices.length; i++) {
            reviews[i] = allReviews[indices[i]];
        }

        return reviews;
    }
    
    // Get all reviews for a product
    function getProductReviews(uint256 productId) public view returns (Review[] memory) {
        uint256[] memory indices = productReviewIndices[productId];
        Review[] memory reviews = new Review[](indices.length);

        for(uint i = 0; i < indices.length; i++) {
            reviews[i] = allReviews[indices[i]];
        }

        return reviews;
    }
    
    // Get the average rating for a store
    function getStoreAverageRating(address store) public view returns (uint256) {
        return storeAverageRatings[store];
    }
    
    // Get the average rating for a product
    function getProductAverageRating(uint256 productId) public view returns (uint256) {
        return productAverageRatings[productId];
    }
    
    // Get the number of reviews for a store
    function getStoreReviewCount(address store) public view returns (uint256) {
        return storeReviewCounts[store];
    }
    
    // Get the number of reviews for a product
    function getProductReviewCount(uint256 productId) public view returns (uint256) {
        return productReviewCounts[productId];
    }
    
    // Verify a review (only the store owner can verify reviews)
    function verifyReview(uint256 reviewId) public {
        require(reviewId < allReviews.length, "Review ID out of bounds");
        Review storage reviewToVerify = allReviews[reviewId];
        require(msg.sender == reviewToVerify.store, "Only the store owner can verify reviews");
        
        // Verify the review
        reviewToVerify.verified = true;
        
        // Emit the event
        emit ReviewVerified(reviewId, reviewToVerify.store, reviewToVerify.productId);
    }

    // Add a response to a review
    function addVendorResponse(uint256 reviewId, string memory response) public {
        require(reviewId < allReviews.length, "Review ID out of bounds");
        Review storage reviewToRespond = allReviews[reviewId];
        require(msg.sender == reviewToRespond.store, "Only the store owner can respond to reviews");
        require(bytes(reviewToRespond.vendorResponse).length == 0, "Response already submitted");

        reviewToRespond.vendorResponse = response;
        reviewToRespond.responseTimestamp = block.timestamp;

        emit VendorResponded(reviewId, reviewToRespond.store, reviewToRespond.productId);
    }

    // Flag a review for admin attention
    function flagReview(uint256 reviewId) public {
        require(reviewId < allReviews.length, "Review does not exist");
        Review storage reviewToFlag = allReviews[reviewId];
        
        require(reviewToFlag.reviewer != msg.sender, "You cannot flag your own review");
        require(reviewToFlag.status == ReviewStatus.Active, "Review is not active and cannot be flagged");

        reviewToFlag.status = ReviewStatus.Flagged;
        reviewToFlag.flagger = msg.sender;

        emit ReviewFlagged(reviewId, msg.sender);
    }

    // Resolve a flagged review (only owner)
    function resolveFlaggedReview(uint256 reviewId, ReviewStatus newStatus) public {
        require(msg.sender == owner, "Only the contract owner can resolve flags");
        require(reviewId < allReviews.length, "Review ID out of bounds");
        require(newStatus == ReviewStatus.Active || newStatus == ReviewStatus.Resolved, "Invalid resolution status");
        
        Review storage reviewToResolve = allReviews[reviewId];
        require(reviewToResolve.status == ReviewStatus.Flagged, "Review is not flagged");

        reviewToResolve.status = newStatus;
        
        emit FlagResolved(reviewId, msg.sender, newStatus);
    }
} 