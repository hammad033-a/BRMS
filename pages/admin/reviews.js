import React, { useState, useEffect } from 'react';
import { Container, Header, Segment, Message, Icon, Grid, Button, Table, Input, Label, Modal } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import MetaMaskManager from '../../components/MetaMaskManager';
import { getWeb3 } from '../../ethereum/web3';
import { getReviewContract } from '../../ethereum/review_contract';

const AdminReviews = () => {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState({ open: false, type: '', review: null });
  const [successMsg, setSuccessMsg] = useState('');
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        try {
            const metamaskConnected = localStorage.getItem('metamaskConnected') === 'true';
            setIsMetaMaskConnected(metamaskConnected);

            if (metamaskConnected) {
                const web3 = await getWeb3();
                const accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]);
                const reviewContract = await getReviewContract();
                const reviewCount = await reviewContract.methods.getReviewCount().call();
                
                const fetchedReviews = [];
                for (let i = 0; i < reviewCount; i++) {
                    const review = await reviewContract.methods.allReviews(i).call();
                    fetchedReviews.push({
                        id: review.id,
                        productName: `Product ${review.productId}`, // Mock name, replace with real if available
                        storeName: `Store ${review.store}`, // Mock name, replace with real if available
                        reviewer: review.reviewer,
                        rating: parseInt(review.rating),
                        text: review.comment,
                        status: review.status.toString(), // 0: Active, 1: Flagged, 2: Resolved
                        createdAt: new Date(review.timestamp * 1000).toLocaleDateString(),
                    });
                }
                setReviews(fetchedReviews);
            }
        } catch (error) {
            console.error("Failed to load reviews:", error);
        }
        setLoading(false);
    };
    loadData();
  }, []);

  const handleResolveReview = async (reviewId, newStatus) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/resolve-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: parseInt(reviewId), newStatus: parseInt(newStatus) }),
      });

      if (response.ok) {
        setReviews(reviews.map(r => (r.id === reviewId ? { ...r, status: newStatus.toString() } : r)));
        setSuccessMsg(`Review ${reviewId} has been resolved.`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error resolving review:", error);
      alert("An error occurred while resolving the review.");
    }
    setLoading(false);
    closeModal();
     setTimeout(() => setSuccessMsg(''), 2000);
  };
  
  const handleSearch = (e) => setSearchQuery(e.target.value);

  const getStatusText = (status) => {
    switch (status) {
        case '0': return 'Active';
        case '1': return 'Flagged';
        case '2': return 'Resolved';
        default: return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '0': return 'green';
      case '1': return 'red';
      case '2': return 'grey';
      default: return 'grey';
    }
  };
  const getRatingColor = (rating) => {
    if (rating >= 4) return 'green';
    if (rating >= 3) return 'yellow';
    return 'red';
  };
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon key={i} name="star" color={i <= rating ? "yellow" : "grey"} size="small" />
      );
    }
    return stars;
  };

  const allReviewsFiltered = reviews.filter(review =>
    review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.text.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const flaggedReviews = allReviewsFiltered.filter(r => r.status === '1');

  // Action handlers
  const handleView = (review) => setModal({ open: true, type: 'view', review });
  const handleResolve = (review) => setModal({ open: true, type: 'resolve', review });

  const confirmAction = () => {
    if (modal.type === 'resolve') {
        // This is handled by handleResolveReview
    }
    setModal({ open: false, type: '', review: null });
  };

  const closeModal = () => setModal({ open: false, type: '', review: null });

  return (
    <Layout>
      <Container>
        <Header as="h1" textAlign="center" style={{ marginTop: '2em' }}>
          <Icon name="star" />
          Manage Reviews
        </Header>
        <Segment raised style={{ maxWidth: '1400px', margin: '2em auto', padding: '2em' }}>
          <MetaMaskManager />
          {!isMetaMaskConnected && (
            <Message warning>
              <Message.Header>MetaMask Required</Message.Header>
              <p>Please connect your MetaMask wallet to access the admin panel.</p>
            </Message>
          )}
          {successMsg && (
            <Message positive>
              <Message.Header>Success</Message.Header>
              <p>{successMsg}</p>
            </Message>
          )}
          {isMetaMaskConnected && !loading &&(
            <div>

              {/* Flagged Reviews Section */}
              <Header as="h3" color="red">
                <Icon name="flag" />
                Flagged Reviews ({flaggedReviews.length})
              </Header>
              <div style={{ overflowX: 'auto', marginBottom: '3em' }}>
                <Table celled stackable compact>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Product</Table.HeaderCell>
                      <Table.HeaderCell>Reviewer</Table.HeaderCell>
                      <Table.HeaderCell>Review</Table.HeaderCell>
                      <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {flaggedReviews.map((review) => (
                      <Table.Row key={review.id} error>
                        <Table.Cell><strong>{review.productName}</strong></Table.Cell>
                        <Table.Cell><code>{review.reviewer.substring(0, 10)}...</code></Table.Cell>
                        <Table.Cell>{review.text}</Table.Cell>
                        <Table.Cell>
                          <Button.Group>
                            <Button icon="check" content="Approve" color="green" onClick={() => handleResolveReview(review.id, 0)} />
                            <Button icon="archive" content="Resolve" color="grey" onClick={() => handleResolveReview(review.id, 2)} />
                          </Button.Group>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>


              <Grid columns={2} style={{ marginBottom: '2em' }}>
                <Grid.Column>
                  <Header as="h3">
                    <Icon name="star" />
                    All Reviews ({allReviewsFiltered.length})
                  </Header>
                </Grid.Column>
                <Grid.Column>
                  <Input
                    icon="search"
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={handleSearch}
                    fluid
                  />
                </Grid.Column>
              </Grid>
              <div style={{ overflowX: 'auto' }}>
                <Table celled stackable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Product</Table.HeaderCell>
                      <Table.HeaderCell>Store</Table.HeaderCell>
                      <Table.HeaderCell>Reviewer</Table.HeaderCell>
                      <Table.HeaderCell>Rating</Table.HeaderCell>
                      <Table.HeaderCell>Review</Table.HeaderCell>
                      <Table.HeaderCell>Status</Table.HeaderCell>
                      <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {allReviewsFiltered.map((review) => (
                      <Table.Row key={review.id} positive={review.status === '0'} warning={review.status === '1'} disabled={review.status === '2'}>
                        <Table.Cell>
                          <strong>{review.productName}</strong>
                          <br />
                          <small>{review.createdAt}</small>
                        </Table.Cell>
                        <Table.Cell>
                          <Icon name="shop" /> {review.storeName}
                        </Table.Cell>
                        <Table.Cell>
                          <code style={{ fontSize: '0.8em' }}>
                            {review.reviewer.substring(0, 10)}...{review.reviewer.substring(review.reviewer.length - 8)}
                          </code>
                        </Table.Cell>
                        <Table.Cell>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {renderStars(review.rating)}
                            <Label color={getRatingColor(review.rating)} style={{ marginLeft: '0.5em' }}>
                              {review.rating}/5
                            </Label>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div style={{ maxWidth: '300px' }}>
                            <p style={{ fontSize: '0.9em', lineHeight: '1.4' }}>
                              {review.text}
                            </p>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Label color={getStatusColor(review.status)}>{getStatusText(review.status)}</Label>
                        </Table.Cell>
                        <Table.Cell>
                          <Button.Group vertical size="tiny">
                            <Button icon="eye" content="View" onClick={() => handleView(review)} />
                            <Button icon="flag" content="Flag" color="red" onClick={() => handleResolveReview(review.id, 1)} disabled={review.status === '1'}/>
                          </Button.Group>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
              <div style={{ marginTop: '2em', textAlign: 'center' }}>
                <Button color="blue" size="large" onClick={() => router.push('/admin/dashboard')}>
                  <Icon name="arrow left" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          )}
        </Segment>
        {/* Modal for actions */}
        <Modal open={modal.open} onClose={closeModal} size="tiny">
          <Modal.Header>
            {modal.type === 'view' && 'Review Details'}
            {modal.type === 'resolve' && 'Resolve Flagged Review'}
          </Modal.Header>
          <Modal.Content>
            {modal.type === 'resolve' && (
              <p>Choose an action for the flagged review for <b>{modal.review?.productName}</b>.</p>
            )}
            {modal.type === 'view' && modal.review && (
              <div>
                <p><b>Product:</b> {modal.review.productName}</p>
                <p><b>Store:</b> {modal.review.storeName}</p>
                <p><b>Reviewer:</b> {modal.review.reviewer}</p>
                <p><b>Rating:</b> {modal.review.rating}</p>
                <p><b>Status:</b> {getStatusText(modal.review.status)}</p>
                <p><b>Created:</b> {modal.review.createdAt}</p>
                <p><b>Review:</b> {modal.review.text}</p>
              </div>
            )}
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={closeModal}>Cancel</Button>
            {modal.type === 'resolve' && (
              <>
                <Button color='green' onClick={() => handleResolveReview(modal.review.id, 0)}>
                  <Icon name='check' /> Approve (Mark as Active)
                </Button>
                 <Button color='grey' onClick={() => handleResolveReview(modal.review.id, 2)}>
                  <Icon name='archive' /> Mark as Resolved
                </Button>
              </>
            )}
          </Modal.Actions>
        </Modal>
      </Container>
    </Layout>
  );
};

export default AdminReviews; 