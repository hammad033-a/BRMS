const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const EventEmitter = require('events');

const app = express();
const PORT = 3001; // Different port to avoid conflicts

// Create event emitter for review events
const reviewEventEmitter = new EventEmitter();

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/reviewdb';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Review Schema with enhanced tracking
const reviewSchema = new mongoose.Schema({
    reviewId: { type: String, required: true, unique: true },
    rating: { type: Number, required: true },
    text: { type: String, required: true },
    productId: { type: String, required: true },
    walletAddress: { type: String, required: true },
    timestamp: { type: Date, required: true },
    ipfsHash: { type: String, required: true },
    // Enhanced tracking fields
    reviewHash: { type: String, required: true }, // Unique hash for this specific review
    submittedAt: { type: Date, default: Date.now }
});

// Create compound index to prevent duplicates
reviewSchema.index({ walletAddress: 1, productId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

// Metadata Schema with enhanced tracking
const metadataSchema = new mongoose.Schema({
    reviewId: { type: String, required: true },
    timestamp: { type: Date, required: true },
    productId: { type: String, required: true },
    wallet: { type: String, required: true },
    ipfsHash: { type: String, required: true },
    reviewHash: { type: String, required: true }, // Track the review hash
    clientIP: { type: String },
    // Enhanced tracking
    submissionMethod: { type: String, default: 'api' },
    blockchainTxHash: { type: String }, // For future blockchain integration
    eventEmitted: { type: Boolean, default: false }
});

const Metadata = mongoose.model('Metadata', metadataSchema);

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
    res.json({ status: 'OK', message: 'Review API server is running' });
});

// Review submission endpoint with enhanced duplicate prevention
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

        // Enhanced duplicate prevention with better error handling
        try {
            const existingReview = await Review.findOne({
                walletAddress: normalizedWalletAddress,
                productId
            });
            
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
        } catch (error) {
            console.error('Error checking for duplicate review:', error);
            return res.status(500).json({ 
                message: 'Error checking for duplicate review' 
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

        // Save review data with enhanced tracking
        const newReview = new Review({
            reviewId,
            ...reviewData,
            ipfsHash,
            reviewHash,
            submittedAt: timestamp
        });
        
        await newReview.save();

        // Save metadata with enhanced tracking
        const newMetadata = new Metadata({
            reviewId,
            timestamp,
            productId,
            wallet: normalizedWalletAddress,
            ipfsHash,
            reviewHash,
            clientIP: req.ip || req.connection.remoteAddress,
            submissionMethod: 'api',
            eventEmitted: true
        });
        await newMetadata.save();

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
            clientIP: req.ip || req.connection.remoteAddress
        };
        
        reviewEventEmitter.emit('reviewSubmitted', eventData);

        console.log('Review submitted successfully:', {
            reviewId,
            productId,
            walletAddress: normalizedWalletAddress,
            rating,
            reviewHash,
            ipfsHash,
            timestamp
        });

        res.status(201).json({
            message: 'Review submitted successfully',
            reviewId,
            reviewHash,
            ipfsHash,
            timestamp: timestamp.toISOString(),
            eventEmitted: true
        });

    } catch (error) {
        console.error('Error submitting review:', error);
        
        // Handle MongoDB duplicate key error specifically
        if (error.code === 11000) {
            return res.status(409).json({ 
                message: 'You have already submitted a review for this product (duplicate detected)',
                error: 'DUPLICATE_REVIEW'
            });
        }
        
        res.status(500).json({ 
            message: 'Internal server error while submitting review',
            error: error.message
        });
    }
});

// Get reviews for a product
app.get('/api/reviews/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({ productId }).sort({ submittedAt: -1 });
        
        res.json({
            productId,
            reviews,
            totalReviews: reviews.length,
            averageRating: reviews.length > 0 
                ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                : 0
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Internal server error while fetching reviews' });
    }
});

// Get all reviews (for admin purposes)
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ submittedAt: -1 });
        const metadata = await Metadata.find().sort({ timestamp: -1 });
        
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
app.get('/api/reviews/hash/:reviewHash', async (req, res) => {
    try {
        const { reviewHash } = req.params;
        const review = await Review.findOne({ reviewHash });
        
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

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Review API server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📝 Submit review: POST http://localhost:${PORT}/api/reviews/submit`);
    console.log(`📖 Get reviews: GET http://localhost:${PORT}/api/reviews/:productId`);
    console.log(`🔍 Verify review: GET http://localhost:${PORT}/api/reviews/hash/:reviewHash`);
    console.log(`🎉 Event system: Review submission events enabled`);
}); 