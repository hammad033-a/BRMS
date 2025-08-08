import React, { useState, useEffect } from 'react';
import { Container, Header, Card, Grid, Statistic, Search, Input, Message, Button, Icon, Segment } from 'semantic-ui-react';
import Link from 'next/link';
import Layout from '../components/Layout';
import MetaMaskManager from '../components/MetaMaskManager';

// Mock data for stores and products
const mockStores = [
  {
    address: '0x1234567890123456789012345678901234567890',
    name: 'Tech Store',
    description: 'Your one-stop shop for all tech needs',
    products: [
      {
        id: 1,
        name: 'Smartphone X',
        description: 'Latest smartphone with amazing features',
        price: '0.5',
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
      },
      {
        id: 2,
        name: 'Laptop Pro',
        description: 'High-performance laptop for professionals',
        price: '1.2',
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
      }
    ]
  },
  {
    address: '0x0987654321098765432109876543210987654321',
    name: 'Fashion Hub',
    description: 'Trendy fashion for everyone',
    products: [
      {
        id: 3,
        name: 'Designer Dress',
        description: 'Elegant dress for special occasions',
        price: '0.3',
        category: 'Clothing',
        imageUrl: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
      },
      {
        id: 4,
        name: 'Casual T-shirt',
        description: 'Comfortable everyday wear',
        price: '0.00625',
        category: 'Clothing',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
      }
    ]
  }
];

const ETH_TO_PKR = 800000; // 1 ETH = 800,000 PKR

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const metamaskConnected = localStorage.getItem('metamaskConnected') === 'true';
    const token = localStorage.getItem('token');
    setIsMetaMaskConnected(metamaskConnected);
    setIsLoggedIn(!!token);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === '') {
      setFilteredProducts([]);
      return;
    }

    const filtered = mockStores.flatMap(store => 
      store.products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        store.name.toLowerCase().includes(query)
      )
    );

    setFilteredProducts(filtered);
  };

  const renderProducts = (products) => {
    return products.map((product, idx) => {
      const store = mockStores.find(s => s.products.some(p => p.id === product.id));
      const pricePKR = (parseFloat(product.price) * ETH_TO_PKR).toLocaleString('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 });
      const mockProductId = product.id.toString();
      return (
        <Grid.Column key={product.id} mobile={16} tablet={8} computer={4}>
          <Card fluid style={{ height: '100%' }}>
            <div style={{ 
              height: '200px', 
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: '#f5f5f5'
            }}>
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  position: 'absolute',
                  top: 0,
                  left: 0
                }} 
              />
            </div>
            <Card.Content>
              <Card.Header>{product.name}</Card.Header>
              <Card.Meta>
                <Icon name="shop" /> {store.name}
              </Card.Meta>
              <Card.Description>{product.description}</Card.Description>
            </Card.Content>
            <Card.Content extra>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Statistic size='tiny'>
                  <Statistic.Value>{pricePKR}</Statistic.Value>
                </Statistic>
                <div>
                  <Link href={`/reviews/${store.address}/${mockProductId}/all/0/show`} legacyBehavior>
                    <Button icon="star" labelPosition="right" content="Reviews" color="teal" size="tiny" />
                  </Link>
                  {isLoggedIn && (
                    <Link href={`/products/${store.address}/${mockProductId}/pay`} legacyBehavior>
                      <Button primary icon="shopping cart" labelPosition="right" content="Buy" size="tiny" />
                    </Link>
                  )}
                </div>
              </div>
            </Card.Content>
          </Card>
        </Grid.Column>
      );
    });
  };

  return (
    <Layout>
      <Segment style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        background: 'linear-gradient(135deg, rgba(0, 128, 0, 0.8) 0%, rgba(0, 0, 0, 0.8) 100%)',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        margin: '0 auto',
        marginBottom: '2em',
        border: 'none',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2em',
        }}>
          {/* BRMS Logo and Title */}
          <div style={{ textAlign: 'center', marginBottom: '1.5em' }}>
            {/* 3D Ethereum SVG logo */}
            <div style={{ marginBottom: '0.2em' }}>
              <svg width="80" height="80" viewBox="0 0 256 417" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 32px #4db8ff)', display: 'block', margin: '0 auto' }}>
                <g filter="url(#shadow)">
                  <polygon points="127.9,0 127.9,277.1 255.8,208.3 " fill="#4db8ff"/>
                  <polygon points="127.9,0 0,208.3 127.9,277.1 " fill="#8C8C8C"/>
                  <polygon points="127.9,304.6 127.9,416.9 255.9,230.2 " fill="#3C3C3B"/>
                  <polygon points="127.9,416.9 127.9,304.6 0,230.2 " fill="#8C8C8C"/>
                  <polygon points="127.9,277.1 255.8,208.3 127.9,304.6 " fill="#141414"/>
                  <polygon points="0,208.3 127.9,277.1 127.9,304.6 " fill="#393939"/>
                </g>
                <defs>
                  <filter id="shadow" x="-10" y="-10" width="276" height="446" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#4db8ff" floodOpacity="0.25"/>
                  </filter>
                </defs>
              </svg>
            </div>
            <div style={{
              fontSize: '3.5em',
              fontWeight: 'bold',
              letterSpacing: '0.15em',
              color: '#4db8ff',
              textShadow: '0 0 32px #4db8ff, 0 0 8px #fff',
              marginBottom: '0.1em',
              fontFamily: 'Orbitron, Roboto, Arial, sans-serif',
              lineHeight: 1.1,
            }}>
              BRMS
            </div>
            <h1 style={{
              fontSize: '2.2em',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #4db8ff, #fff, #4db8ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.3em',
              letterSpacing: '2px',
              textShadow: '0 0 30px rgba(77, 184, 255, 0.3)'
            }}>
              Blockchain Review Management System
            </h1>
            <p style={{
              fontSize: '1.35em',
              color: '#fff',
              fontWeight: 400,
              margin: 0,
              textShadow: '0 2px 8px rgba(0,0,0,0.18)'
            }}>
              Discover, review, and shop with trust. All reviews are verified and stored on the blockchain for transparency and security. Connect your wallet to get started!
            </p>
          </div>
          <div style={{
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 40px 0 rgba(77,184,255,0.15)',
            marginBottom: '2em',
            position: 'relative',
            overflow: 'hidden',
            animation: 'pulse 2s infinite',
          }}>
            <svg width="90" height="90" viewBox="0 0 256 417" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ zIndex: 2 }}>
              <g filter="url(#shadow)">
                <polygon points="127.9,0 127.9,277.1 255.8,208.3 " fill="#343434"/>
                <polygon points="127.9,0 0,208.3 127.9,277.1 " fill="#8C8C8C"/>
                <polygon points="127.9,304.6 127.9,416.9 255.9,230.2 " fill="#3C3C3B"/>
                <polygon points="127.9,416.9 127.9,304.6 0,230.2 " fill="#8C8C8C"/>
                <polygon points="127.9,277.1 255.8,208.3 127.9,304.6 " fill="#141414"/>
                <polygon points="0,208.3 127.9,277.1 127.9,304.6 " fill="#393939"/>
              </g>
              <defs>
                <filter id="shadow" x="-10" y="-10" width="276" height="446" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#4db8ff" floodOpacity="0.25"/>
                </filter>
              </defs>
            </svg>
          </div>
          <Button
            color="orange"
            size="huge"
            onClick={() => window.location.href = '/login'}
            className="metamask-button"
            style={{
              background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
              border: 'none',
              borderRadius: '50px',
              padding: '1.5em 3em',
              fontSize: '1.3em',
              fontWeight: 'bold',
              boxShadow: '0 15px 35px rgba(255, 107, 53, 0.4)',
              transition: 'all 0.3s ease',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              animation: 'pulse 2s infinite',
            }}
          >
            <Icon name="ethereum" style={{ marginRight: '0.5em' }} />
            Login with MetaMask
          </Button>
        </div>
      </Segment>

      <Container>
        <Grid>
          <Grid.Row>
            {isLoggedIn ? (
              <>
                <Grid.Column width={16}>
                  <Header as="h2" style={{ color: 'white' }}>
                    Featured Products
                  </Header>
                </Grid.Column>
                {renderProducts(mockStores.flatMap(store => store.products))}
              </>
            ) : null}
          </Grid.Row>
        </Grid>
      </Container>
    </Layout>
  );
}