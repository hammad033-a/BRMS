# Review Submission API Documentation

## Overview
This API provides endpoints for submitting and retrieving product reviews with blockchain-like features including IPFS hash generation and duplicate prevention.

## Endpoints

### 1. Submit Review
**POST** `/api/reviews/submit`

Submit a new review for a product.

#### Request Body
```json
{
  "rating": 5,
  "text": "Excellent product! Highly recommend.",
  "productId": "product123",
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
}
```

#### Parameters
- `rating` (number, 1-5): Product rating from 1 to 5 stars
- `text` (string): Review text/comment
- `productId` (string): Unique product identifier
- `walletAddress` (string): Ethereum wallet address (0x format)

#### Response (Success - 201)
```json
{
  "message": "Review submitted successfully",
  "reviewId": "1703123456789abc123",
  "ipfsHash": "Qm1234567890abcdef1234567890abcdef1234567890",
  "timestamp": "2023-12-21T10:30:45.123Z"
}
```

#### Response (Error - 400)
```json
{
  "message": "Missing required fields: rating, text, productId, walletAddress"
}
```

#### Response (Error - 409)
```json
{
  "message": "You have already submitted a review for this product"
}
```

### 2. Get Product Reviews
**GET** `/api/reviews/:productId`

Retrieve all reviews for a specific product.

#### Response
```json
{
  "productId": "product123",
  "reviews": [
    {
      "reviewId": "1703123456789abc123",
      "rating": 5,
      "text": "Excellent product! Highly recommend.",
      "productId": "product123",
      "walletAddress": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
      "timestamp": "2023-12-21T10:30:45.123Z",
      "ipfsHash": "Qm1234567890abcdef1234567890abcdef1234567890"
    }
  ],
  "totalReviews": 1,
  "averageRating": "5.0"
}
```

### 3. Get All Reviews
**GET** `/api/reviews`

Retrieve all reviews and metadata (admin endpoint).

#### Response
```json
{
  "reviews": [...],
  "metadata": [
    {
      "reviewId": "1703123456789abc123",
      "timestamp": "2023-12-21T10:30:45.123Z",
      "productId": "product123",
      "wallet": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
      "ipfsHash": "Qm1234567890abcdef1234567890abcdef1234567890",
      "clientIP": "127.0.0.1"
    }
  ],
  "totalReviews": 1
}
```

## Features

### ✅ Duplicate Prevention
- Prevents the same wallet address from submitting multiple reviews for the same product
- Case-insensitive wallet address comparison

### ✅ Data Validation
- Validates required fields (rating, text, productId, walletAddress)
- Ensures rating is between 1-5
- Validates Ethereum wallet address format (0x + 40 hex characters)

### ✅ Metadata Storage
- Stores review data in `data/reviews.json`
- Stores metadata in `data/metadata.json` including:
  - Review ID
  - Timestamp
  - Product ID
  - Wallet address
  - IPFS hash
  - Client IP address

### ✅ IPFS Hash Generation
- Generates IPFS-like hashes for each review
- Uses SHA-256 hash of review data
- Prefixed with "Qm" to simulate IPFS format

### ✅ Error Handling
- Comprehensive error messages
- Proper HTTP status codes
- Input validation with detailed feedback

## Testing

Run the test script to verify all functionality:

```bash
node test-review-api.js
```

This will test:
- Successful review submission
- Duplicate prevention
- Data validation
- Review retrieval
- Error handling

## Data Storage

The API uses local JSON files for data persistence:

- `data/reviews.json`: Stores review data
- `data/metadata.json`: Stores metadata for each review

Files are automatically created if they don't exist.

## Example Usage

### Using curl
```bash
# Submit a review
curl -X POST http://localhost:3000/api/reviews/submit \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "text": "Great product!",
    "productId": "product123",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  }'

# Get reviews for a product
curl http://localhost:3000/api/reviews/product123
```

### Using JavaScript
```javascript
const response = await fetch('http://localhost:3000/api/reviews/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    rating: 5,
    text: "Excellent product!",
    productId: "product123",
    walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  })
});

const result = await response.json();
console.log(result);
``` 