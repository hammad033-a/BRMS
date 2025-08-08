import React, { useState } from 'react';
import { Button, Message, Icon } from 'semantic-ui-react';
import { useRouter } from 'next/router';

const LoginMetaMask = () => {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [account, setAccount] = useState('');

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
      
      // Store the account in localStorage
      localStorage.setItem('metamaskConnected', 'true');
      localStorage.setItem('userAddress', connectedAccount);
      
      // Redirect to the home page
      router.push('/');
    } catch (err) {
      console.error('Error connecting to MetaMask:', err);
      setError(err.message || 'Failed to connect to MetaMask. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div>
      {error && (
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{error}</p>
        </Message>
      )}
      
      <Button 
        color='orange'
        onClick={connectMetaMask}
        loading={isConnecting}
        style={{ marginBottom: '1em' }}
      >
        <Icon name='ethereum' />
        Connect with MetaMask
      </Button>
      
      {account && (
        <Message positive>
          <Message.Header>Connected</Message.Header>
          <p>Connected to account: {account}</p>
        </Message>
      )}
    </div>
  );
};

export default LoginMetaMask;
