import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Header, Segment, Message, Divider, Icon, Grid } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import MetaMaskManager from '../../components/MetaMaskManager';

const AddProduct = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: ''
  });

  useEffect(() => {
    // Check if MetaMask is connected
    const metamaskConnected = localStorage.getItem('metamaskConnected') === 'true';
    setIsMetaMaskConnected(metamaskConnected);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form data
      if (!formData.name || !formData.description || !formData.price || !formData.category) {
        throw new Error('Please fill in all required fields');
      }

      // Get the store owner's address from MetaMask
      const userAddress = localStorage.getItem('userAddress');
      if (!userAddress) {
        throw new Error('Please connect your MetaMask wallet');
      }

      // Call the Express backend API server
      console.log('Sending request to API with data:', {
        productName: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        imageUrl: formData.imageUrl,
        storeOwner: userAddress
      });
      
      const response = await fetch('/api/store/add-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: formData.name,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          imageUrl: formData.imageUrl,
          storeOwner: userAddress
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();

      if (response.ok) {
        setSuccess('Product added successfully!');
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          imageUrl: ''
        });
      } else {
        throw new Error(data.message || 'Failed to add product');
      }
    } catch (err) {
      console.error('Error details:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error: Unable to connect to the server. Please check if the API server is running.');
      } else {
        setError(err.message || 'An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Container>
        <Header as="h1" textAlign="center" style={{ marginTop: '2em' }}>
          <Icon name="add circle" />
          Add New Product
        </Header>

        <Segment raised style={{ maxWidth: '600px', margin: '2em auto', padding: '2em' }}>
          <MetaMaskManager />
          
          {!isMetaMaskConnected && (
            <Message warning>
              <Message.Header>MetaMask Required</Message.Header>
              <p>Please connect your MetaMask wallet to add products to your store.</p>
            </Message>
          )}

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

          <Form onSubmit={handleSubmit} loading={isLoading}>
            <Form.Input
              label="Product Name"
              placeholder="Enter product name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />

            <Form.TextArea
              label="Description"
              placeholder="Enter product description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />

            <Form.Input
              label="Price (ETH)"
              placeholder="Enter price in ETH"
              name="price"
              type="number"
              step="0.000000000000000001"
              value={formData.price}
              onChange={handleInputChange}
              required
            />

            <Form.Input
              label="Category"
              placeholder="Enter product category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            />

            <Form.Input
              label="Image URL"
              placeholder="Enter product image URL"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
            />

            <Button
              type="submit"
              color="green"
              fluid
              disabled={!isMetaMaskConnected}
            >
              Add Product
            </Button>
          </Form>
        </Segment>
      </Container>
    </Layout>
  );
};

export default AddProduct; 