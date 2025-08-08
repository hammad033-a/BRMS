const IPFSUploader = require('./ipfs-uploader');

// Sample review data
const sampleReview = {
    reviewId: '1751704033089bqbq8skp9',
    rating: 5,
    text: 'Amazing product with enhanced features!',
    productId: 'enhanced123',
    walletAddress: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
    timestamp: '2025-07-05T08:27:13.089Z',
    reviewHash: 'dfa71bbc068c1a82f8e2dd531e129594e173cb3d35edb2994873388b53a92214',
    ipfsHash: 'Qmea44ac35a6860ae5511ea14378d08aaeec092f7d6284'
};

async function testIPFSUpload() {
    console.log('🧪 Testing IPFS Upload Functionality\n');

    const uploader = new IPFSUploader();

    // Check configuration
    console.log('1. Checking IPFS service configuration...');
    const config = uploader.checkConfiguration();
    console.log('Configuration status:', config);
    console.log('');

    // Test upload to IPFS (will fail without API keys, but shows the structure)
    console.log('2. Testing IPFS upload...');
    try {
        const result = await uploader.uploadToIPFS(sampleReview, 'test-review.json', 'pinata');
        console.log('Upload result:', result);
        console.log('');

        if (result.success) {
            // Test verification
            console.log('3. Testing IPFS hash verification...');
            const verification = await uploader.verifyIPFSHash(result.hash);
            console.log('Verification result:', verification);
            console.log('');

            // Get gateway URLs
            console.log('4. Getting IPFS gateway URLs...');
            const gateways = uploader.getGatewayURLs(result.hash);
            console.log('Gateway URLs:', gateways);
            console.log('');
        }

    } catch (error) {
        console.log('Upload test completed (expected to fail without API keys)');
        console.log('Error:', error.message);
        console.log('');
    }

    // Test with mock data (simulates successful upload)
    console.log('5. Testing with mock successful upload...');
    const mockResult = {
        success: true,
        hash: 'QmTestHash1234567890abcdef',
        service: 'pinata',
        timestamp: new Date().toISOString()
    };

    console.log('Mock upload result:', mockResult);
    
    // Test gateway URLs with mock hash
    const mockGateways = uploader.getGatewayURLs(mockResult.hash);
    console.log('Mock gateway URLs:', mockGateways);
    console.log('');

    console.log('✅ IPFS upload functionality test completed!');
    console.log('\n📝 To use with real IPFS services:');
    console.log('1. Get Pinata API keys from: https://app.pinata.cloud/');
    console.log('2. Get Web3.Storage API key from: https://web3.storage/');
    console.log('3. Set environment variables:');
    console.log('   export PINATA_API_KEY="your-pinata-api-key"');
    console.log('   export PINATA_SECRET_KEY="your-pinata-secret-key"');
    console.log('   export WEB3STORAGE_API_KEY="your-web3storage-api-key"');
}

// Function to demonstrate integration with review API
async function demonstrateIntegration() {
    console.log('\n🔗 Integration Example with Review API\n');

    const uploader = new IPFSUploader();
    
    // Simulate review submission
    const reviewData = {
        reviewId: '1751704033089bqbq8skp9',
        rating: 5,
        text: 'Amazing product with enhanced features!',
        productId: 'enhanced123',
        walletAddress: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
        timestamp: '2025-07-05T08:27:13.089Z',
        reviewHash: 'dfa71bbc068c1a82f8e2dd531e129594e173cb3d35edb2994873388b53a92214'
    };

    console.log('1. Review data prepared for IPFS upload');
    console.log('Review data:', reviewData);
    console.log('');

    // Simulate IPFS upload
    console.log('2. Uploading to IPFS...');
    const uploadResult = await uploader.uploadToIPFS(reviewData, 'review-1751704033089bqbq8skp9.json');
    
    if (uploadResult.success) {
        console.log('✅ IPFS upload successful!');
        console.log('IPFS Hash:', uploadResult.hash);
        console.log('Service:', uploadResult.service);
        console.log('Size:', uploadResult.size, 'bytes');
        console.log('');

        // Get gateway URLs
        const gateways = uploader.getGatewayURLs(uploadResult.hash);
        console.log('3. IPFS Gateway URLs:');
        Object.entries(gateways).forEach(([name, url]) => {
            console.log(`   ${name}: ${url}`);
        });
        console.log('');

        // Simulate verification
        console.log('4. Verifying IPFS hash...');
        const verification = await uploader.verifyIPFSHash(uploadResult.hash);
        console.log('Verification result:', verification.success ? '✅ Verified' : '❌ Failed');
        console.log('');

        // Return enhanced review data
        const enhancedReview = {
            ...reviewData,
            ipfsHash: uploadResult.hash,
            ipfsService: uploadResult.service,
            ipfsGateways: gateways,
            uploadedAt: uploadResult.timestamp
        };

        console.log('5. Enhanced review data with IPFS:');
        console.log(JSON.stringify(enhancedReview, null, 2));
        
    } else {
        console.log('❌ IPFS upload failed:', uploadResult.error);
        console.log('This is expected without API keys configured');
    }
}

// Run tests
testIPFSUpload().then(() => {
    return demonstrateIntegration();
}).catch(error => {
    console.error('Test failed:', error);
}); 