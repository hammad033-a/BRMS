import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Header, Segment, Rating, Divider, Button, Icon, Message, Grid, Statistic } from 'semantic-ui-react';
import Layout from '../../../../../../components/Layout';
import ReviewForm from '../../../../../../components/ReviewForm';
import ReviewContract from '../../../../../../ethereum/ReviewContract';

// Helper function to convert store name to Ethereum address
const getStoreAddress = (storeName) => {
  // For testing purposes, we'll use a default address
  // In a real implementation, this would be a mapping or database lookup
  const storeAddresses = {
    'tech-store': '0x26E82f7efd4F202557db62840bD7F9964E5D555e',
    'fashion-hub': '0xd74a22d5f9251D6fEA747a385a22Cd2606a41D0c',
    'generic-store': '0x5d58DBc3a66DB31bC3b4DDE788131537Ec9E1644'
  };
  
  // If store name is already an Ethereum address, return it
  if (storeName && storeName.startsWith('0x') && storeName.length === 42) {
    return storeName;
  }
  
  // Return mapped address or default to first Ganache account
  return storeAddresses[storeName] || '0x26E82f7efd4F202557db62840bD7F9964E5D555e';
};

const ProductReviews = () => {
  const router = useRouter();
  const { store, productId, page } = router.query;
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewContract, setReviewContract] = useState(null);
  const [isContractInitialized, setIsContractInitialized] = useState(false);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  
  // Mock product data based on productId
  const getProductData = () => {
    if (productId === '1') {
      return {
        title: 'Smartphone X',
        description: 'Latest smartphone with amazing features',
        price: '400,000',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        store: 'Tech Store'
      };
    } else if (productId === '2') {
      return {
        title: 'Laptop Pro',
        description: 'High-performance laptop for professionals',
        price: '960,000',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        store: 'Tech Store'
      };
    } else if (productId === '3') {
      return {
        title: 'Designer Dress',
        description: 'Elegant dress for special occasions',
        price: '240,000',
        image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        store: 'Fashion Hub'
      };
    } else if (productId === '4') {
      return {
        title: 'Casual T-shirt',
        description: 'Comfortable everyday wear',
        price: '5,000',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
        store: 'Fashion Hub'
      };
    } else {
      return {
        title: 'Generic Product',
        description: 'A generic product description',
        price: '10,000',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        store: 'Generic Store'
      };
    }
  };
  
  const product = getProductData();
  
  useEffect(() => {
    // Check if MetaMask is connected
    const metamaskConnected = localStorage.getItem('metamaskConnected') === 'true';
    const storedUserAddress = localStorage.getItem('userAddress');
    
    setIsMetaMaskConnected(metamaskConnected);
    setUserAddress(storedUserAddress || '');
    
    // Initialize the review contract
    const initContract = async () => {
      if (metamaskConnected) {
        try {
          const contract = new ReviewContract();
          const initialized = await contract.init();
          if (initialized) {
            setReviewContract(contract);
            setIsContractInitialized(true);
          }
        } catch (err) {
          console.error('Error initializing contract:', err);
          setError('Failed to initialize the review contract. Please try again.');
        }
      }
    };
    
    initContract();
    
    // Set up auto-refresh every 10 seconds
    const refreshInterval = setInterval(() => {
      if (productId) {
        fetchReviews(metamaskConnected ? reviewContract : null, productId);
        fetchProductStats(metamaskConnected ? reviewContract : null, productId);
      }
    }, 10000);
    
    return () => clearInterval(refreshInterval);
  }, [productId]);
  
  // New useEffect to fetch reviews/stats when contract or productId changes
  useEffect(() => {
    if (productId) {
      fetchReviews(isMetaMaskConnected ? reviewContract : null, productId);
      fetchProductStats(isMetaMaskConnected ? reviewContract : null, productId);
    }
  }, [reviewContract, isMetaMaskConnected, productId]);
  
  const fetchReviews = async (contract, pid) => {
    try {
      setIsLoading(true);
      
      // First try to get reviews from the API server
      try {
        const response = await fetch(`/api/reviews/${pid}`);
        if (response.ok) {
          const apiReviews = await response.json();
          if (apiReviews && apiReviews.length > 0) {
            // Format API reviews
            const formattedReviews = apiReviews.map(review => ({
              reviewer: review.walletAddress || review.reviewer,
              rating: review.rating,
              comment: review.comment || review.reviewText,
              timestamp: new Date(review.timestamp).toLocaleString(),
              verified: review.verified || true
            }));
            setReviews(formattedReviews);
            setAverageRating(apiReviews.reduce((sum, r) => sum + r.rating, 0) / apiReviews.length);
            setReviewCount(apiReviews.length);
            setIsLoading(false);
            return;
          }
        }
      } catch (apiError) {
        console.log('API fetch failed, trying blockchain:', apiError);
      }
      
      // Fallback to blockchain if API fails
      if (contract) {
        const productReviews = await contract.getProductReviews(pid);
        
        // Format the reviews
        const formattedReviews = productReviews.map(review => ({
          reviewer: review.reviewer,
          rating: review.rating,
          comment: review.comment,
          timestamp: new Date(review.timestamp * 1000).toLocaleString(),
          verified: review.verified
        }));
        
        setReviews(formattedReviews);
      } else {
        throw new Error('No contract available');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to fetch reviews from the blockchain. Using mock data instead.');
      setMockReviews();
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchProductStats = async (contract, pid) => {
    try {
      // First try to get stats from the API server
      try {
        const response = await fetch(`/api/reviews/${pid}`);
        if (response.ok) {
          const apiReviews = await response.json();
          if (apiReviews && apiReviews.length > 0) {
            const avgRating = apiReviews.reduce((sum, r) => sum + r.rating, 0) / apiReviews.length;
            setAverageRating(avgRating);
            setReviewCount(apiReviews.length);
            return;
          }
        }
      } catch (apiError) {
        console.log('API stats fetch failed, trying blockchain:', apiError);
      }
      
      // Fallback to blockchain if API fails
      if (contract) {
        // Get the average rating
        const avgRating = await contract.getProductAverageRating(pid);
        setAverageRating(avgRating);
        
        // Get the review count
        const count = await contract.getProductReviewCount(pid);
        setReviewCount(count);
      } else {
        throw new Error('No contract available');
      }
    } catch (err) {
      console.error('Error fetching product stats:', err);
      // Use mock data
      setAverageRating(4.5);
      setReviewCount(12);
    }
  };
  
  const setMockReviews = () => {
    let mockReviews = [];
    if (productId === '1') {
      mockReviews = [
        {
          reviewer: '0x1111111111111111111111111111111111111111',
          rating: 5,
          comment: 'Amazing phone! Super fast and the camera is excellent.',
          timestamp: '2023-05-01 12:00:00',
          verified: true
        },
        {
          reviewer: '0x2222222222222222222222222222222222222222',
          rating: 4,
          comment: 'Great value for money. Battery lasts all day.',
          timestamp: '2023-05-02 15:30:00',
          verified: true
        }
      ];
      setAverageRating(4.5);
      setReviewCount(2);
    } else if (productId === '2') {
      mockReviews = [
        {
          reviewer: '0x3333333333333333333333333333333333333333',
          rating: 5,
          comment: 'Perfect for work and gaming. Highly recommend!',
          timestamp: '2023-05-03 10:20:00',
          verified: true
        },
        {
          reviewer: '0x4444444444444444444444444444444444444444',
          rating: 4,
          comment: 'Very powerful but a bit heavy.',
          timestamp: '2023-05-04 09:10:00',
          verified: true
        }
      ];
      setAverageRating(4.5);
      setReviewCount(2);
    } else if (productId === '3') {
      mockReviews = [
        {
          reviewer: '0x5555555555555555555555555555555555555555',
          rating: 5,
          comment: 'Beautiful dress, fits perfectly!',
          timestamp: '2023-05-05 14:00:00',
          verified: true
        }
      ];
      setAverageRating(5.0);
      setReviewCount(1);
    } else if (productId === '4') {
      mockReviews = [
        {
          reviewer: '0x6666666666666666666666666666666666666666',
          rating: 4,
          comment: 'Very comfortable and good quality.',
          timestamp: '2023-05-06 11:45:00',
          verified: true
        }
      ];
      setAverageRating(4.0);
      setReviewCount(1);
    } else {
      mockReviews = [
        {
          reviewer: '0x1234567890123456789012345678901234567890',
          rating: 4,
          comment: 'Good product overall. Would recommend to others.',
          timestamp: '2023-04-15 14:30:00',
          verified: true
        },
        {
          reviewer: '0x2345678901234567890123456789012345678901',
          rating: 3,
          comment: 'Average product. Nothing special.',
          timestamp: '2023-04-10 09:15:00',
          verified: true
        }
      ];
      setAverageRating(3.5);
      setReviewCount(2);
    }
    setReviews(mockReviews);
    setIsLoading(false);
  };
  
  const renderReviews = () => {
    if (isLoading) {
      return <div>Loading reviews...</div>;
    }
    
    if (reviews.length === 0) {
      return <div>No reviews yet. Be the first to review this product!</div>;
    }
    
    return reviews.map((review, index) => (
      <Segment key={index} style={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', marginBottom: '1em' }}>
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Rating icon='star' defaultRating={review.rating} maxRating={5} disabled />
                <div style={{ color: '#888' }}>
                  {review.timestamp}
                </div>
              </div>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              <p style={{ color: 'white', marginTop: '1em' }}>{review.comment}</p>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1em' }}>
                <div style={{ color: '#888' }}>
                  <Icon name="user" /> {review.reviewer.substring(0, 6)}...{review.reviewer.substring(review.reviewer.length - 4)}
                </div>
                {review.verified && (
                  <div style={{ color: 'green' }}>
                    <Icon name="check circle" /> Verified Purchase
                  </div>
                )}
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    ));
  };
  
  return (
    <Layout>
      <Container>
        <Segment style={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', padding: '2em', marginBottom: '2em' }}>
          <Grid>
            <Grid.Row>
              <Grid.Column width={8}>
                <img 
                  src={product.image} 
                  alt={product.title} 
                  style={{ 
                    width: '100%', 
                    height: '300px', 
                    objectFit: 'cover',
                    borderRadius: '4px',
                    marginBottom: '1em'
                  }} 
                />
              </Grid.Column>
              <Grid.Column width={8}>
                <Header as="h2" style={{ color: 'white' }}>
                  {product.title}
                </Header>
                <p style={{ color: 'white', fontSize: '1.2em', marginBottom: '1em' }}>
                  {product.description}
                </p>
                <div style={{ color: '#4db8ff', fontSize: '1.5em', marginBottom: '1em' }}>
                  PKR {product.price}
                </div>
                <div style={{ color: '#888', marginBottom: '1em' }}>
                  <Icon name="shop" /> {product.store}
                </div>
                <Button primary>
                  <Icon name="shopping cart" />
                  Buy Now
                </Button>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
        
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <Header as="h2" style={{ color: 'white' }}>
                <Icon name="star" />
                <Header.Content>
                  Product Reviews
                  <Header.Subheader>See what customers are saying about this product</Header.Subheader>
                </Header.Content>
              </Header>
            </Grid.Column>
          </Grid.Row>
          
          <Grid.Row>
            <Grid.Column width={4}>
              <Segment style={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', textAlign: 'center' }}>
                <Statistic>
                  <Statistic.Value>{averageRating}</Statistic.Value>
                  <Statistic.Label>Average Rating</Statistic.Label>
                </Statistic>
                <Divider />
                <Statistic>
                  <Statistic.Value>{reviewCount}</Statistic.Value>
                  <Statistic.Label>Reviews</Statistic.Label>
                </Statistic>
              </Segment>
            </Grid.Column>
            <Grid.Column width={12}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1em' }}>
                <div></div>
                <Button 
                  icon 
                  labelPosition='left' 
                  onClick={() => {
                    setIsLoading(true);
                    fetchReviews(isMetaMaskConnected ? reviewContract : null, productId);
                    fetchProductStats(isMetaMaskConnected ? reviewContract : null, productId);
                  }}
                  loading={isLoading}
                >
                  <Icon name='refresh' />
                  Refresh Reviews
                </Button>
              </div>
              
              {error && (
                <Message warning>
                  <Message.Header>Warning</Message.Header>
                  <p>{error}</p>
                </Message>
              )}
              
              {renderReviews()}
            </Grid.Column>
          </Grid.Row>
        </Grid>
        
        <Divider section style={{ color: 'white' }} />
        
        {isMetaMaskConnected ? (
          <ReviewForm productId={productId} vendorAddress={getStoreAddress(store)} />
        ) : (
          <Segment style={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', padding: '2em', textAlign: 'center' }}>
            <Header as="h3" style={{ color: 'white' }}>
              <Icon name="lock" />
              <Header.Content>
                Connect with MetaMask to Submit a Review
                <Header.Subheader>Your review will be verified on the blockchain</Header.Subheader>
              </Header.Content>
            </Header>
            <Button primary as="a" href="/login">
              <Icon name="ethereum" />
              Connect MetaMask
            </Button>
          </Segment>
        )}
      </Container>
    </Layout>
  );
};

export default ProductReviews; 