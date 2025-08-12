import React, { useState, useEffect } from 'react';
import { Container, Header, Segment, Message, Icon, Card, Grid, Button, Image } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import MetaMaskManager from '../../../components/MetaMaskManager';
import { motion } from 'framer-motion';

const fetchProductsFromAPI = async (storeId) => {
  const res = await fetch(`/api/products?storeId=${storeId}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return await res.json();
};

const fetchStoreFromAPI = async (storeId) => {
  const res = await fetch(`/api/stores?id=${storeId}`);
  if (!res.ok) throw new Error('Failed to fetch store');
  return await res.json();
};

const StoreProducts = () => {
  const router = useRouter();
  const { storeId } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [ethToPkrRate, setEthToPkrRate] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !storeId) return;
    const metamaskConnected = localStorage.getItem('metamaskConnected') === 'true';
    setIsMetaMaskConnected(metamaskConnected);
    if (storeId && metamaskConnected) {
      fetchStoreData();
      fetchStoreFromAPI(storeId)
        .then(setStore)
        .catch(() => setStore(null));
    }
  }, [storeId]);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=pkr')
      .then(res => res.json())
      .then(data => {
        if (data && data.ethereum && data.ethereum.pkr) setEthToPkrRate(data.ethereum.pkr);
      });
  }, []);

  const fetchStoreData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch products for this store
      const products = await fetchProductsFromAPI(storeId);
      setProducts(products);
    } catch (err) {
      setError('Failed to load products from server.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    router.push(`/store/${storeId}/add-product`);
  };

  const handleEditProduct = (productId) => {
    router.push(`/store/${storeId}/edit-product/${productId}`);
  };

  const handleViewProduct = (productId) => {
    router.push(`/products/${productId}`);
  };

  if (!storeId) {
    return (
      <Layout>
        <Container>
          <Message negative>
            <Message.Header>Store ID Required</Message.Header>
            <p>Please provide a valid store ID.</p>
          </Message>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Header as="h1" textAlign="center" style={{ marginTop: '2em', color: 'white' }}>
          <Icon name="shop" />
          Store Management
        </Header>

        <Segment raised style={{ maxWidth: '1200px', margin: '2em auto', padding: '2em', background: 'rgba(30,30,30,0.45)', borderRadius: '18px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', border: '1.5px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          {/* Remove the Disconnect MetaMask button and MetaMaskManager component */}
          {!isMetaMaskConnected && (
            <Message warning>
              <Message.Header>MetaMask Required</Message.Header>
              <p>Please connect your MetaMask wallet to manage your store.</p>
            </Message>
          )}
          {error && (
            <Message negative>
              <Message.Header>Error</Message.Header>
              <p>{error}</p>
            </Message>
          )}
          {isMetaMaskConnected && store && (
            <div>
              {/* Store Information */}
              <Grid columns={2} stackable style={{
                marginBottom: '2em',
                alignItems: 'center',
                background: 'rgba(30,30,30,0.45)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                border: '1.5px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '2em'
              }}>
                <Grid.Column>
                  <Header as="h2" style={{ fontSize: '2.2em', color: 'white', marginBottom: '0.5em', display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      style={{ display: 'inline-block' }}
                    >
                      <Icon name="shop" size="big" color="blue" />
                    </motion.span>
                    {store.storeName}
                  </Header>
                  <p style={{ fontWeight: 'bold', color: '#eee' }}><Icon name="user" />Owner: <span style={{ color: '#fff' }}>{store.ownerName}</span></p>
                  <p style={{ fontWeight: 'bold', color: '#eee' }}><Icon name="mail" />Email: <span style={{ color: '#fff' }}>{store.email}</span></p>
                  <p style={{ fontWeight: 'bold', color: '#eee' }}><Icon name="map marker alternate" />Address: <span style={{ color: '#fff' }}>{store.address}</span></p>
                  <p style={{ fontWeight: 'bold', color: '#eee' }}><Icon name="info circle" />Description: <span style={{ color: '#fff' }}>{store.description}</span></p>
                </Grid.Column>
                <Grid.Column>
                  {store.logo && (
                    <motion.img
                      src={store.logo}
                      alt={store.storeName}
                      style={{ width: '220px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
                      initial={{ scale: 0.9, opacity: 0.7 }}
                      animate={{ scale: [0.9, 1.05, 1], opacity: [0.7, 1, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
                    />
                  )}
                </Grid.Column>
              </Grid>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2em' }}>
                <Header as="h3">
                  Products ({products.length})
                </Header>
                {/* Remove the Add New Product button from the store's product page */}
              </div>
              {isLoading ? (
                <Message info>
                  <Message.Header>Loading Products</Message.Header>
                  <p>Please wait while we fetch your products...</p>
                </Message>
              ) : products.length === 0 ? (
                <Message info>
                  <Message.Header>No Products Found</Message.Header>
                  <p>You haven't added any products to this store yet. Click "Add New Product" to get started.</p>
                </Message>
              ) : (
                <Grid columns={3} stackable>
                  {products.map((product, idx) => (
                    <Grid.Column key={product._id || product.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08, type: 'spring', stiffness: 120 }}
                        whileHover={{ scale: 1.07, rotate: 2, boxShadow: '0 12px 32px rgba(0,0,0,0.18)' }}
                        style={{
                          borderRadius: 20,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                          background: 'rgba(30,30,30,0.35)',
                          border: '1.2px solid rgba(255,255,255,0.07)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          padding: 0,
                          marginBottom: '2em'
                        }}
                      >
                        <Card
                          key={product._id || product.id}
                          as="a"
                          href={`/products/${product._id ? product._id.toString() : product.id}`}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: 'none',
                            margin: 0,
                            background: 'transparent'
                          }}
                        >
<<<<<<< HEAD
                          {(Array.isArray(product.images) && product.images.length > 0) ? (
                            <motion.img
                              src={product.images[0]}
                              alt={product.name}
                              style={{ width: '100%', height: 220, objectFit: 'cover', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
                              whileHover={{ scale: 1.04 }}
                              transition={{ type: 'spring', stiffness: 200 }}
                            />
                          ) : product.image ? (
                            <motion.img
                              src={product.image}
                              alt={product.name}
                              style={{ width: '100%', height: 220, objectFit: 'cover', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
                              whileHover={{ scale: 1.04 }}
                              transition={{ type: 'spring', stiffness: 200 }}
                            />
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
                            const imgSrc = normalizeUrl(candidates[0]);
                            const placeholder = `https://via.placeholder.com/350x220?text=${encodeURIComponent((product.name || 'No Image').slice(0,20))}`;
                            return (
                              <motion.img
                                src={imgSrc || placeholder}
                                alt={product.name}
                                style={{ width: '100%', height: 220, objectFit: 'cover', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
                                whileHover={{ scale: 1.04 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = placeholder; }}
                              />
                            );
                          })()}
>>>>>>> 7e31841 (Initial project upload)
                          <Card.Content>
                            <Card.Header style={{ color: 'white', fontWeight: 'bold' }}>{product.name}</Card.Header>
                            <Card.Meta style={{ color: '#eee' }}>{product.category}</Card.Meta>
                            <Card.Description style={{ color: '#eee' }}>{product.description}</Card.Description>
                          </Card.Content>
                          <Card.Content extra>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                              <span>
                                {product.price && ethToPkrRate ? `PKR ${parseFloat(product.price).toLocaleString('en-PK', { maximumFractionDigits: 0 })} | ${(parseFloat(product.price)/ethToPkrRate).toFixed(6)} ETH` : product.price ? `PKR ${parseFloat(product.price).toLocaleString('en-PK', { maximumFractionDigits: 0 })}` : ''}
                              </span>
                              <Button
                                size="mini"
                                primary
                                onClick={() => router.push(`/products/${product._id ? product._id.toString() : product.id}`)}
                                style={{ borderRadius: 12, background: 'linear-gradient(90deg, #1a237e 0%, #4db8ff 100%)', color: '#fff' }}
                              >
                                <Icon name="eye" />
                                View
                              </Button>
                            </div>
                          </Card.Content>
                        </Card>
                      </motion.div>
                    </Grid.Column>
                  ))}
                </Grid>
              )}
            </div>
          )}
        </Segment>
      </Container>
    </Layout>
  );
};

export default StoreProducts; 