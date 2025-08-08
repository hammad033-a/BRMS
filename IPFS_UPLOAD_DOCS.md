# IPFS Upload Functionality Documentation

## Overview

This project includes a comprehensive IPFS upload system that supports both **Pinata** and **Web3.Storage** services. The system automatically uploads review data to IPFS when reviews are submitted, with fallback support and error handling.

## Features

### ✅ **Dual Service Support**
- **Pinata**: Professional IPFS pinning service
- **Web3.Storage**: Free IPFS storage service
- **Fallback Logic**: If one service fails, automatically tries the other

### ✅ **Error Handling**
- Comprehensive error handling for network issues
- Timeout protection (30 seconds)
- Graceful degradation when IPFS is unavailable

### ✅ **Verification & Gateway Support**
- IPFS hash verification
- Multiple gateway URL generation
- Content retrieval testing

### ✅ **Integration Ready**
- Seamlessly integrated with review submission API
- Event emission on successful uploads
- Enhanced metadata tracking

## Setup Instructions

### 1. **Get API Keys**

#### **Pinata Setup:**
1. Go to [Pinata Cloud](https://app.pinata.cloud/)
2. Create an account and verify your email
3. Go to API Keys section
4. Create a new API key
5. Copy your **API Key** and **Secret Key**

#### **Web3.Storage Setup:**
1. Go to [Web3.Storage](https://web3.storage/)
2. Sign in with your wallet or email
3. Go to API Tokens
4. Create a new API token
5. Copy your **API Key**

### 2. **Set Environment Variables**

```bash
# Pinata Configuration
export PINATA_API_KEY="your-pinata-api-key"
export PINATA_SECRET_KEY="your-pinata-secret-key"

# Web3.Storage Configuration
export WEB3STORAGE_API_KEY="your-web3storage-api-key"
```

### 3. **Test Configuration**

```bash
# Check if services are configured
curl http://localhost:3001/health

# Expected response:
{
  "status": "OK",
  "message": "Enhanced Review API server is running",
  "ipfs": {
    "configured": true,
    "services": {
      "pinata": true,
      "web3storage": true
    }
  }
}
```

## API Usage

### **Submit Review with IPFS Upload**

```bash
curl -X POST http://localhost:3001/api/reviews/submit \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "text": "Amazing product!",
    "productId": "product123",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  }'
```

**Response with IPFS Upload:**
```json
{
  "message": "Review submitted successfully",
  "reviewId": "1751704430607puhlkw8oy",
  "reviewHash": "2ac77a285fc1e29b9afefe7fe73d0f03b8f022d9d91567d4c632f9ce880aa5ce",
  "ipfsHash": "Qmdceff68240f8f64f2a5e4ad2e81667eb9a30d0eaec2e",
  "timestamp": "2025-07-05T08:33:50.607Z",
  "eventEmitted": true,
  "ipfsUpload": {
    "success": true,
    "hash": "QmActualIPFSHash1234567890abcdef",
    "service": "pinata",
    "gateways": {
      "ipfsIo": "https://ipfs.io/ipfs/QmActualIPFSHash1234567890abcdef",
      "cloudflare": "https://cloudflare-ipfs.com/ipfs/QmActualIPFSHash1234567890abcdef",
      "dweb": "https://dweb.link/ipfs/QmActualIPFSHash1234567890abcdef",
      "gateway": "https://gateway.pinata.cloud/ipfs/QmActualIPFSHash1234567890abcdef",
      "web3Storage": "https://QmActualIPFSHash1234567890abcdef.ipfs.w3s.link/"
    }
  }
}
```

### **Verify IPFS Hash**

```bash
curl http://localhost:3001/api/ipfs/verify/QmActualIPFSHash1234567890abcdef
```

**Response:**
```json
{
  "success": true,
  "hash": "QmActualIPFSHash1234567890abcdef",
  "content": {
    "reviewId": "1751704430607puhlkw8oy",
    "rating": 5,
    "text": "Amazing product!",
    "productId": "product123",
    "walletAddress": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
    "timestamp": "2025-07-05T08:33:50.607Z",
    "reviewHash": "2ac77a285fc1e29b9afefe7fe73d0f03b8f022d9d91567d4c632f9ce880aa5ce",
    "localIpfsHash": "Qmdceff68240f8f64f2a5e4ad2e81667eb9a30d0eaec2e",
    "submittedAt": "2025-07-05T08:33:50.607Z",
    "_metadata": {
      "uploadedAt": "2025-07-05T08:33:50.607Z",
      "filename": "review-1751704430607puhlkw8oy.json",
      "version": "1.0"
    }
  },
  "gateway": "https://ipfs.io/ipfs/"
}
```

### **Get Gateway URLs**

```bash
curl http://localhost:3001/api/ipfs/gateways/QmActualIPFSHash1234567890abcdef
```

**Response:**
```json
{
  "hash": "QmActualIPFSHash1234567890abcdef",
  "gateways": {
    "ipfsIo": "https://ipfs.io/ipfs/QmActualIPFSHash1234567890abcdef",
    "cloudflare": "https://cloudflare-ipfs.com/ipfs/QmActualIPFSHash1234567890abcdef",
    "dweb": "https://dweb.link/ipfs/QmActualIPFSHash1234567890abcdef",
    "gateway": "https://gateway.pinata.cloud/ipfs/QmActualIPFSHash1234567890abcdef",
    "web3Storage": "https://QmActualIPFSHash1234567890abcdef.ipfs.w3s.link/"
  }
}
```

## Code Examples

### **Direct IPFS Uploader Usage**

```javascript
const IPFSUploader = require('./ipfs-uploader');

const uploader = new IPFSUploader();

// Upload review data
const reviewData = {
    reviewId: '12345',
    rating: 5,
    text: 'Great product!',
    productId: 'product123',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    timestamp: new Date().toISOString()
};

// Upload to IPFS
const result = await uploader.uploadToIPFS(reviewData, 'review-12345.json');

if (result.success) {
    console.log('IPFS Hash:', result.hash);
    console.log('Service:', result.service);
    
    // Get gateway URLs
    const gateways = uploader.getGatewayURLs(result.hash);
    console.log('Gateway URLs:', gateways);
    
    // Verify the upload
    const verification = await uploader.verifyIPFSHash(result.hash);
    console.log('Verification:', verification.success);
} else {
    console.log('Upload failed:', result.error);
}
```

### **Integration with Review API**

The IPFS uploader is automatically integrated with the review submission API. When a review is submitted:

1. **Review data is prepared** with metadata
2. **IPFS upload is attempted** using the preferred service
3. **Fallback is triggered** if the preferred service fails
4. **Results are stored** in the review and metadata
5. **Response includes** IPFS upload status and gateway URLs

## Error Handling

### **Common Error Scenarios**

1. **API Keys Not Configured**
   ```json
   {
     "ipfsUpload": {
       "success": false,
       "error": "Pinata API credentials not configured",
       "note": "IPFS upload failed - review saved locally only"
     }
   }
   ```

2. **Network Timeout**
   ```json
   {
     "ipfsUpload": {
       "success": false,
       "error": "Request timeout",
       "note": "IPFS upload failed - review saved locally only"
     }
   }
   ```

3. **Service Unavailable**
   ```json
   {
     "ipfsUpload": {
       "success": false,
       "error": "All IPFS upload services failed",
       "note": "IPFS upload failed - review saved locally only"
     }
   }
   ```

### **Graceful Degradation**

- Reviews are **always saved locally** regardless of IPFS upload status
- The API continues to function even if IPFS services are unavailable
- Error messages are clear and actionable
- Fallback logic ensures maximum reliability

## Security Considerations

### **API Key Security**
- Store API keys as environment variables
- Never commit API keys to version control
- Use different keys for development and production

### **Data Privacy**
- Review data is uploaded to public IPFS
- Consider encryption for sensitive data
- Be aware that IPFS content is publicly accessible

### **Rate Limiting**
- Pinata has rate limits based on your plan
- Web3.Storage has generous free limits
- Monitor usage to avoid hitting limits

## Monitoring & Debugging

### **Check Service Status**
```bash
curl http://localhost:3001/health
```

### **View Upload Logs**
The server logs all IPFS upload attempts:
```
🔄 Uploading review to IPFS using pinata...
✅ Successfully uploaded to Pinata: QmHash1234567890abcdef
```

### **Test IPFS Upload**
```bash
node test-ipfs-upload.js
```

## Troubleshooting

### **IPFS Upload Failing**

1. **Check API Keys**
   ```bash
   echo $PINATA_API_KEY
   echo $WEB3STORAGE_API_KEY
   ```

2. **Test Individual Services**
   ```javascript
   const uploader = new IPFSUploader();
   console.log(uploader.checkConfiguration());
   ```

3. **Check Network Connectivity**
   ```bash
   curl -I https://api.pinata.cloud
   curl -I https://api.web3.storage
   ```

### **Gateway Access Issues**

1. **Try Different Gateways**
   - ipfs.io
   - cloudflare-ipfs.com
   - dweb.link
   - gateway.pinata.cloud

2. **Check Hash Format**
   - Ensure hash starts with "Qm"
   - Verify hash length (46 characters for CIDv0)

## Performance Optimization

### **Upload Optimization**
- Use appropriate timeout values (30 seconds default)
- Implement retry logic for failed uploads
- Consider batch uploads for multiple reviews

### **Gateway Optimization**
- Use the fastest gateway for your region
- Implement gateway fallback in your application
- Cache gateway responses when possible

## Future Enhancements

### **Planned Features**
- Support for additional IPFS services
- Automatic retry with exponential backoff
- IPFS content encryption
- Batch upload optimization
- Real-time upload status tracking

### **Integration Possibilities**
- Blockchain transaction integration
- Smart contract event emission
- Decentralized storage alternatives
- Content addressing improvements 