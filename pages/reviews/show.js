import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Header, Segment, Rating, Comment, Grid, Button, Icon, Divider, Statistic, StatisticGroup, Form, TextArea, Label } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import ReviewForm from '../../components/ReviewForm';
import { getWeb3 } from '../../ethereum/web3';
import { getReviewContract } from '../../ethereum/review_contract';

// Mock product data - this would typically come from a database
const mockProducts = {
  '0': {
    title: 'Quantum Laptop',
    description: 'A powerful laptop with quantum computing capabilities',
    price: '150,000',
    store: 'Tech Solutions Pakistan',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  '1': {
    title: 'Smart Watch',
    description: 'A stylish smartwatch with health monitoring features',
    price: '25,000',
    store: 'Digital Gadgets PK',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  '2': {
    title: 'Wireless Earbuds',
    description: 'High-quality wireless earbuds with noise cancellation',
    price: '12,000',
    store: 'Audio Hub Lahore',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  }
};

const ReviewsShow = () => {
  const router = useRouter();
  const { vendorAddress, productId } = router.query;
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [account, setAccount] = useState(null);
  const [responseInputs, setResponseInputs] = useState({});
  const [showResponseForm, setShowResponseForm] = useState({});

  useEffect(() => {
    const loadData = async () => {
      if (productId && vendorAddress) {
        setLoading(true);
        try {
          const web3 = await getWeb3();
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);
          const reviewContract = await getReviewContract(web3);

          // Fetch product details (still using mock data for this part)
          setProduct(mockProducts[productId] || null);

          // Fetch reviews from the smart contract
          const fetchedReviews = await reviewContract.methods.getProductReviews(productId).call();
          
          const formattedReviews = fetchedReviews.map(review => ({
            id: review.id.toString(),
            author: review.reviewer,
            store: review.store, // Important: Get store address from the review
            rating: parseInt(review.rating),
            comment: review.comment,
            timestamp: new Date(parseInt(review.timestamp) * 1000).toISOString(),
            verified: review.verified,
            vendorResponse: review.vendorResponse,
            responseTimestamp: review.responseTimestamp > 0 ? new Date(parseInt(review.responseTimestamp) * 1000).toISOString() : null,
            status: parseInt(review.status), // 0: Active, 1: Flagged, 2: Resolved
          }));

          setReviews(formattedReviews);
        } catch (error) {
          console.error("Failed to load review data:", error);
        }
        setLoading(false);
      }
    };

    loadData();
  }, [productId, vendorAddress]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handleResponseChange = (reviewId, value) => {
    setResponseInputs(prev => ({ ...prev, [reviewId]: value }));
  };

  const handleResponseSubmit = async (reviewId) => {
    const responseText = responseInputs[reviewId];
    if (!responseText) return;

    setLoading(true);
    try {
      const response = await fetch('/api/reviews/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewId: parseInt(reviewId), response: responseText }),
      });

      if (response.ok) {
        // Refresh reviews to show the new response
        const web3 = await getWeb3();
        const reviewContract = await getReviewContract(web3);
        const fetchedReviews = await reviewContract.methods.getProductReviews(productId).call();
        const formattedReviews = fetchedReviews.map(review => ({
            id: review.id.toString(),
            author: review.reviewer,
            store: review.store, // Important: Get store address from the review
            rating: parseInt(review.rating),
            comment: review.comment,
            timestamp: new Date(parseInt(review.timestamp) * 1000).toISOString(),
            verified: review.verified,
            vendorResponse: review.vendorResponse,
            responseTimestamp: review.responseTimestamp > 0 ? new Date(parseInt(review.responseTimestamp) * 1000).toISOString() : null,
            status: parseInt(review.status), // 0: Active, 1: Flagged, 2: Resolved
        }));
        setReviews(formattedReviews);
        setResponseInputs(prev => ({ ...prev, [reviewId]: '' }));
        setShowResponseForm(prev => ({...prev, [reviewId]: false}));
      } else {
        const errorData = await response.json();
        console.error("Failed to submit response:", errorData.message);
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      alert("An error occurred while submitting your response.");
    }
    setLoading(false);
  };

  const toggleResponseForm = (reviewId) => {
    setShowResponseForm(prev => ({...prev, [reviewId]: !prev[reviewId]}));
  }

  const handleFlagReview = async (reviewId) => {
    if (!account) {
      alert("Please connect your wallet to flag a review.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/reviews/flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewId: parseInt(reviewId) }),
      });

      if (response.ok) {
        const updatedReviews = reviews.map(review => {
          if (review.id === parseInt(reviewId)) {
            return { ...review, status: 1 }; // Set status to 1 (Flagged)
          }
          return review;
        });
        setReviews(updatedReviews);
        alert("Review flagged successfully!");
      } else {
        const errorData = await response.json();
        console.error("Failed to flag review:", errorData.message);
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error flagging review:", error);
      alert("An error occurred while flagging the review.");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <Container>
          <Segment loading style={{ minHeight: '300px' }}>
            <Header>Loading reviews...</Header>
          </Segment>
        </Container>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <Container>
          <Segment>
            <Header>Product not found</Header>
            <Button primary onClick={() => router.push('/')}>
              Return to Home
            </Button>
          </Segment>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Segment style={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', padding: '2em', marginBottom: '2em' }}>
          <Grid>
            <Grid.Row>
              <Grid.Column width={6}>
                <img 
                  src={product.image} 
                  alt={product.title} 
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    borderRadius: '8px'
                  }} 
                />
              </Grid.Column>
              <Grid.Column width={10}>
                <Header as="h2" style={{ color: 'white' }}>{product.title}</Header>
                <p style={{ color: 'white', fontSize: '1.2em' }}>{product.description}</p>
                <Header as="h3" style={{ color: '#4db8ff' }}>PKR {product.price}</Header>
                <p style={{ color: '#888', marginTop: '5px' }}>
                  <Icon name="shop" /> {product.store}
                </p>
                
                <StatisticGroup size="small" style={{ marginTop: '1em' }}>
                  <Statistic>
                    <Statistic.Value>{calculateAverageRating()}</Statistic.Value>
                    <Statistic.Label>Average Rating</Statistic.Label>
                  </Statistic>
                  <Statistic>
                    <Statistic.Value>{reviews.length}</Statistic.Value>
                    <Statistic.Label>Reviews</Statistic.Label>
                  </Statistic>
                  <Statistic>
                    <Statistic.Value>100%</Statistic.Value>
                    <Statistic.Label>Verified</Statistic.Label>
                  </Statistic>
                </StatisticGroup>
                
                <Button 
                  primary 
                  style={{ marginTop: '1em' }}
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  {showReviewForm ? 'Hide Review Form' : 'Write a Review'}
                </Button>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
        
        {showReviewForm && (
          <ReviewForm productId={productId} vendorAddress={vendorAddress} />
        )}
        
        <Segment style={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', padding: '2em' }}>
          <Header as="h3" style={{ color: 'white' }}>
            <Icon name="star" />
            <Header.Content>
              Customer Reviews
              <Header.Subheader>Based on {reviews.length} verified purchases</Header.Subheader>
            </Header.Content>
          </Header>
          
          <Divider />
          
          {reviews.length > 0 ? (
            <Comment.Group>
              {reviews.map(review => (
                <Comment key={review.id}>
                  <Comment.Avatar as='a' src={`https://ui-avatars.com/api/?name=${review.author}&background=random`} />
                  <Comment.Content>
                    <Comment.Author as='a' style={{ color: 'white' }}>{review.author}</Comment.Author>
                    <Comment.Metadata>
                      <div style={{ color: '#aaa' }}>{formatDate(review.timestamp)}</div>
                      {review.verified && (
                        <div style={{ color: '#4db8ff' }}>
                          <Icon name="check circle" /> Verified Purchase
                        </div>
                      )}
                      {review.status === 1 && (
                          <Label as='a' color='red' tag style={{marginLeft: '10px'}}>
                            <Icon name='flag' /> Flagged
                          </Label>
                      )}
                    </Comment.Metadata>
                    <Comment.Text style={{ color: 'white' }}>
                      <Rating icon='star' rating={review.rating} maxRating={5} disabled />
                      <p>{review.comment}</p>
                    </Comment.Text>
                    
                    <Comment.Actions>
                        {/* Show respond button if logged-in user is the store owner for this review */}
                        {account && review.store && account.toLowerCase() === review.store.toLowerCase() && !review.vendorResponse && review.status !== 2 && (
                            <Comment.Action onClick={() => toggleResponseForm(review.id)} style={{color: 'white'}}>
                            <Icon name='reply' />
                            Respond
                            </Comment.Action>
                        )}
                        <Comment.Action onClick={() => handleFlagReview(review.id)} style={{color: '#db2828'}}>
                            <Icon name='flag' />
                            Flag
                        </Comment.Action>
                    </Comment.Actions>

                    {/* Vendor Response Section */}
                    {review.vendorResponse && (
                      <Comment.Group>
                        <Comment>
                          <Comment.Avatar as='a' src={`https://ui-avatars.com/api/?name=${product.store}&background=blue&color=fff`} />
                          <Comment.Content>
                            <Comment.Author as='a' style={{ color: 'white' }}>{product.store} (Vendor)</Comment.Author>
                            <Comment.Metadata>
                              <div style={{ color: '#aaa' }}>{formatDate(review.responseTimestamp)}</div>
                            </Comment.Metadata>
                            <Comment.Text style={{ color: 'white' }}>
                              <p>{review.vendorResponse}</p>
                            </Comment.Text>
                          </Comment.Content>
                        </Comment>
                      </Comment.Group>
                    )}

                    {/* Vendor Response Form - show based on review's store address */}
                    {showResponseForm[review.id] && account && review.store && account.toLowerCase() === review.store.toLowerCase() && !review.vendorResponse &&(
                      <Form reply onSubmit={(e) => {e.preventDefault(); handleResponseSubmit(review.id)}}>
                        <Form.TextArea
                          placeholder='Write your response...'
                          value={responseInputs[review.id] || ''}
                          onChange={(e) => handleResponseChange(review.id, e.target.value)}
                          style={{backgroundColor: '#333', color: 'white'}}
                        />
                        <Button content='Add Reply' labelPosition='left' icon='edit' primary loading={loading} />
                      </Form>
                    )}
                  </Comment.Content>
                </Comment>
              ))}
            </Comment.Group>
          ) : (
            <Segment placeholder>
              <Header icon>
                <Icon name='star' />
                No reviews yet
              </Header>
              <Segment.Inline>
                <Button primary onClick={() => setShowReviewForm(true)}>Be the first to review</Button>
              </Segment.Inline>
            </Segment>
          )}
        </Segment>
      </Container>
    </Layout>
  );
};

export default ReviewsShow;