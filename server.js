const express = require('express');
const bodyParser = require('body-parser');
const next = require('next');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Simplified server setup without Ethereum functionality
const port = 3000;  // server port
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });
const routes = require('./routes');
const handler = routes.getRequestHandler(app);

// In-memory stores for demo purposes
const users = [];
const stores = [];

// File paths for data storage
const REVIEWS_FILE = path.join(__dirname, 'data', 'reviews.json');
const METADATA_FILE = path.join(__dirname, 'data', 'metadata.json');

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

// Generate IPFS-like hash (simplified for demo)
const generateIPFSHash = (data) => {
    const crypto = require('crypto');
    return 'Qm' + crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex').substring(0, 44);
};

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access token missing' });

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

app.prepare().then(async () => {
    const server = express();
    server.use(bodyParser.json());  // supporting JSON
    server.use(bodyParser.urlencoded({ extended: true })); // support encoded body

    // Email login route
    server.post('/api/login', async (req, res) => {
        const { email, password } = req.body;
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        const token = jwt.sign({ 
            email: user.email, 
            role: user.role,
            storeId: user.storeId 
        }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token, role: user.role });
    });

    // Email registration route for buyers
    server.post('/api/register', async (req, res) => {
        const { email, password } = req.body;
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ 
            email, 
            password: hashedPassword, 
            role: 'Buyer',
            storeId: null 
        });
        res.json({ message: 'User registered successfully' });
    });

    // Store registration route
    server.post('/api/store/register', async (req, res) => {
        const { storeName, ownerName, email, phone, address, description, password } = req.body;
        
        // Check if store name or email already exists
        const existingStore = stores.find(s => s.storeName === storeName || s.email === email);
        if (existingStore) {
            return res.status(400).json({ message: 'Store name or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const storeId = Date.now().toString(); // Simple ID generation for demo

        // Create store
        const newStore = {
            id: storeId,
            storeName,
            ownerName,
            email,
            phone,
            address,
            description,
            createdAt: new Date(),
            products: []
        };
        stores.push(newStore);

        // Create store owner account
        users.push({
            email,
            password: hashedPassword,
            role: 'StoreOwner',
            storeId
        });

        res.json({ message: 'Store registered successfully' });
    });

    // Get store details
    server.get('/api/store/:storeId', authenticateToken, (req, res) => {
        const store = stores.find(s => s.id === req.params.storeId);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        res.json(store);
    });

    // Add product to store
    server.post('/api/store/:storeId/products', authenticateToken, (req, res) => {
        const { name, description, price, image } = req.body;
        const store = stores.find(s => s.id === req.params.storeId);
        
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        if (req.user.role !== 'StoreOwner' || req.user.storeId !== req.params.storeId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const productId = Date.now().toString();
        const newProduct = {
            id: productId,
            name,
            description,
            price,
            image,
            createdAt: new Date(),
            reviews: []
        };

        store.products.push(newProduct);
        res.json({ message: 'Product added successfully', product: newProduct });
    });

    // Review submission endpoint
    server.post('/api/reviews/submit', async (req, res) => {
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

            // Check for duplicate reviews
            const reviews = readReviews();
            const existingReview = reviews.find(review => 
                review.walletAddress.toLowerCase() === walletAddress.toLowerCase() && 
                review.productId === productId
            );

            if (existingReview) {
                return res.status(409).json({ 
                    message: 'You have already submitted a review for this product' 
                });
            }

            // Generate review ID and IPFS hash
            const reviewId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            const reviewData = {
                rating,
                text,
                productId: String(productId),
                walletAddress: walletAddress.toLowerCase(),
                timestamp: new Date().toISOString()
            };
            const ipfsHash = generateIPFSHash(reviewData);

            // Save review data
            const newReview = {
                reviewId,
                ...reviewData,
                ipfsHash
            };
            reviews.push(newReview);
            
            if (!writeReviews(reviews)) {
                return res.status(500).json({ message: 'Failed to save review data' });
            }

            // Save metadata
            const metadata = readMetadata();
            const newMetadata = {
                reviewId,
                timestamp: new Date().toISOString(),
                productId,
                wallet: walletAddress.toLowerCase(),
                ipfsHash,
                clientIP: req.ip || req.connection.remoteAddress
            };
            metadata.push(newMetadata);
            
            if (!writeMetadata(metadata)) {
                return res.status(500).json({ message: 'Failed to save metadata' });
            }

            console.log('Review submitted successfully:', {
                reviewId,
                productId,
                walletAddress,
                rating,
                ipfsHash
            });

            res.status(201).json({
                message: 'Review submitted successfully',
                reviewId,
                ipfsHash,
                timestamp: newMetadata.timestamp
            });

        } catch (error) {
            console.error('Error submitting review:', error);
            res.status(500).json({ 
                message: 'Internal server error while submitting review' 
            });
        }
    });

    // Get reviews for a product
    server.get('/api/reviews/:productId', (req, res) => {
        try {
            const { productId } = req.params;
            const reviews = readReviews();
            const productReviews = reviews.filter(review => String(review.productId) === String(productId));
            
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
    server.get('/api/reviews', (req, res) => {
        try {
            const reviews = readReviews();
            const metadata = readMetadata();
            
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

    // Mock routes for Ethereum functionality
    server.route('/reviews/addTransaction')
        .post((req, res) => {
            console.log('Mock transaction added:', req.body);
            return handler(req, res);
        });

    server.route('/reviews/send_sms')
        .get((req, res) => {
            return handler(req, res);
        })
        .post((req, res) => {
            console.log('Mock SMS sent:', req.body);
            return handler(req, res);
        });

    // Catch-all routes for Next.js pages (must be last)
    server.get('*', (req, res) => {
        return handler(req, res);
    });

    server.post('*', (req, res) => {
        return handler(req, res);
    });

    server.listen(port, err => {
        if (err) throw err;
        console.log("[*] Ready on localhost:", port);
    });
});

