import React, { useEffect, useState } from 'react';
import { Segment, Header, Icon, Button, Message, Divider, Rating, Comment, Loader } from 'semantic-ui-react';

const ReviewsSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/reviews/${productId}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      // Support both array and object response
      const reviewList = Array.isArray(data.reviews) ? data.reviews : data;
      setReviews(reviewList);
      setAverageRating(data.averageRating || 0);
      setReviewCount(data.totalReviews || reviewList.length || 0);
    } catch (err) {
      setError('Could not load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchReviews();
    // eslint-disable-next-line
  }, [productId]);

  if (loading) return <Loader active inline="centered" content="Loading reviews..." />;

  return (
    <Segment style={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', marginTop: '1em' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Header as="h3" style={{ color: 'white', margin: 0 }}>
          <Icon name="star" /> Customer Reviews
        </Header>
        <Button icon labelPosition="left" onClick={fetchReviews} size="small">
          <Icon name="refresh" /> Refresh
        </Button>
      </div>
      <Divider />
      <div style={{ display: 'flex', gap: '2em', marginBottom: '1em' }}>
        <div>
          <Header as="h4" style={{ color: '#4db8ff' }}>Average Rating</Header>
          <Rating icon="star" defaultRating={Math.round(averageRating)} maxRating={5} disabled />
          <span style={{ color: 'white', marginLeft: 8 }}>{averageRating} / 5</span>
        </div>
        <div>
          <Header as="h4" style={{ color: '#4db8ff' }}>Total Reviews</Header>
          <span style={{ color: 'white' }}>{reviewCount}</span>
        </div>
      </div>
      {error && <Message negative>{error}</Message>}
      {reviews.length === 0 ? (
        <Message info>No reviews yet. Be the first to review this product!</Message>
      ) : (
        <Comment.Group>
          {reviews.map((review, index) => (
            <Comment key={review.reviewId || index}>
              <Comment.Avatar as="a" style={{ background: '#4db8ff', color: 'white', fontWeight: 'bold', fontSize: 18 }}>
                {index + 1}
              </Comment.Avatar>
              <Comment.Content>
                <Comment.Author as='span' style={{ color: 'white' }}>{review.walletAddress ? `${review.walletAddress.slice(0, 6)}...${review.walletAddress.slice(-4)}` : 'Anonymous'}</Comment.Author>
                <Comment.Metadata>
                  <div style={{ color: '#aaa' }}>{new Date(review.timestamp || review.submittedAt).toLocaleString()}</div>
                  <span style={{ color: '#4db8ff', marginLeft: 8 }}><Icon name="check circle" /> Verified Purchase</span>
                </Comment.Metadata>
                <Comment.Text style={{ color: 'white' }}>
                  <Rating icon='star' defaultRating={review.rating} maxRating={5} disabled />
                  <p>{review.text || review.comment || review.reviewText}</p>
                  {review.image && (
                    <div style={{ marginTop: 10 }}>
                      <img src={review.image} alt="Review" style={{ maxWidth: 200, borderRadius: 8, border: '1px solid #4db8ff' }} />
                    </div>
                  )}
                </Comment.Text>
              </Comment.Content>
            </Comment>
          ))}
        </Comment.Group>
      )}
    </Segment>
  );
};

export default ReviewsSection; 