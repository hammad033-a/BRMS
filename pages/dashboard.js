import React, { useState, useEffect } from 'react';
import { Container, Header, Card, Grid, Statistic, Search, Input, Message, Button, Icon, Segment } from 'semantic-ui-react';
import Link from 'next/link';
import Layout from '../components/Layout';
import MetaMaskManager from '../components/MetaMaskManager';
import { useRouter } from 'next/router';

const ETH_TO_PKR = 800000;

const fetchStoresFromAPI = async () => {
  const res = await fetch('/api/stores');
  if (!res.ok) throw new Error('Failed to fetch stores');
  return await res.json();
};

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [stores, setStores] = useState([]);
  const router = useRouter();
  const [ethToPkrRate, setEthToPkrRate] = useState(null);

  useEffect(() => {
    const metamaskConnected = localStorage.getItem('metamaskConnected') === 'true';
    setIsMetaMaskConnected(metamaskConnected);
    // Load stores from API
    fetchStoresFromAPI()
      .then(setStores)
      .catch(() => setStores([]));
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=pkr')
      .then(res => res.json())
      .then(data => {
        if (data && data.ethereum && data.ethereum.pkr) setEthToPkrRate(data.ethereum.pkr);
      });
  }, []);

  const allProducts = stores.flatMap(store =>
    (Array.isArray(store.products) ? store.products : []).map(product => ({ ...product, _store: store }))
  );

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === '') {
      setFilteredProducts([]);
      return;
    }
    const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query)) ||
      (product._store && product._store.storeName && product._store.storeName.toLowerCase().includes(query))
    );
    setFilteredProducts(filtered);
  };

  const handleStoreClick = (storeId) => {
    router.push(`/store/${storeId}/products`);
  };

  if (!isMetaMaskConnected) {
    return (
      <Layout>
        <Container>
          <Message warning>
            <Message.Header>Please Connect MetaMask</Message.Header>
            <p>You need to connect your MetaMask wallet to access the dashboard.</p>
            <Button primary as="a" href="/login">
              <Icon name="ethereum" />
              Connect MetaMask
            </Button>
          </Message>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2em', marginBottom: '2em' }}>
          <Button color="orange" size="large" onClick={() => router.push('/store/register')}>
            <Icon name="add" /> Register a Store
          </Button>
        </div>
        <Segment style={{ 
          padding: '3em 0em',
          marginBottom: '2em',
          background: 'linear-gradient(135deg, #0f9d58 0%, #1a237e 100%)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)'
        }}>
          <Header as="h1" style={{ fontSize: '2.7em', color: 'white', textAlign: 'center', marginBottom: '1.5em' }}>
                  Welcome to Your Dashboard
                </Header>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto', maxWidth: 500 }}>
            <Input
              icon={{ name: 'search', circular: true, link: true }}
              iconPosition="left"
              placeholder="Search products or stores..."
              value={searchQuery}
              onChange={e => handleSearch(e)}
              size="large"
              fluid
              style={{ borderRadius: 30, padding: '0.8em 1.2em 0.8em 2.8em', fontSize: '1.2em', width: '100%', background: '#fff' }}
            />
          </div>
        </Segment>
        <Grid>
          <Grid.Row>
            {searchQuery ? (
              <>
                <Grid.Column width={16}>
                  <Header as="h2" style={{ color: '#fff', marginTop: '1em', letterSpacing: 1, textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
                    Search Results
                  </Header>
                </Grid.Column>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '2.5em', width: '100%' }}>
                  {/* Show matching stores */}
                  {stores.filter(store =>
                    store.storeName.toLowerCase().includes(searchQuery) ||
                    (store.description && store.description.toLowerCase().includes(searchQuery)) ||
                    (store.address && store.address.toLowerCase().includes(searchQuery))
                  ).map(store => (
                    <Card key={store._id}
                      style={{
                        minWidth: 300,
                        maxWidth: 350,
                        cursor: 'pointer',
                        background: 'rgba(0,0,0,0.65)',
                        color: '#fff',
                        borderRadius: 28,
                        margin: '1.5em 0',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                        backdropFilter: 'blur(6px)',
                        border: '2px solid rgba(255,255,255,0.10)',
                        transition: 'transform 0.45s cubic-bezier(.4,2,.6,1), box-shadow 0.45s, border 0.45s',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                      onClick={() => handleStoreClick(store._id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1em 0 0.5em 0' }}>
                        {store.logo ? (
                          <img src={store.logo} alt={store.storeName} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                          <Icon name="shop" size="huge" style={{ color: '#fff' }} />
                        )}
                      </div>
                      <Card.Content>
                        <Card.Header style={{ textAlign: 'center', color: '#fff' }}>{store.storeName}</Card.Header>
                        <Card.Description style={{ textAlign: 'center', color: '#fff' }}>{store.description}</Card.Description>
                        <Card.Meta style={{ textAlign: 'center', color: '#fff' }}>{store.address}</Card.Meta>
                      </Card.Content>
                    </Card>
                  ))}
                  {/* Show matching products */}
                  {allProducts.filter(product =>
                    product.name.toLowerCase().includes(searchQuery) ||
                    (product.description && product.description.toLowerCase().includes(searchQuery))
                  ).map(product => (
                    <Card key={product._id || product.id}
                      style={{
                        minWidth: 300,
                        maxWidth: 350,
                        cursor: 'pointer',
                        background: 'rgba(0,0,0,0.65)',
                        color: '#fff',
                        borderRadius: 28,
                        margin: '1.5em 0',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                        backdropFilter: 'blur(6px)',
                        border: '2px solid rgba(255,255,255,0.10)',
                        transition: 'transform 0.45s cubic-bezier(.4,2,.6,1), box-shadow 0.45s, border 0.45s',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                      onClick={() => router.push(`/products/${product._id}`)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1em 0 0.5em 0' }}>
                        {product.image ? (
                          <img src={product.image} alt={product.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                          <Icon name="cube" size="huge" style={{ color: '#fff' }} />
                        )}
                      </div>
                      <Card.Content>
                        <Card.Header style={{ textAlign: 'center', color: '#fff' }}>{product.name}</Card.Header>
                        <Card.Description style={{ textAlign: 'center', color: '#fff' }}>{product.description}</Card.Description>
                        <Card.Meta style={{ textAlign: 'center', color: '#fff' }}>
                          {product.price ? `PKR ${parseFloat(product.price).toLocaleString('en-PK', { maximumFractionDigits: 0 })}` : ''}
                        </Card.Meta>
                      </Card.Content>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <>
                <Grid.Column width={16}>
                  {/* Removed 'Featured Products' text for a cleaner look */}
                </Grid.Column>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '2.5em', width: '100%' }}>
                  {stores.length === 0 ? (
                    <Header as="h3" style={{ color: 'white', textAlign: 'center' }}>
                      No stores found.
                    </Header>
                  ) : (
                    stores.map((store) => (
                      <Card
                        key={store._id}
                        style={{
                          minWidth: 300,
                          maxWidth: 350,
                          cursor: 'pointer',
                          borderRadius: 28,
                          margin: '1.5em 0',
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 60%, rgba(30,136,229,0.13) 100%)',
                          boxShadow: '0 8px 32px rgba(30,136,229,0.13)',
                          backdropFilter: 'blur(8px)',
                          border: '2px solid rgba(30,136,229,0.10)',
                          transition: 'transform 0.45s cubic-bezier(.4,2,.6,1), box-shadow 0.45s, border 0.45s',
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                        onClick={() => handleStoreClick(store._id)}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'scale(1.06) rotateY(2deg)';
                          e.currentTarget.style.boxShadow = '0 16px 48px 0 rgba(30,136,229,0.22)';
                          e.currentTarget.style.border = '2.5px solid #00c6ff';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'scale(1) rotateY(0deg)';
                          e.currentTarget.style.boxShadow = '0 8px 32px rgba(30,136,229,0.13)';
                          e.currentTarget.style.border = '2px solid rgba(30,136,229,0.10)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2em 0 1.2em 0' }}>
                          <div style={{
                            background: 'conic-gradient(from 180deg at 50% 50%, #00c6ff 0%, #0072ff 100%)',
                            borderRadius: '50%',
                            padding: 5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 16px 0 rgba(0,198,255,0.13)',
                          }}>
                            {store.logo ? (
                              <img
                                src={store.logo}
                                alt={store.storeName}
                                style={{
                                  width: 90,
                                  height: 90,
                                  objectFit: 'cover',
                                  borderRadius: '50%',
                                  boxShadow: '0 2px 12px rgba(26,35,126,0.13)',
                                  background: 'rgba(255,255,255,0.85)',
                                  transition: 'transform 0.4s cubic-bezier(.4,2,.6,1), box-shadow 0.4s',
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.transform = 'scale(1.13) rotateZ(-3deg)';
                                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,198,255,0.18)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.transform = 'scale(1) rotateZ(0deg)';
                                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(26,35,126,0.13)';
                                }}
                              />
                            ) : (
                              <Icon name="shop" size="huge" style={{ color: '#1a237e' }} />
                            )}
                          </div>
                        </div>
                        <Card.Content>
                          <Card.Header style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.45em', color: '#232946', letterSpacing: 1 }}>{store.storeName}</Card.Header>
                          <Card.Description style={{ textAlign: 'center', color: '#222', fontSize: '1.12em', margin: '0.7em 0', fontWeight: 500 }}>{store.description}</Card.Description>
                          <Card.Meta style={{ textAlign: 'center', color: '#232323', fontSize: '1.04em', fontWeight: 600 }}>{store.address}</Card.Meta>
                        </Card.Content>
                      </Card>
                    ))
                  )}
                </div>
              </>
            )}
          </Grid.Row>
        </Grid>
      </Container>
    </Layout>
  );
};

export default Dashboard; 