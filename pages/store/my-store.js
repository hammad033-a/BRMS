import React, { useState, useEffect } from 'react';
import { Container, Header, Segment, Message, Icon, Card, Grid, Button, Modal, Form, Input } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import MetaMaskManager from '../../components/MetaMaskManager';
import ReviewContract from '../../ethereum/ReviewContract';

const MyStore = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [storeOwner, setStoreOwner] = useState('');
  const [storeName, setStoreName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [changingName, setChangingName] = useState(false);
  const [storeLogo, setStoreLogo] = useState('');
  const [storeId, setStoreId] = useState('');

  useEffect(() => {
    // Check if MetaMask is connected
    const metamaskConnected = localStorage.getItem('metamaskConnected') === 'true';
    const userAddress = localStorage.getItem('userAddress');
    
    setIsMetaMaskConnected(metamaskConnected);
    setStoreOwner(userAddress || '');

    if (metamaskConnected && userAddress) {
      fetchStoreProducts(userAddress);
    }
    // Simulate fetching store name and logo (replace with real fetch if available)
    setStoreName('ANS'); // Replace with actual store name from backend
    setStoreLogo('/logo.png'); // Replace with actual logo if available
    setStoreId('store_1751721101361_58wr64s7o'); // Replace with actual store ID from backend/localStorage
  }, []);

  const fetchStoreProducts = async (ownerAddress) => {
    setIsLoading(true);
    setError('');

    try {
      const contract = new ReviewContract();
      const initialized = await contract.init();

      if (!initialized) {
        throw new Error('Failed to initialize contract');
      }

      // Get all products for the store owner
      const result = await contract.getStoreProducts(ownerAddress);
      setProducts(result);
    } catch (err) {
      console.error('Error fetching store products:', err);
      setError(err.message || 'Failed to fetch store products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    router.push('/store/add-product');
  };

  const handleChangeStoreName = async () => {
    setChangingName(true);
    try {
      // Update backend
      const res = await fetch(`/api/stores?id=${storeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeName: newStoreName })
      });
      const data = await res.json();
      if (res.ok) {
        setStoreName(newStoreName);
        setEditingName(false);
        setNewStoreName('');
      } else {
        alert(data.message || 'Failed to update store name');
      }
    } catch (err) {
      alert('Error updating store name');
    } finally {
      setChangingName(false);
    }
  };

  return (
    <Layout>
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', marginTop: '2em', position: 'relative' }}>
          {/* 3D Animated Store Logo */}
          <div style={{ marginBottom: '0.5em', transition: 'transform 0.5s cubic-bezier(.4,2,.6,1), box-shadow 0.5s', boxShadow: '0 8px 32px rgba(77,184,255,0.25)', borderRadius: '50%', background: '#fff', width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.13) rotateY(12deg)'; e.currentTarget.style.boxShadow = '0 24px 64px rgba(77,184,255,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(77,184,255,0.25)'; }}
          >
            {storeLogo ? (
              <img src={storeLogo} alt="Store Logo" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <Icon name="shop" size="huge" color="blue" />
            )}
          </div>
          {/* 3D Animated Store Name with Inline Edit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7em' }}>
            {editingName ? (
              <>
                <Input
                  value={newStoreName}
                  onChange={e => setNewStoreName(e.target.value)}
                  placeholder="Enter new store name"
                  size="large"
                  style={{ fontSize: '1.2em', minWidth: 180 }}
                  disabled={changingName}
                />
                <Button color="orange" size="small" loading={changingName} disabled={!newStoreName.trim() || changingName}
                  onClick={handleChangeStoreName}>
                  Change
                </Button>
                <Button icon="close" size="small" basic onClick={() => { setEditingName(false); setNewStoreName(storeName); }} />
              </>
            ) : (
              <Header as="h1" style={{ fontSize: '2.5em', color: '#1a237e', marginBottom: '0.2em', textAlign: 'center', textShadow: '0 4px 24px #4db8ff33', transition: 'transform 0.5s cubic-bezier(.4,2,.6,1)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.07) rotateY(-8deg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {storeName}
                <Button icon="edit" color="orange" size="tiny" style={{ marginLeft: 12 }} basic onClick={() => { setEditingName(true); setNewStoreName(storeName); }} />
        </Header>
            )}
          </div>
          {/* Action Buttons Top Right */}
          <div style={{ position: 'absolute', right: 0, top: 0, display: 'flex', flexDirection: 'row', gap: '1em', marginTop: '1.5em', marginRight: '2em' }}>
            <Button color="green" onClick={handleAddProduct}><Icon name="add" /> Add Product</Button>
            <Button color="blue"><Icon name="image" /> Change Logo</Button>
            {/* Remove Change Store Name button from here */}
            <Button color="red"><Icon name="trash" /> Delete Store</Button>
          </div>
        </div>
        <Segment raised style={{ maxWidth: '800px', margin: '2em auto', padding: '2em' }}>
          <MetaMaskManager />
          
          {!isMetaMaskConnected && (
            <Message warning>
              <Message.Header>MetaMask Required</Message.Header>
              <p>Please connect your MetaMask wallet to view your store.</p>
            </Message>
          )}

          {error && (
            <Message negative>
              <Message.Header>Error</Message.Header>
              <p>{error}</p>
            </Message>
          )}

          {isMetaMaskConnected && (
            <div>
              <Header as="h2" style={{ marginTop: '1em' }}>
                Store Owner: {storeOwner}
              </Header>

              {/* The Add Product button is now in the top right */}
              {/* <Button
                color="green"
                onClick={handleAddProduct}
                style={{ marginBottom: '1em' }}
              >
                <Icon name="add" />
                Add New Product
              </Button> */}

              <Header as="h3" dividing>
                My Products
              </Header>

              {isLoading ? (
                <Message info>
                  <Message.Header>Loading Products</Message.Header>
                  <p>Please wait while we fetch your products...</p>
                </Message>
              ) : products.length === 0 ? (
                <Message info>
                  <Message.Header>No Products Found</Message.Header>
                  <p>You haven't added any products yet. Click the "Add New Product" button to get started.</p>
                </Message>
              ) : (
                <Grid columns={3} stackable>
                  {products.map((product) => (
                    <Grid.Column key={product.id}>
                      <Card>
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        )}
                        <Card.Content>
                          <Card.Header>{product.name}</Card.Header>
                          <Card.Meta>{product.category}</Card.Meta>
                          <Card.Description>
                            {product.description}
                          </Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                          <Icon name="ethereum" />
                          {product.price} ETH
                        </Card.Content>
                      </Card>
                    </Grid.Column>
                  ))}
                </Grid>
              )}
            </div>
          )}
        </Segment>
        {/* Remove Change Store Name Modal */}
      </Container>
    </Layout>
  );
};

export default MyStore; 