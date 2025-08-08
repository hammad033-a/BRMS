const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const EventEmitter = require('events');
const IPFSUploader = require('./ipfs-uploader');

const app = express();
const PORT = process.env.PORT || 3002;

// Create event emitter for review events
const reviewEventEmitter = new EventEmitter();

// Initialize IPFS uploader
const ipfsUploader = new IPFSUploader();

// File paths for data storage
const REVIEWS_FILE = path.join(__dirname, 'data', 'reviews.json');
const METADATA_FILE = path.join(__dirname, 'data', 'metadata.json');
const STORES_FILE = path.join(__dirname, 'data', 'stores.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data files if they don't exist
if (!fs.existsSync(REVIEWS_FILE)) {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(METADATA_FILE)) {
    fs.writeFileSync(METADATA_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(STORES_FILE)) {
    fs.writeFileSync(STORES_FILE, JSON.stringify([], null, 2));
}

// Helper functions for data persistence
const readReviews = () => {
    try {
        const data = fs.readFileSync(REVIEWS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading reviews file:', error);
        return [];
    }
};

const writeReviews = (reviews) => {
    try {
        fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing reviews file:', error);
        return false;
    }
};

const readMetadata = () => {
    try {
        const data = fs.readFileSync(METADATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading metadata file:', error);
        return [];
    }
};

const writeMetadata = (metadata) => {
    try {
        fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing metadata file:', error);
        return false;
    }
};

// Helper functions for stores persistence
const readStores = () => {
    try {
        const data = fs.readFileSync(STORES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading stores file:', error);
        return [];
    }
};

const writeStores = (storesData) => {
    try {
        fs.writeFileSync(STORES_FILE, JSON.stringify(storesData, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing stores file:', error);
        return false;
    }
};

// Generate IPFS-like hash (simplified for demo)
const generateIPFSHash = (data) => {
    return 'Qm' + crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex').substring(0, 44);
};

// Generate unique review hash
const generateReviewHash = (rating, text, productId, walletAddress, timestamp) => {
    const reviewData = `${rating}-${text}-${productId}-${walletAddress}-${timestamp}`;
    return crypto.createHash('sha256').update(reviewData).digest('hex');
};

// Event listeners for review submission
reviewEventEmitter.on('reviewSubmitted', (reviewData) => {
    console.log('🎉 Review Event Emitted:', {
        event: 'reviewSubmitted',
        reviewId: reviewData.reviewId,
        productId: reviewData.productId,
        walletAddress: reviewData.walletAddress,
        rating: reviewData.rating,
        reviewHash: reviewData.reviewHash,
        ipfsHash: reviewData.ipfsHash,
        timestamp: reviewData.timestamp
    });
    
    // Here you could add additional event handling:
    // - Send notifications
    // - Update analytics
    // - Trigger blockchain transactions
    // - Send webhooks
});

reviewEventEmitter.on('duplicateReviewAttempted', (attemptData) => {
    console.log('⚠️ Duplicate Review Attempt:', {
        event: 'duplicateReviewAttempted',
        walletAddress: attemptData.walletAddress,
        productId: attemptData.productId,
        timestamp: new Date().toISOString()
    });
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    const ipfsConfig = ipfsUploader.checkConfiguration();
    res.json({ 
        status: 'OK', 
        message: 'Enhanced Review API server is running',
        ipfs: {
            configured: ipfsConfig.pinata.configured || ipfsConfig.web3storage.configured,
            services: {
                pinata: ipfsConfig.pinata.configured,
                web3storage: ipfsConfig.web3storage.configured
            }
        }
    });
});

// Review submission endpoint with enhanced duplicate prevention and IPFS upload
app.post('/api/reviews/submit', async (req, res) => {
    try {
        const { rating, text, productId, walletAddress } = req.body;
        
        // Validate required fields
        if (!rating || !text || !productId || !walletAddress) {
            return res.status(400).json({ 
                message: 'Missing required fields: rating, text, productId, walletAddress' 
            });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ 
                message: 'Rating must be between 1 and 5' 
            });
        }

        // Validate wallet address format (basic check)
        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            return res.status(400).json({ 
                message: 'Invalid wallet address format' 
            });
        }

        const normalizedWalletAddress = walletAddress.toLowerCase();
        const timestamp = new Date();

        // Enhanced duplicate prevention
        const reviews = readReviews();
        const existingReview = reviews.find(review => 
            review.walletAddress.toLowerCase() === normalizedWalletAddress && 
            review.productId === productId
        );

        if (existingReview) {
            // Emit duplicate attempt event
            reviewEventEmitter.emit('duplicateReviewAttempted', {
                walletAddress: normalizedWalletAddress,
                productId,
                existingReviewId: existingReview.reviewId
            });
            
            return res.status(409).json({ 
                message: 'You have already submitted a review for this product',
                existingReviewId: existingReview.reviewId,
                submittedAt: existingReview.submittedAt
            });
        }

        // Generate review ID and hashes
        const reviewId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const reviewData = {
            rating,
            text,
            productId,
            walletAddress: normalizedWalletAddress,
            timestamp
        };
        const ipfsHash = generateIPFSHash(reviewData);
        const reviewHash = generateReviewHash(rating, text, productId, normalizedWalletAddress, timestamp);

        // Prepare review data for IPFS upload
        const reviewForIPFS = {
            reviewId,
            rating,
            text,
            productId,
            walletAddress: normalizedWalletAddress,
            timestamp: timestamp.toISOString(),
            reviewHash,
            localIpfsHash: ipfsHash,
            submittedAt: timestamp.toISOString()
        };

        // Upload to IPFS (with fallback handling)
        let ipfsUploadResult = { success: false, error: 'IPFS not configured' };
        try {
            ipfsUploadResult = await ipfsUploader.uploadToIPFS(reviewForIPFS, `review-${reviewId}.json`);
            console.log('IPFS upload result:', ipfsUploadResult);
        } catch (error) {
            console.error('IPFS upload error:', error.message);
            ipfsUploadResult = { success: false, error: error.message };
        }

        // Save review data with enhanced tracking
        const newReview = {
            reviewId,
            ...reviewData,
            ipfsHash,
            reviewHash,
            submittedAt: timestamp,
            // IPFS upload results
            ipfsUpload: {
                success: ipfsUploadResult.success,
                hash: ipfsUploadResult.hash || null,
                service: ipfsUploadResult.service || null,
                error: ipfsUploadResult.error || null
            }
        };
        reviews.push(newReview);
        
        if (!writeReviews(reviews)) {
            return res.status(500).json({ message: 'Failed to save review data' });
        }

        // Save metadata with enhanced tracking
        const metadata = readMetadata();
        const newMetadata = {
            reviewId,
            timestamp,
            productId,
            wallet: normalizedWalletAddress,
            ipfsHash,
            reviewHash,
            clientIP: req.ip || req.connection.remoteAddress,
            submissionMethod: 'api',
            eventEmitted: true,
            // IPFS metadata
            ipfsUpload: {
                success: ipfsUploadResult.success,
                hash: ipfsUploadResult.hash || null,
                service: ipfsUploadResult.service || null,
                error: ipfsUploadResult.error || null
            }
        };
        metadata.push(newMetadata);
        
        if (!writeMetadata(metadata)) {
            return res.status(500).json({ message: 'Failed to save metadata' });
        }

        // Emit successful review submission event
        const eventData = {
            reviewId,
            productId,
            walletAddress: normalizedWalletAddress,
            rating,
            reviewHash,
            ipfsHash,
            timestamp,
            text,
            clientIP: req.ip || req.connection.remoteAddress,
            ipfsUpload: ipfsUploadResult
        };
        
        reviewEventEmitter.emit('reviewSubmitted', eventData);

        console.log('Review submitted successfully:', {
            reviewId,
            productId,
            walletAddress: normalizedWalletAddress,
            rating,
            reviewHash,
            ipfsHash,
            timestamp,
            ipfsUpload: ipfsUploadResult
        });

        // Prepare response with IPFS information
        const response = {
            message: 'Review submitted successfully',
            reviewId,
            reviewHash,
            ipfsHash,
            timestamp: timestamp.toISOString(),
            eventEmitted: true
        };

        // Add IPFS upload result to response
        if (ipfsUploadResult.success) {
            response.ipfsUpload = {
                success: true,
                hash: ipfsUploadResult.hash,
                service: ipfsUploadResult.service,
                gateways: ipfsUploader.getGatewayURLs(ipfsUploadResult.hash)
            };
        } else {
            response.ipfsUpload = {
                success: false,
                error: ipfsUploadResult.error,
                note: 'IPFS upload failed - review saved locally only'
            };
        }

        res.status(201).json(response);

    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ 
            message: 'Internal server error while submitting review',
            error: error.message
        });
    }
});

// Get reviews for a product
app.get('/api/reviews/:productId', (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = readReviews();
        const productReviews = reviews
            .filter(review => review.productId === productId)
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        
        res.json({
            productId,
            reviews: productReviews,
            totalReviews: productReviews.length,
            averageRating: productReviews.length > 0 
                ? (productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length).toFixed(1)
                : 0
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Internal server error while fetching reviews' });
    }
});

// Get all reviews (for admin purposes)
app.get('/api/reviews', (req, res) => {
    try {
        const reviews = readReviews().sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        const metadata = readMetadata().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        res.json({
            reviews,
            metadata,
            totalReviews: reviews.length
        });
    } catch (error) {
        console.error('Error fetching all reviews:', error);
        res.status(500).json({ message: 'Internal server error while fetching reviews' });
    }
});

// Get review by hash (for verification)
app.get('/api/reviews/hash/:reviewHash', (req, res) => {
    try {
        const { reviewHash } = req.params;
        const reviews = readReviews();
        const review = reviews.find(r => r.reviewHash === reviewHash);
        
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        
        res.json({
            review,
            verified: true,
            hash: reviewHash
        });
    } catch (error) {
        console.error('Error fetching review by hash:', error);
        res.status(500).json({ message: 'Internal server error while fetching review' });
    }
});

// IPFS verification endpoint
app.get('/api/ipfs/verify/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        const verification = await ipfsUploader.verifyIPFSHash(hash);
        res.json(verification);
    } catch (error) {
        console.error('Error verifying IPFS hash:', error);
        res.status(500).json({ message: 'Internal server error while verifying IPFS hash' });
    }
});

// IPFS gateway URLs endpoint
app.get('/api/ipfs/gateways/:hash', (req, res) => {
    try {
        const { hash } = req.params;
        const gateways = ipfsUploader.getGatewayURLs(hash);
        res.json({
            hash,
            gateways
        });
    } catch (error) {
        console.error('Error getting gateway URLs:', error);
        res.status(500).json({ message: 'Internal server error while getting gateway URLs' });
    }
});

// Store registration endpoint
app.post('/api/store/register', (req, res) => {
    try {
        const {
            storeName,
            ownerName,
            email,
            phone,
            address,
            description,
            password
        } = req.body;

        // Validate required fields
        if (!storeName || !ownerName || !email || !password) {
            return res.status(400).json({ 
                message: 'Missing required fields: storeName, ownerName, email, password' 
            });
        }

        // Generate a unique store ID
        const storeId = `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create new store object
        const newStore = {
            id: storeId,
            storeName,
            ownerName,
            email,
            phone,
            address,
            description,
            createdAt: new Date().toISOString()
        };
        
        // Save to file
        const stores = readStores();
        stores.push(newStore);
        
        if (!writeStores(stores)) {
            return res.status(500).json({ message: 'Failed to save store data' });
        }
        
        res.status(201).json({
            message: 'Store registered successfully',
            store: newStore
        });
    } catch (error) {
        console.error('Store registration error:', error);
        res.status(500).json({ message: 'Internal server error during store registration' });
    }
});

// Store add product endpoint
app.post('/api/store/add-product', (req, res) => {
    try {
        const {
            productName,
            description,
            price,
            category,
            storeOwner,
            imageUrl,
            storeId
        } = req.body;

        // Validate required fields
        if (!productName || !description || !price || !storeOwner) {
            return res.status(400).json({ 
                message: 'Missing required fields: productName, description, price, storeOwner' 
            });
        }

        // Generate a unique product ID
        const productId = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // In a real app, you'd save to database with storeId
        // For now, just return success
        res.status(201).json({
            message: 'Product added successfully',
            product: {
                id: productId,
                productName,
                description,
                price: parseFloat(price),
                category,
                storeOwner,
                storeId: storeId || 'default',
                imageUrl,
                createdAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ message: 'Internal server error while adding product' });
    }
});

// Get products for a specific store
app.get('/api/store/:storeId/products', (req, res) => {
    try {
        const { storeId } = req.params;
        
        // In a real app, you'd fetch from database
        // For now, return mock data
        const mockProducts = [
            {
                id: '1',
                name: 'Smartphone',
                description: 'Latest smartphone with amazing features',
                price: '0.05',
                category: 'Electronics',
                imageUrl: 'https://via.placeholder.com/300x200/4db8ff/ffffff?text=Smartphone',
                storeId: storeId,
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                name: 'Laptop',
                description: 'High-performance laptop for work and gaming',
                price: '0.1',
                category: 'Electronics',
                imageUrl: 'https://via.placeholder.com/300x200/4db8ff/ffffff?text=Laptop',
                storeId: storeId,
                createdAt: new Date().toISOString()
            }
        ];

        res.json({
            storeId,
            products: mockProducts,
            totalProducts: mockProducts.length
        });
    } catch (error) {
        console.error('Get store products error:', error);
        res.status(500).json({ message: 'Internal server error while fetching store products' });
    }
});

// Get store information
app.get('/api/store/:storeId', (req, res) => {
    try {
        const { storeId } = req.params;
        
        // In a real app, you'd fetch from database
        // For now, return mock data
        const mockStore = {
            id: storeId,
            storeName: 'My Electronics Store',
            ownerName: 'John Doe',
            email: 'john@example.com',
            address: '123 Main St, City',
            description: 'A great store for electronics and gadgets',
            imageUrl: 'https://via.placeholder.com/400x200/4db8ff/ffffff?text=Store+Image',
            createdAt: new Date().toISOString()
        };

        res.json(mockStore);
    } catch (error) {
        console.error('Get store error:', error);
        res.status(500).json({ message: 'Internal server error while fetching store' });
    }
});

// Get stores for a specific user
app.get('/api/stores/user/:userAddress', (req, res) => {
    try {
        const { userAddress } = req.params;
        
        // Read stores from file
        const allStores = readStores();
        
        // For now, return all stores (in a real app, you'd filter by userAddress)
        // This allows any user to see all stores for demo purposes
        const userStores = allStores.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            userAddress,
            stores: userStores,
            totalStores: userStores.length
        });
    } catch (error) {
        console.error('Get user stores error:', error);
        res.status(500).json({ message: 'Internal server error while fetching user stores' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Enhanced Review API server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📝 Submit review: POST http://localhost:${PORT}/api/reviews/submit`);
    console.log(`📖 Get reviews: GET http://localhost:${PORT}/api/reviews/:productId`);
    console.log(`🔍 Verify review: GET http://localhost:${PORT}/api/reviews/hash/:reviewHash`);
    console.log(`🌐 IPFS verify: GET http://localhost:${PORT}/api/ipfs/verify/:hash`);
    console.log(`🔗 IPFS gateways: GET http://localhost:${PORT}/api/ipfs/gateways/:hash`);
    console.log(`🎉 Event system: Review submission events enabled`);
    console.log(`🛡️ Duplicate prevention: Enhanced with review hash tracking`);
    console.log(`📤 IPFS upload: Integrated with fallback support`);
}); 