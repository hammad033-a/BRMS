import React, { useState, useEffect } from 'react';
import { Form, Button, Rating, Message, Segment, Header, Icon } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import { getReviewContract } from '../ethereum/review_contract';
import { PRODUCT_PAYMENT_ABI, PRODUCT_PAYMENT_ADDRESS } from '../ethereum/ProductPayment';

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

const ReviewForm = ({ productId, vendorAddress, onSuccess }) => {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [reviewContract, setReviewContract] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [hasPaid, setHasPaid] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);
  const [storeAddress, setStoreAddress] = useState('');
  const [backendError, setBackendError] = useState('');
  const [backendSuccess, setBackendSuccess] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    const checkMetaMaskConnection = () => {
      const connected = localStorage.getItem('metamaskConnected') === 'true';
      const address = localStorage.getItem('userAddress');
      setIsMetaMaskConnected(connected);
      setUserAddress(address);
    };

    checkMetaMaskConnection();
    
    // Convert vendor address to proper Ethereum address
    const properStoreAddress = getStoreAddress(vendorAddress);
    setStoreAddress(properStoreAddress);
  }, [vendorAddress]);

  useEffect(() => {
    const initContract = async () => {
      try {
        const contract = await getReviewContract();
        setReviewContract(contract);
        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing contract:', err);
        setError('Failed to initialize the review contract. Please try again.');
      }
    };

    if (isMetaMaskConnected) {
      initContract();
    }
  }, [isMetaMaskConnected]);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!isMetaMaskConnected || !userAddress) {
        setIsCheckingPayment(false);
        return;
      }

      try {
        // Initialize Web3 to check payment status
        if (typeof window !== 'undefined' && window.ethereum) {
          const Web3 = (await import('web3')).default;
          const web3 = new Web3(window.ethereum);
          const paymentContract = new web3.eth.Contract(PRODUCT_PAYMENT_ABI, PRODUCT_PAYMENT_ADDRESS);
          
          // Check if user has paid for this product
          const paid = await paymentContract.methods.hasPaid(userAddress, productId).call();
          setHasPaid(paid);
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        // If we can't check payment status, allow review submission
        setHasPaid(true);
      } finally {
        setIsCheckingPayment(false);
      }
    };

    checkPaymentStatus();
  }, [isMetaMaskConnected, userAddress, productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Review form submitted!');
    setIsSubmitting(true);
    setError('');
    setBackendError('');
    setBackendSuccess('');
    
    try {
      if (!isMetaMaskConnected) {
        throw new Error('Please connect your MetaMask wallet to submit a review');
      }
      
      if (!hasPaid) {
        throw new Error('You must purchase this product before submitting a review. Please complete your purchase first.');
      }
      
      if (!isInitialized || !reviewContract) {
        throw new Error('Review contract not initialized');
      }
      // Get MetaMask account
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const numericProductId = Number(productId);
      
      if (isNaN(numericProductId)) {
        throw new Error('Invalid Product ID. It must be a number.');
      }

      // Submit the review to the blockchain
      await reviewContract.methods.submitReview(
        storeAddress,
        numericProductId,
        rating,
        comment
      ).send({ from: accounts[0] });

      // Find the correct productId to use for review submission
      const trueProductId = typeof productId === 'object' && productId.$oid ? productId.$oid : productId;
      console.log('ReviewForm: Submitting review for productId:', trueProductId);
      // Submit the review to the backend API for display
      const backendRes = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          text: comment,
          productId: trueProductId,
          walletAddress: userAddress,
          image: image || null
        })
      });
      const backendData = await backendRes.json();
      console.log('Backend review submit response:', backendData);
      if (!backendRes.ok) {
        setBackendError(backendData.error || 'Failed to save review to backend');
        return;
      }
      setBackendSuccess('Review submitted and saved!');
      
      setSuccess(true);
      // Remove redirect, call onSuccess if provided
      if (onSuccess) onSuccess();
      
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingPayment) {
    return (
      <Segment style={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', padding: '2em' }}>
        <Message info>
          <Message.Header>Checking Payment Status</Message.Header>
          <p>Verifying if you have purchased this product...</p>
        </Message>
      </Segment>
    );
  }

  return (
    <Segment style={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', padding: '2em' }}>
      <Header as="h3" style={{ color: 'white' }}>
        <Icon name="star" />
        <Header.Content>
          Submit a Review
          <Header.Subheader>Share your experience with this product</Header.Subheader>
        </Header.Content>
      </Header>
      
      {!isMetaMaskConnected && (
        <Message warning>
          <Message.Header>MetaMask Required</Message.Header>
          <p>Please connect your MetaMask wallet to submit a review. You can still view products and reviews without connecting.</p>
        </Message>
      )}
      
      {isMetaMaskConnected && !hasPaid && (
        <Message negative>
          <Message.Header>Purchase Required</Message.Header>
          <p>You must purchase this product before submitting a review. Please complete your purchase first.</p>
          <Button as="a" href={`/products/${storeAddress}/${productId}/pay`} primary>
            <Icon name="shopping cart" />
            Purchase Product
          </Button>
        </Message>
      )}
      
      {isMetaMaskConnected && hasPaid && (
        <Message positive>
          <Message.Header>Purchase Verified</Message.Header>
          <p>Connected with account: {userAddress}</p>
          <p>✅ You have purchased this product and can submit a review.</p>
        </Message>
      )}
      
      {error && (
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{error}</p>
        </Message>
      )}
      
      {success && (
        <Message positive>
          <Message.Header>Success!</Message.Header>
          <p>Your review has been submitted successfully to the blockchain.</p>
        </Message>
      )}

      {backendError && <div style={{ color: 'red', marginTop: 10 }}>{backendError}</div>}
      {backendSuccess && <div style={{ color: 'green', marginTop: 10 }}>{backendSuccess}</div>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Field>
          <label style={{ color: 'white' }}>Rating</label>
          <Rating 
            icon='star' 
            defaultRating={0} 
            maxRating={5} 
            onRate={(e, { rating }) => setRating(rating)}
            size='huge'
            disabled={!isMetaMaskConnected || !hasPaid}
          />
        </Form.Field>
        
        <Form.TextArea
          label='Your Review'
          placeholder='Tell us about your experience with this product...'
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
          disabled={!isMetaMaskConnected || !hasPaid}
        />
        <Form.Field>
          <label style={{ color: 'white' }}>Product Picture (optional)</label>
          <input
            type='file'
            accept='image/*'
            disabled={!isMetaMaskConnected || !hasPaid}
            onChange={e => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setImage(reader.result);
                reader.readAsDataURL(file);
              } else {
                setImage(null);
              }
            }}
          />
        </Form.Field>
        
        <Button 
          type='submit' 
          primary 
          loading={isSubmitting}
          disabled={rating === 0 || !comment.trim() || !isInitialized || !isMetaMaskConnected || !hasPaid}
        >
          {!isMetaMaskConnected ? 'Connect MetaMask to Submit Review' : 
           !hasPaid ? 'Purchase Required to Submit Review' : 
           'Submit Review'}
        </Button>
      </Form>
    </Segment>
  );
};

export default ReviewForm; 