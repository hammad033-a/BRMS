import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Header, Segment, Message, Icon, Button, Image, Loader, Rating, Divider, Comment, Modal, Form, Rating as SURating, TextArea } from 'semantic-ui-react';
import Layout from '../../../components/Layout';

// Glassy dark card style for product detail (black transparent, light text)
const glassCardStyle = {
  background: 'rgba(24,28,36,0.55)', // black transparent glassy
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.08)',
  padding: 48,
  animation: 'fadeInUp 0.7s cubic-bezier(.4,2,.6,1)',
  color: '#e0e0e0', // light grey text for readability
  display: 'flex',
  flexDirection: 'row',
  gap: 48,
  alignItems: 'center',
  maxWidth: 980,
  minWidth: 540,
  minHeight: 380,
  width: '100%',
  margin: 'auto',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  boxSizing: 'border-box',
};

// Remove the dark/black background from the entire page
const gradientBg = {
  minHeight: '100vh',
  background: 'transparent',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start', // align to top
  position: 'relative',
  overflow: 'hidden',
};

// Add animated overlay (moving gradient light)
const animatedOverlay = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  background: 'radial-gradient(circle at 60% 40%, rgba(77,184,255,0.10) 0%, rgba(24,28,36,0.0) 60%)',
  animation: 'moveLight 7s ease-in-out infinite alternate',
  zIndex: 0,
};

const imageAnim = {
  animation: 'fadeIn 0.8s cubic-bezier(.4,2,.6,1)',
  borderRadius: 14,
  background: '#181c24',
  maxWidth: 320,
  width: '100%',
  objectFit: 'contain',
  margin: '0',
  display: 'block',
  boxShadow: '0 4px 24px rgba(31,38,135,0.10)',
};

const detailsStyle = {
  flex: 1,
  minWidth: 260,
  color: '#fff',
};

const buttonStyle = {
  borderRadius: 14,
  fontWeight: 600,
  boxShadow: '0 2px 8px rgba(44,62,80,0.10)',
  transition: 'transform 0.18s',
};

const sectionAnim = {
  animation: 'fadeIn 1.2s cubic-bezier(.4,2,.6,1)',
};

// Add a style for review text and average rating
const reviewTextStyle = {
  color: '#fff',
};
const averageRatingStyle = {
  color: '#fff',
  fontWeight: 500,
};

// Add zoom effect to image on hover
const zoomImageStyle = {
  ...imageAnim,
  transition: 'transform 0.3s cubic-bezier(.4,2,.6,1), opacity 0.4s',
  opacity: 1,
  width: '100%',
  borderRadius: 12,
  boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
  cursor: 'zoom-in',
};

// Remove floatIn keyframes, keep only fadeIn
if (typeof window !== 'undefined' && !document.getElementById('product-detail-animations')) {
  const style = document.createElement('style');
  style.id = 'product-detail-animations';
  style.innerHTML = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes moveLight {
      0% { background-position: 60% 40%; }
      100% { background-position: 30% 70%; }
    }
  `;
  document.head.appendChild(style);
}

const ProductDetails = () => {
  const router = useRouter();
  const { productId } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasBought, setHasBought] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [buySuccess, setBuySuccess] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [ethToPkrRate, setEthToPkrRate] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);
  const [ethError, setEthError] = useState('');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState({ name: '', address: '', phone: '' });
  const [buyerError, setBuyerError] = useState('');
  const [reviewImage, setReviewImage] = useState(null);
  const [reviewImagePreview, setReviewImagePreview] = useState(null);
  const [respondingReviewId, setRespondingReviewId] = useState(null);
  const [vendorResponseText, setVendorResponseText] = useState('');
  const [vendorResponseLoading, setVendorResponseLoading] = useState(false);
  const [vendorResponseError, setVendorResponseError] = useState('');
  const [orderError, setOrderError] = useState('');
  // Add state for current image index
  const [currentImage, setCurrentImage] = useState(0);

  // Dummy: Assume current user is store owner if wallet matches product.store.ownerAddress
  const isStoreOwner = typeof window !== 'undefined' && window.ethereum && product && product.store && window.ethereum.selectedAddress && product.store.ownerAddress && window.ethereum.selectedAddress.toLowerCase() === product.store.ownerAddress.toLowerCase();

  useEffect(() => {
      if (!productId) return;
      setLoading(true);
      setError('');
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.message) {
          setProduct(data);
        } else {
          setError(data.message || 'Product not found');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load product details');
        setLoading(false);
      });
  }, [productId]);

  useEffect(() => {
    if (product && ethToPkrRate) {
      let pkrPrice = parseFloat(product.price);
      if (isNaN(pkrPrice) || !isFinite(pkrPrice) || pkrPrice <= 0) {
        pkrPrice = parseFloat(product.pricePKR);
      }
      if (!isNaN(pkrPrice) && isFinite(pkrPrice) && pkrPrice > 0 && ethToPkrRate > 0) {
        setEthPrice((pkrPrice / ethToPkrRate).toFixed(6));
        setEthError('');
      } else if (!ethToPkrRate || ethToPkrRate <= 0) {
        setEthPrice(undefined);
        setEthError('Live ETH/PKR rate not available. Please check your internet connection.');
      } else {
        setEthPrice(undefined);
        setEthError('Product price is invalid.');
      }
    }
  }, [product, ethToPkrRate]);

  useEffect(() => {
    if (!productId) return;
    setReviewsLoading(true);
    fetch(`/api/reviews/${productId}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setReviewsLoading(false);
      })
      .catch(() => setReviewsLoading(false));
  }, [productId]);

  useEffect(() => {
    fetch('/api/eth-price')
      .then(res => res.json())
      .then(data => {
        if (data && data.rate) {
          setEthToPkrRate(data.rate);
        } else {
          setEthError('Could not fetch ETH/PKR rate.');
        }
      })
      .catch(() => setEthError('Could not fetch ETH/PKR rate.'));
  }, []);
  
  const handleBuy = async () => {
    setBuyError('');
    setBuySuccess('');
    setBuying(true);
    try {
    if (!window.ethereum) {
        setBuyError('MetaMask is not installed.');
      setBuying(false);
      return;
    }
    if (!product || !product.store || !product.store.ownerAddress) {
        setBuyError('Store owner address not found.');
      setBuying(false);
      return;
    }
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const from = accounts[0];
      const to = product.store.ownerAddress;
      const valueInWei = (parseFloat(ethPrice) * 1e18).toString(16);
      
      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from, to, value: `0x${valueInWei}` }],
      });
      setHasBought(true);
      setBuySuccess('Purchase successful!');
    } catch (err) {
      setBuyError('Transaction failed or cancelled.');
    } finally {
      setBuying(false);
    }
  };

  const handlePostReview = () => {
    setReviewModalOpen(true);
    setReviewText('');
    setReviewRating(0);
    setReviewError('');
    setReviewImage(null);
    setReviewImagePreview(null);
  };

  const handleReviewImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewImage(reader.result);
        setReviewImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReviewSubmit = async () => {
    setReviewError('');
    if (!reviewText || !reviewRating) {
      setReviewError('Please enter review text and rating.');
      return;
    }
    setReviewLoading(true);
    try {
      const res = await fetch(`/api/reviews/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, review: { comment: reviewText, rating: reviewRating, image: reviewImage } })
      });
      if (!res.ok) throw new Error('Failed to post review');
      setReviews(prev => [
        { reviewer: 'You', rating: reviewRating, comment: reviewText, timestamp: new Date().toLocaleString(), verified: true, image: reviewImage },
        ...prev
      ]);
      setReviewModalOpen(false);
      setReviewImage(null);
      setReviewImagePreview(null);
    } catch (err) {
      setReviewError('Failed to post review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleBuyNowClick = () => {
    setShowBuyModal(true);
    setBuyerError('');
  };

  const handleBuyerInput = (e, { name, value }) => {
    setBuyerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePayNow = async () => {
    setBuyerError('');
    setOrderError('');
    if (!buyerInfo.name || !buyerInfo.address || !buyerInfo.phone) {
      setBuyerError('Please fill all fields.');
      return;
    }
    // Save order before transaction
    try {
      const wallet = window.ethereum && window.ethereum.selectedAddress ? window.ethereum.selectedAddress : '';
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: buyerInfo.name,
          address: buyerInfo.address,
          phone: buyerInfo.phone,
          productId,
          price: product && (product.price || product.pricePKR),
          wallet
        })
      });
      if (!res.ok) throw new Error('Order save failed');
    } catch (err) {
      setOrderError('Order could not be saved. Please try again.');
      return;
    }
    await handleBuy();
    setShowBuyModal(false);
    setBuyerInfo({ name: '', address: '', phone: '' });
  };

  const handleRespondClick = (reviewId) => {
    setRespondingReviewId(reviewId);
    setVendorResponseText('');
    setVendorResponseError('');
  };

  const handleVendorResponseSubmit = async () => {
    setVendorResponseError('');
    if (!vendorResponseText) {
      setVendorResponseError('Please enter a response.');
      return;
    }
    setVendorResponseLoading(true);
    try {
      const res = await fetch('/api/reviews/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: respondingReviewId, response: vendorResponseText })
      });
      if (!res.ok) throw new Error('Failed to post response');
      setReviews(prev => prev.map(r => r.reviewId === respondingReviewId ? { ...r, vendorResponse: vendorResponseText, responseTimestamp: new Date().toISOString() } : r));
      setRespondingReviewId(null);
      setVendorResponseText('');
    } catch (err) {
      setVendorResponseError('Failed to post response.');
    } finally {
      setVendorResponseLoading(false);
    }
  };

  return (
    <Layout>
      <div style={gradientBg}>
        {/* Remove animatedOverlay */}
        <Container style={{ maxWidth: 980, width: '100%', margin: '100px auto 40px auto', position: 'relative', zIndex: 1 }}>
          {loading ? (
            <Segment basic textAlign="center"><Loader active inline /> Loading product...</Segment>
          ) : error ? (
            <Message negative>
              <Message.Header>Error</Message.Header>
              <p>{error}</p>
            </Message>
          ) : (
            <div style={glassCardStyle}>
              {/* Product Image Section */}
              <div style={{ flex: 1, minWidth: 260, maxWidth: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
<<<<<<< HEAD
                {(Array.isArray(product.images) && product.images.length > 0) ? (
                  <>
                    <img
                      src={product.images[currentImage]}
                      alt={product.name}
                      style={zoomImageStyle}
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.18)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    {product.images.length > 1 && (
                      <>
                        {/* Left Arrow */}
                        <button
                          onClick={e => { e.stopPropagation(); setCurrentImage((currentImage - 1 + product.images.length) % product.images.length); }}
                          style={{
                            position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(30,30,30,0.25)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, transition: 'background 0.2s',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                            outline: 'none',
                            color: '#fff',
                            fontSize: 22,
                            opacity: 0.7
                          }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(30,30,30,0.45)'}
                          onMouseOut={e => e.currentTarget.style.background = 'rgba(30,30,30,0.25)'}
                          aria-label="Previous image"
                        >
                          &#8592;
                        </button>
                        {/* Right Arrow */}
                        <button
                          onClick={e => { e.stopPropagation(); setCurrentImage((currentImage + 1) % product.images.length); }}
                          style={{
                            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(30,30,30,0.25)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, transition: 'background 0.2s',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                            outline: 'none',
                            color: '#fff',
                            fontSize: 22,
                            opacity: 0.7
                          }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(30,30,30,0.45)'}
                          onMouseOut={e => e.currentTarget.style.background = 'rgba(30,30,30,0.25)'}
                          aria-label="Next image"
                        >
                          &#8594;
                        </button>
                      </>
                    )}
                  </>
                ) : product.image ? (
                  <img src={product.image} alt={product.name} style={zoomImageStyle} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.18)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                ) : null}
=======
                {(() => {
                  const candidates = [];
                  const pushIfString = (v) => { if (typeof v === 'string' && v.trim()) candidates.push(v); };
                  const addFromArrayField = (arrLike) => {
                    if (!arrLike) return;
                    const arr = Array.isArray(arrLike) ? arrLike : [arrLike];
                    for (const it of arr) {
                      if (typeof it === 'string') pushIfString(it);
                      else if (it && typeof it === 'object') pushIfString(it.url || it.secure_url || it.src || it.image || it.imageUrl || it.imageURL || it.image_url || it.path || it.dataUrl || it.base64 || it.data);
                    }
                  };
                  addFromArrayField(product.images);
                  addFromArrayField(product.pictures);
                  addFromArrayField(product.photos);
                  addFromArrayField(product.gallery);
                  addFromArrayField(product.media);
                  addFromArrayField(product.thumbnails);
                  for (const key of ['image', 'imageUrl', 'imageURL', 'image_url', 'thumbnail', 'photo', 'picture', 'img', 'url', 'cover', 'coverUrl']) pushIfString(product && product[key]);
                  const normalizeUrl = (u) => {
                    if (!u || typeof u !== 'string') return '';
                    const t = u.trim();
                    if (t.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${t.replace('ipfs://', '')}`;
                    if (/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[1-9A-HJ-NP-Za-km-z]{50,})$/.test(t)) return `https://ipfs.io/ipfs/${t}`;
                    return t;
                  };
                  const imgs = candidates.map(normalizeUrl);
                  const primary = (typeof currentImage === 'number' && imgs[currentImage]) ? imgs[currentImage] : (imgs[0]);
                  if (primary) {
                    return (
                      <>
                        <img
                          src={primary}
                          alt={product.name}
                          style={zoomImageStyle}
                          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.18)'}
                          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/340x340?text=No+Image'; }}
                        />
                        {imgs.length > 1 && (
                          <>
                            {/* Left Arrow */}
                            <button
                              onClick={e => { e.stopPropagation(); setCurrentImage((currentImage - 1 + imgs.length) % imgs.length); }}
                              style={{
                                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(30,30,30,0.25)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, transition: 'background 0.2s',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                                outline: 'none',
                                color: '#fff',
                                fontSize: 22,
                                opacity: 0.7
                              }}
                              onMouseOver={e => e.currentTarget.style.background = 'rgba(30,30,30,0.45)'}
                              onMouseOut={e => e.currentTarget.style.background = 'rgba(30,30,30,0.25)'}
                              aria-label="Previous image"
                            >
                              &#8592;
                            </button>
                            {/* Right Arrow */}
                            <button
                              onClick={e => { e.stopPropagation(); setCurrentImage((currentImage + 1) % imgs.length); }}
                              style={{
                                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(30,30,30,0.25)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, transition: 'background 0.2s',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                                outline: 'none',
                                color: '#fff',
                                fontSize: 22,
                                opacity: 0.7
                              }}
                              onMouseOver={e => e.currentTarget.style.background = 'rgba(30,30,30,0.45)'}
                              onMouseOut={e => e.currentTarget.style.background = 'rgba(30,30,30,0.25)'}
                              aria-label="Next image"
                            >
                              &#8594;
                            </button>
                          </>
                        )}
                      </>
                    );
                  }
                  return null;
                })()}
>>>>>>> 7e31841 (Initial project upload)
              </div>
              <div style={detailsStyle}>
                <Header as="h2" style={{ marginBottom: 0, color: '#fff' }}>
                  <Icon name="cube" /> {product.name}
                  <Header.Subheader style={{ marginTop: 8, color: '#b0b8c1' }}>
                    Category: {product.category}
                  </Header.Subheader>
                </Header>
                <Divider style={{ background: 'rgba(255,255,255,0.08)' }} />
                <Header as="h3" style={{ marginTop: 0, color: '#fff' }}>Product Details</Header>
                <p style={{ color: '#e0e7ef' }}><strong>Description:</strong> {product.description}</p>
                <p style={{ color: '#e0e7ef' }}><strong>Store:</strong> {product.store?.name || ''}</p>
                <p style={{ fontSize: 18, margin: '18px 0 0 0', color: '#fff' }}>
                  <strong>Price:</strong> 
                  {ethPrice ? <span style={{ color: '#4db8ff', fontWeight: 700 }}>{ethPrice} ETH</span> : ''}
                  <span style={{ color: '#b0b8c1', marginLeft: 12, fontWeight: 400 }}>
                    (PKR {(() => {
                      let pkr = parseFloat(product.price);
                      if (isNaN(pkr) || !isFinite(pkr) || pkr <= 0) {
                        pkr = parseFloat(product.pricePKR);
                      }
                      return pkr > 0 ? pkr.toLocaleString('en-PK', { maximumFractionDigits: 0 }) : '';
                    })()})
                  </span>
                </p>
                {ethError && <Message warning style={{ marginTop: 8 }}>{ethError}</Message>}
                <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                  <Button
                    color="green"
                    size="large"
                    style={{ borderRadius: 14, fontWeight: 600, boxShadow: '0 2px 8px rgba(44,62,80,0.10)' }}
                    onClick={handleBuyNowClick}
                    loading={buying || ethPrice === undefined}
                    disabled={buying || !ethPrice}
                  >
                    <Icon name="shopping cart" /> Buy Now
                  </Button>
                  <Button
                    color="blue"
                    size="large"
                    style={{ borderRadius: 14, fontWeight: 600, boxShadow: '0 2px 8px rgba(44,62,80,0.10)' }}
                    disabled={!hasBought}
                    onClick={handlePostReview}
                  >
                    <Icon name="star" /> Post a Review
                  </Button>
                </div>
                {buyError && <Message negative style={{ marginTop: 16 }}>{buyError}</Message>}
                {buySuccess && <Message positive style={{ marginTop: 16 }}>{buySuccess}</Message>}
                <Divider section style={{ margin: '40px 0 24px 0', background: 'rgba(255,255,255,0.08)' }} />
                <div>
                  <Header as="h3" style={{ marginBottom: 16, color: '#fff' }}>
                    <Icon name="star" color="yellow" /> Product Reviews
                    <Header.Subheader style={{ color: '#b0b8c1' }}>See what customers are saying about this product</Header.Subheader>
                  </Header>
                  {reviewsLoading ? (
                    <Loader active inline />
                  ) : (
                    <>
                      {reviews.length === 0 ? (
                        <Message info>No reviews yet. Be the first to review this product!</Message>
                      ) : (
                        <Comment.Group style={{ maxWidth: 700 }}>
                          <Header as="h4" style={averageRatingStyle}>Average Rating: <Rating icon='star' defaultRating={averageRating} maxRating={5} disabled /> ({averageRating})</Header>
                          {reviews.map((review, idx) => (
                            <Comment key={idx} style={{ marginBottom: 24 }}>
                              <Comment.Avatar as='a' src={`https://ui-avatars.com/api/?name=${review.reviewer || 'U'}&background=random`} />
                              <Comment.Content>
                                <Comment.Author as='span' style={reviewTextStyle}>{review.reviewer || 'Anonymous'}</Comment.Author>
                                <Comment.Metadata>
                                  <span style={reviewTextStyle}>{review.timestamp ? new Date(review.timestamp).toLocaleString() : ''}</span>
                                  {review.verified && (
                                    <span style={{ color: 'green', marginLeft: 8 }}><Icon name="check circle" /> Verified</span>
                                  )}
                                </Comment.Metadata>
                                <Comment.Text>
                                  <Rating icon='star' rating={review.rating} maxRating={5} disabled />
                                  <span style={reviewTextStyle}>{review.comment}</span>
                                  {review.image && <div><img src={review.image} alt="Review" style={{ marginTop: 10, maxWidth: 180, borderRadius: 8 }} /></div>}
                                </Comment.Text>
                                {review.vendorResponse && (
                                  <Comment.Group>
                                    <Comment>
                                      <Comment.Avatar as='a' src={`https://ui-avatars.com/api/?name=Vendor&background=blue&color=fff`} />
                                      <Comment.Content>
                                        <Comment.Author as='a' style={{ color: '#fff' }}>Vendor</Comment.Author>
                                        <Comment.Metadata>
                                          <span style={reviewTextStyle}>{review.responseTimestamp ? new Date(review.responseTimestamp).toLocaleString() : ''}</span>
                                        </Comment.Metadata>
                                        <Comment.Text style={reviewTextStyle}>{review.vendorResponse}</Comment.Text>
                                      </Comment.Content>
                                    </Comment>
                                  </Comment.Group>
                                )}
                                {isStoreOwner && !review.vendorResponse && (
                                  <Button size="mini" color="teal" onClick={() => handleRespondClick(review.reviewId)} style={{ marginTop: 8 }}>
                                    <Icon name="reply" /> Respond
                                  </Button>
                                )}
                              </Comment.Content>
                            </Comment>
                          ))}
                        </Comment.Group>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </Container>
      </div>
      <Modal open={showBuyModal} onClose={() => setShowBuyModal(false)} size="tiny">
        <Modal.Header>Enter Delivery Details</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Input
              label="Name"
              name="name"
              value={buyerInfo.name}
              onChange={handleBuyerInput}
              required
            />
            <Form.Input
              label="Address"
              name="address"
              value={buyerInfo.address}
              onChange={handleBuyerInput}
              required
            />
            <Form.Input
              label="Phone Number"
              name="phone"
              value={buyerInfo.phone}
              onChange={handleBuyerInput}
              required
            />
            {buyerError && <Message negative>{buyerError}</Message>}
            {orderError && <Message negative>{orderError}</Message>}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setShowBuyModal(false)}>
            Cancel
          </Button>
          <Button
            color="green"
            onClick={handlePayNow}
            disabled={!buyerInfo.name || !buyerInfo.address || !buyerInfo.phone || buying || !ethPrice}
            loading={buying}
          >
            <Icon name="ethereum" /> Pay Now
          </Button>
        </Modal.Actions>
      </Modal>
      <Modal open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} size="tiny">
        <Modal.Header>Post a Review</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field required>
              <label>Rating</label>
              <SURating icon='star' maxRating={5} rating={reviewRating} onRate={(_, data) => setReviewRating(data.rating)} />
            </Form.Field>
            <Form.Field required>
              <label>Review</label>
              <TextArea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Write your review..." style={{ minHeight: 80 }} />
            </Form.Field>
            <Form.Field>
              <label>Upload Image (optional)</label>
              <input type="file" accept="image/*" onChange={handleReviewImageChange} />
              {reviewImagePreview && <img src={reviewImagePreview} alt="Review Preview" style={{ marginTop: 10, maxWidth: 180, borderRadius: 8 }} />}
            </Form.Field>
            {reviewError && <Message negative>{reviewError}</Message>}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setReviewModalOpen(false)}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleReviewSubmit} loading={reviewLoading} disabled={reviewLoading || !reviewText || !reviewRating}>
            <Icon name="send" /> Submit Review
          </Button>
        </Modal.Actions>
      </Modal>
      <Modal open={!!respondingReviewId} onClose={() => setRespondingReviewId(null)} size="tiny">
        <Modal.Header>Vendor Response</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field required>
              <label>Response</label>
              <TextArea value={vendorResponseText} onChange={e => setVendorResponseText(e.target.value)} placeholder="Write your response..." style={{ minHeight: 60 }} />
            </Form.Field>
            {vendorResponseError && <Message negative>{vendorResponseError}</Message>}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setRespondingReviewId(null)}>
            Cancel
          </Button>
          <Button color="teal" onClick={handleVendorResponseSubmit} loading={vendorResponseLoading} disabled={vendorResponseLoading || !vendorResponseText}>
            <Icon name="send" /> Submit Response
          </Button>
        </Modal.Actions>
      </Modal>
    </Layout>
  );
};

export default ProductDetails; 