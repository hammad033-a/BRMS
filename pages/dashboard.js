<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
=======
import React, { useState, useEffect, useRef } from 'react';
>>>>>>> 7e31841 (Initial project upload)
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
<<<<<<< HEAD
=======
  const heroRef = useRef(null);
  const contentRef = useRef(null);
>>>>>>> 7e31841 (Initial project upload)

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

<<<<<<< HEAD
  const allProducts = stores.flatMap(store =>
=======
  const handleTilt = (e) => {
    if (!heroRef.current || !contentRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 10; // -5deg to 5deg
    const rotateX = (0.5 - y) * 10; // -5deg to 5deg
    contentRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const resetTilt = () => {
    if (!contentRef.current) return;
    contentRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  };

  // Show all stores (previously skipped first two, which hid all when DB had <=2)
  const visibleStores = stores;
  const allProducts = visibleStores.flatMap(store =>
>>>>>>> 7e31841 (Initial project upload)
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
<<<<<<< HEAD
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
=======
        <Segment
          onMouseMove={handleTilt}
          onMouseLeave={resetTilt}
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '3.5em 0em',
            marginBottom: '2em',
            background: 'radial-gradient(1200px 600px at 10% -20%, rgba(0, 200, 255, 0.25) 0%, rgba(0,0,0,0) 60%), radial-gradient(1200px 600px at 110% 120%, rgba(0, 114, 255, 0.25) 0%, rgba(0,0,0,0) 60%), linear-gradient(135deg, #0b1026 0%, #0a1a2f 50%, #081a3a 100%)',
            borderRadius: '24px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
          ref={heroRef}
        >
          {/* 3D animated orbs */}
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(80px 80px at 20% 30%, rgba(0,198,255,0.8), rgba(0,198,255,0) 60%), radial-gradient(100px 100px at 80% 70%, rgba(0,114,255,0.8), rgba(0,114,255,0) 60%)',
            filter: 'blur(30px)',
            transform: 'translateZ(0)',
            animation: 'float-bubbles 10s ease-in-out infinite'
          }} />

          {/* Content with tilt effect */}
          <div ref={contentRef} style={{ transition: 'transform 300ms ease' }}>
            <Header as="h1" style={{ fontSize: '2.7em', color: 'white', textAlign: 'center', marginBottom: '1.5em', textShadow: '0 6px 24px rgba(0,0,0,0.35)' }}>
              Welcome to Your Dashboard
            </Header>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto', maxWidth: 600 }}>
              <Input
                icon={{ name: 'search', circular: true, link: true }}
                iconPosition="left"
                placeholder="Search products or stores..."
                value={searchQuery}
                onChange={e => handleSearch(e)}
                size="large"
                fluid
                style={{ borderRadius: 30, padding: '0.8em 1.2em 0.8em 2.8em', fontSize: '1.2em', width: '100%', background: 'rgba(255,255,255,0.98)' }}
              />
            </div>
          </div>

          {/* Keyframes via inline style tag */}
          <style jsx>{`
            @keyframes float-bubbles {
              0% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-12px) scale(1.02); }
              100% { transform: translateY(0px) scale(1); }
            }
          `}</style>
>>>>>>> 7e31841 (Initial project upload)
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
<<<<<<< HEAD
                  {stores.filter(store =>
=======
                  {visibleStores.filter(store =>
>>>>>>> 7e31841 (Initial project upload)
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
<<<<<<< HEAD
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1em 0 0.5em 0' }}>
                        {product.image ? (
                          <img src={product.image} alt={product.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                          <Icon name="cube" size="huge" style={{ color: '#fff' }} />
                        )}
=======
                      <div style={{ width: '100%', height: 220, overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
                        {(() => {
                          // Robustly determine an image URL from various possible shapes
                          const candidates = [];
                          const pushIfString = (v) => { if (typeof v === 'string' && v.trim()) candidates.push(v); };
                          // helper to pull from array-like fields of objects or strings
                          const addFromArrayField = (arrLike) => {
                            if (!arrLike) return;
                            const arr = Array.isArray(arrLike) ? arrLike : [arrLike];
                            for (const it of arr) {
                              if (typeof it === 'string') {
                                pushIfString(it);
                              } else if (it && typeof it === 'object') {
                                pushIfString(
                                  it.url || it.secure_url || it.src || it.image || it.imageUrl || it.imageURL || it.image_url || it.path || it.dataUrl || it.base64 || it.data
                                );
                              }
                            }
                          };
                          // images can be an array of strings or objects
                          addFromArrayField(product.images);
                          // Also check other common array keys used by various uploaders
                          addFromArrayField(product.pictures);
                          addFromArrayField(product.photos);
                          addFromArrayField(product.gallery);
                          addFromArrayField(product.media);
                          addFromArrayField(product.thumbnails);
                          // Also check common singular fields
                          for (const key of ['image', 'imageUrl', 'imageURL', 'image_url', 'thumbnail', 'photo', 'picture', 'img', 'url', 'cover', 'coverUrl', 'productImage', 'product_image', 'productPicture']) {
                            pushIfString(product && product[key]);
                          }
                          const normalizeUrl = (u) => {
                            if (!u || typeof u !== 'string') return '';
                            const t = u.trim();
                            if (t.startsWith('ipfs://')) {
                              return `https://ipfs.io/ipfs/${t.replace('ipfs://', '')}`;
                            }
                            // bare CID (Qm... or bafy...)
                            if (/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[1-9A-HJ-NP-Za-km-z]{50,})$/.test(t)) {
                              return `https://ipfs.io/ipfs/${t}`;
                            }
                            return t;
                          };
                          const imgSrcRaw = candidates[0];
                          const imgSrc = normalizeUrl(imgSrcRaw);
                          const placeholder = `https://via.placeholder.com/350x220?text=${encodeURIComponent((product.name || 'No Image').slice(0,20))}`;
                          return (
                            <img
                              src={imgSrc || placeholder}
                              alt={product.name}
                              style={{ width: '100%', height: 220, objectFit: 'cover' }}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = placeholder;
                              }}
                            />
                          );
                        })()}
>>>>>>> 7e31841 (Initial project upload)
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
<<<<<<< HEAD
                  {stores.length === 0 ? (
=======
                  {visibleStores.length === 0 ? (
>>>>>>> 7e31841 (Initial project upload)
                    <Header as="h3" style={{ color: 'white', textAlign: 'center' }}>
                      No stores found.
                    </Header>
                  ) : (
<<<<<<< HEAD
                    stores.map((store) => (
=======
                    visibleStores.map((store) => (
>>>>>>> 7e31841 (Initial project upload)
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