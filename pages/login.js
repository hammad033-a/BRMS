import React, { useState, useEffect } from 'react';
import { Container, Header, Segment, Message, Icon, Button, Grid, Card, Dimmer, Loader } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const Login = () => {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Check if MetaMask is installed
    const checkMetaMask = () => {
      if (typeof window.ethereum !== 'undefined') {
        setIsMetaMaskInstalled(true);
        // Check if already connected
        const metamaskConnected = localStorage.getItem('metamaskConnected') === 'true';
        const storedAccount = localStorage.getItem('userAddress');
        if (metamaskConnected && storedAccount) {
          setIsConnected(true);
          setAccount(storedAccount);
        }
      }
    };

    checkMetaMask();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          // User disconnected
          disconnectMetaMask();
        } else {
          // Account changed
          const newAccount = accounts[0];
          setAccount(newAccount);
          localStorage.setItem('userAddress', newAccount);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    // Create floating particles animation
    const createParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 3 + 1,
          speed: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.2
        });
      }
      setParticles(newParticles);
    };

    createParticles();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  const connectMetaMask = async () => {
    setIsConnecting(true);
    setError('');
    setShowAnimation(true);
    
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }
      
      // Request account access with animation delay
      await new Promise(resolve => setTimeout(resolve, 1500)); // Longer animation delay
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your MetaMask account.');
      }
      
      // Get the connected account
      const connectedAccount = accounts[0];
      setAccount(connectedAccount);
      setIsConnected(true);
      
      // Store the account in localStorage
      localStorage.setItem('metamaskConnected', 'true');
      localStorage.setItem('userAddress', connectedAccount);
      
      setSuccess('Successfully connected to MetaMask!');
      
      // Redirect after success animation
      setTimeout(() => {
        router.push('/dashboard');
      }, 2500);
      
    } catch (err) {
      console.error('Error connecting to MetaMask:', err);
      setError(err.message || 'Failed to connect to MetaMask. Please try again.');
    } finally {
      setIsConnecting(false);
      setShowAnimation(false);
    }
  };

  const disconnectMetaMask = () => {
    // Clear the stored MetaMask data
    localStorage.removeItem('metamaskConnected');
    localStorage.removeItem('userAddress');
    
    // Reset the state
    setAccount('');
    setIsConnected(false);
    setSuccess('');
    setError('');
  };

  return (
    <Layout>
      {/* Floating Particles Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}>
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: '#4db8ff',
              borderRadius: '50%',
              opacity: particle.opacity,
              animation: `float ${particle.speed}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <Container style={{ position: 'relative', zIndex: 2 }}>
        <Header as="h1" textAlign="center" style={{ 
          marginTop: '3em', 
          marginBottom: '2em',
          animation: 'fadeInDown 1s ease-out'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1em'
          }}>
            <div style={{
              position: 'relative',
              animation: 'pulse 2s infinite'
            }}>
              <Icon 
                name="ethereum" 
                size="huge" 
                style={{ 
                  color: '#4db8ff', 
                  fontSize: '4em',
                  filter: 'drop-shadow(0 0 20px rgba(77, 184, 255, 0.6))'
                }} 
              />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(77, 184, 255, 0.3) 0%, transparent 70%)',
                animation: 'glow 2s infinite'
              }} />
            </div>
            <Header.Content style={{ animation: 'fadeInUp 1s ease-out 0.3s both' }}>
              <div style={{
                fontSize: '3.5em',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #4db8ff, #ff6b35)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(77, 184, 255, 0.5)'
              }}>
                BRMS
              </div>
              <Header.Subheader style={{ 
                color: '#4db8ff', 
                fontSize: '1.5em', 
                marginTop: '0.5em',
                fontWeight: '300',
                textShadow: '0 0 10px rgba(77, 184, 255, 0.5)'
              }}>
                Blockchain Review Management System
              </Header.Subheader>
            </Header.Content>
          </div>
        </Header>

        <Grid centered>
          <Grid.Column width={8}>
            <Card fluid style={{ 
              background: 'rgba(30, 30, 30, 0.95)', 
              border: '2px solid rgba(77, 184, 255, 0.4)',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(77, 184, 255, 0.3)',
              backdropFilter: 'blur(10px)',
              animation: 'slideInUp 1s ease-out 0.5s both'
            }}>
              <Card.Content style={{ padding: '4em' }}>
                {error && (
                  <Message negative style={{ 
                    marginBottom: '2em',
                    animation: 'shake 0.5s ease-in-out'
                  }}>
                    <Message.Header>Connection Error</Message.Header>
                    <p>{error}</p>
                  </Message>
                )}

                {success && (
                  <Message positive style={{ 
                    marginBottom: '2em',
                    animation: 'successGlow 2s infinite'
                  }}>
                    <Message.Header>Success!</Message.Header>
                    <p>{success}</p>
                  </Message>
                )}

                {!isMetaMaskInstalled ? (
                  <div style={{ textAlign: 'center', animation: 'fadeInUp 1s ease-out' }}>
                    <Icon name="warning circle" size="huge" style={{ 
                      color: '#ff6b6b', 
                      marginBottom: '1em',
                      animation: 'pulse 2s infinite'
                    }} />
                    <Header as="h3" style={{ color: '#ff6b6b' }}>
                      MetaMask Not Found
                    </Header>
                    <p style={{ color: '#e0e0e0', marginBottom: '2em', fontSize: '1.1em' }}>
                      Please install MetaMask to use this application.
                    </p>
                    <Button
                      as="a"
                      href="https://metamask.io/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="orange"
                      size="large"
                      style={{ 
                        marginBottom: '1em',
                        animation: 'bounce 2s infinite'
                      }}
                    >
                      <Icon name="download" />
                      Install MetaMask
                    </Button>
                  </div>
                ) : !isConnected ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      marginBottom: '3em',
                      padding: '3em',
                      background: 'linear-gradient(135deg, rgba(77, 184, 255, 0.1), rgba(255, 107, 53, 0.1))',
                      borderRadius: '20px',
                      border: '2px solid rgba(77, 184, 255, 0.3)',
                      animation: 'fadeInUp 1s ease-out 0.7s both'
                    }}>
                      <div style={{
                        position: 'relative',
                        marginBottom: '2em'
                      }}>
                        <Icon 
                          name="ethereum" 
                          size="huge" 
                          style={{ 
                            color: '#4db8ff', 
                            marginBottom: '1em',
                            fontSize: '4em',
                            filter: 'drop-shadow(0 0 20px rgba(77, 184, 255, 0.8))',
                            animation: 'float 3s ease-in-out infinite'
                          }} 
                        />
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, rgba(77, 184, 255, 0.2) 0%, transparent 70%)',
                          animation: 'pulse 2s infinite'
                        }} />
                      </div>
                      <Header as="h3" style={{ 
                        color: '#4db8ff',
                        fontSize: '2em',
                        marginBottom: '1em',
                        textShadow: '0 0 10px rgba(77, 184, 255, 0.5)'
                      }}>
                        Connect Your Wallet
                      </Header>
                      <p style={{ 
                        color: '#e0e0e0', 
                        fontSize: '1.2em',
                        lineHeight: '1.6'
                      }}>
                        Connect your MetaMask wallet to access your account and manage your stores.
                      </p>
                    </div>

                    <Button
                      color="orange"
                      size="massive"
                      onClick={connectMetaMask}
                      loading={isConnecting}
                      disabled={isConnecting}
                      className="metamask-button"
                      style={{
                        background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                        border: 'none',
                        borderRadius: '50px',
                        padding: '2em 4em',
                        fontSize: '1.4em',
                        fontWeight: 'bold',
                        boxShadow: '0 15px 35px rgba(255, 107, 53, 0.4)',
                        transition: 'all 0.3s ease',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                        animation: 'pulse 2s infinite'
                      }}
                    >
                      <Icon name="ethereum" style={{ marginRight: '0.5em' }} />
                      {isConnecting ? 'Connecting...' : 'Connect with MetaMask'}
                    </Button>

                    {isConnecting && (
                      <div style={{ marginTop: '3em' }}>
                        <Dimmer active inverted>
                          <Loader size="large" inverted>
                            <div style={{ marginTop: '1em' }}>
                              Connecting to MetaMask...
                            </div>
                          </Loader>
                        </Dimmer>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', animation: 'fadeInUp 1s ease-out' }}>
                    <div 
                      className="success-glow"
                      style={{ 
                        marginBottom: '2em',
                        padding: '3em',
                        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(77, 184, 255, 0.1))',
                        borderRadius: '20px',
                        border: '2px solid rgba(76, 175, 80, 0.4)'
                      }}
                    >
                      <Icon name="check circle" size="huge" style={{ 
                        color: '#4caf50', 
                        marginBottom: '1em',
                        fontSize: '4em',
                        filter: 'drop-shadow(0 0 20px rgba(76, 175, 80, 0.8))'
                      }} />
                      <Header as="h3" style={{ color: '#4caf50', fontSize: '2em' }}>
                        Connected Successfully!
                      </Header>
                      <p style={{ color: '#e0e0e0', marginBottom: '1em', fontSize: '1.1em' }}>
                        Account: {account}
                      </p>
                      <p style={{ color: '#e0e0e0', fontSize: '1.1em' }}>
                        You can now access your dashboard and manage your stores.
                      </p>
                    </div>

                    <Grid columns={2} stackable>
                      <Grid.Column>
                        <Button
                          color="green"
                          fluid
                          size="large"
                          onClick={() => router.push('/dashboard')}
                          style={{ animation: 'bounce 2s infinite' }}
                        >
                          <Icon name="dashboard" />
                          Go to Dashboard
                        </Button>
                      </Grid.Column>
                      <Grid.Column>
                        <Button
                          color="red"
                          fluid
                          size="large"
                          onClick={disconnectMetaMask}
                        >
                          <Icon name="sign out" />
                          Disconnect
                        </Button>
                      </Grid.Column>
                    </Grid>
                  </div>
                )}
              </Card.Content>
            </Card>
          </Grid.Column>
        </Grid>
      </Container>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(77, 184, 255, 0.5); }
          50% { box-shadow: 0 0 30px rgba(77, 184, 255, 0.8); }
          100% { box-shadow: 0 0 5px rgba(77, 184, 255, 0.5); }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes successGlow {
          0%, 100% { box-shadow: 0 0 10px rgba(76, 175, 80, 0.5); }
          50% { box-shadow: 0 0 30px rgba(76, 175, 80, 0.8); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        .metamask-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px rgba(255, 107, 53, 0.6) !important;
        }
        
        .success-glow {
          animation: successGlow 2s infinite;
        }
      `}</style>
    </Layout>
  );
};

export default Login;
