import React, { useState } from 'react';
import { Form, Button, Message, Container, Header, Segment, Icon, Input } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

const PLATFORM_ETH_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678'; // TODO: Replace with real address
const FEE_USD = 50;
const ETH_USD_RATE = 3500; // Example rate, update as needed
const FEE_ETH = (FEE_USD / ETH_USD_RATE).toFixed(6);

const StoreRegister = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    storeName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    password: '',
    confirmPassword: '',
    logo: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [hasPaid, setHasPaid] = useState(false);
  const [paying, setPaying] = useState(false);

  const handleChange = (e, { name, value }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMetaMaskPayment = async () => {
    setError('');
    setPaying(true);
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed.');
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const from = accounts[0];
      const value = (FEE_ETH * 1e18).toString(16); // in wei, hex
      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from,
          to: PLATFORM_ETH_ADDRESS,
          value: '0x' + parseInt(FEE_ETH * 1e18).toString(16),
        }],
      });
      setHasPaid(true);
    } catch (err) {
      setError(err.message || 'MetaMask payment failed.');
    } finally {
      setPaying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Get MetaMask address
      let ownerAddress = '';
      if (typeof window.ethereum !== 'undefined') {
        ownerAddress = window.ethereum.selectedAddress;
        if (!ownerAddress) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          ownerAddress = accounts[0];
        }
      }
      // Merge ownerAddress into formData
      const storeData = { ...formData, ownerAddress };
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the new store data for the success page
        const newStoreData = {
          id: Date.now().toString(), // Generate a simple ID
          ...storeData
        };
        localStorage.setItem('newStoreData', JSON.stringify(newStoreData));
        setSuccess('Store registered successfully! Redirecting to success page...');
        setTimeout(() => {
          router.push('/store/register-success');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container>
        <Segment style={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', padding: '2em', marginTop: '2em' }}>
          <Header as="h2" style={{ color: 'white', textAlign: 'center' }}>
            <Icon name="shop" />
            <Header.Content>
              Register Your Store
              <Header.Subheader style={{ color: '#4db8ff' }}>
                Join Pakistan's trusted e-commerce platform
              </Header.Subheader>
            </Header.Content>
          </Header>

          {error && (
            <Message negative>
              <Message.Header>Error</Message.Header>
              <p>{error}</p>
            </Message>
          )}

          {success && (
            <Message positive>
              <Message.Header>Success</Message.Header>
              <p>{success}</p>
            </Message>
          )}

          {!hasPaid ? (
            <div style={{ textAlign: 'center', margin: '2em 0' }}>
              <Header as="h3" style={{ color: 'white' }}>
                Pay $50 Registration Fee with MetaMask
              </Header>
              <p style={{ color: 'white' }}>You must pay a one-time $50 fee (≈{FEE_ETH} ETH) to register your store.</p>
              <Button color="orange" size="large" onClick={handleMetaMaskPayment} loading={paying} disabled={paying}>
                <Icon name="ethereum" /> Pay with MetaMask
              </Button>
            </div>
          ) : (
          <Form onSubmit={handleSubmit} loading={loading}>
            <Form.Field>
              <label style={{ color: 'white' }}>Store Name</label>
              <Input
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                placeholder="Enter your store name"
                required
              />
            </Form.Field>
            <Form.Field>
              <label style={{ color: 'white' }}>Owner Name</label>
              <Input
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Enter owner's name"
                required
              />
            </Form.Field>
            <Form.Field>
              <label style={{ color: 'white' }}>Email</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </Form.Field>
            <Form.Field>
              <label style={{ color: 'white' }}>Phone Number</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </Form.Field>
            <Form.Field>
              <label style={{ color: 'white' }}>Store Address</label>
              <Form.TextArea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your store address"
                required
              />
            </Form.Field>
            <Form.Field>
              <label style={{ color: 'white' }}>Store Description</label>
              <Form.TextArea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your store and what you sell"
                required
              />
            </Form.Field>
            <Form.Field>
              <label style={{ color: 'white' }}>Password</label>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </Form.Field>
            <Form.Field>
              <label style={{ color: 'white' }}>Confirm Password</label>
              <Input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
            </Form.Field>
              <Form.Field>
                <label style={{ color: 'white' }}>Store Logo</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                {formData.logo && (
                  <img src={formData.logo} alt="Store Logo Preview" style={{ marginTop: 10, maxHeight: 100 }} />
                )}
              </Form.Field>
            <Button type="submit" primary fluid size="large">
              Register Store
            </Button>
          </Form>
          )}
        </Segment>
      </Container>
    </Layout>
  );
};

export default StoreRegister; 