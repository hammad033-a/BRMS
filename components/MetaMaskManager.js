import React, { useState, useEffect } from 'react';
import { Button, Message, Icon } from 'semantic-ui-react';
import { useRouter } from 'next/router';

const MetaMaskManager = () => {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if MetaMask is already connected
    const checkConnection = () => {
      const metamaskConnected = localStorage.getItem('metamaskConnected') === 'true';
      const storedAccount = localStorage.getItem('userAddress');
      
      if (metamaskConnected && storedAccount) {
        setIsConnected(true);
        setAccount(storedAccount);
      }
    };

    checkConnection();

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

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  const connectMetaMask = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }
      
      // Request account access
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
      
      // Refresh the page to update the state
      router.reload();
    } catch (err) {
      console.error('Error connecting to MetaMask:', err);
      setError(err.message || 'Failed to connect to MetaMask. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectMetaMask = () => {
    // Clear the stored MetaMask data
    localStorage.removeItem('metamaskConnected');
    localStorage.removeItem('userAddress');
    
    // Reset the state
    setAccount('');
    setIsConnected(false);
    
    // Refresh the page to update the state
    router.reload();
  };

  return (
    <div>
      {error && (
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{error}</p>
        </Message>
      )}
      
      {!isConnected ? (
        <Button 
          color='orange'
          onClick={connectMetaMask}
          loading={isConnecting}
          style={{ marginBottom: '1em' }}
        >
          <Icon name='ethereum' />
          Connect with MetaMask
        </Button>
      ) : (
        <div>
          <Message positive>
            <Message.Header>Connected</Message.Header>
            <p>Connected to account: {account}</p>
          </Message>
          <Button 
            color='red'
            onClick={disconnectMetaMask}
            style={{ marginTop: '1em' }}
          >
            <Icon name='sign out' />
            Disconnect MetaMask
          </Button>
        </div>
      )}
    </div>
  );
};

export default MetaMaskManager; 