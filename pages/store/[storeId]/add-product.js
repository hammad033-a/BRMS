import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Header, Segment, Message, Icon, Form, Button, Input, Image } from 'semantic-ui-react';
import Layout from '../../../components/Layout';

const AddProduct = () => {
  const router = useRouter();
  const { storeId } = router.query;
  const [isClient, setIsClient] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    pricePKR: '', // Only PKR price
    category: '',
    images: [] // now an array
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [store, setStore] = useState(null); // Changed from stores to store

  const MAX_IMAGE_SIZE_MB = 5;

  useEffect(() => {
    setIsClient(true);
    // Fetch store details if you need to display the store name
    if (storeId) {
      fetch(`/api/store/${storeId}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setStore(data);
          }
        });
    }
  }, [storeId]);

  const handleChange = (e, { name, value }) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const validFiles = files.filter(file => file.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024);
      if (validFiles.length !== files.length) {
        setError(`One or more images are too large. Maximum allowed size is ${MAX_IMAGE_SIZE_MB}MB each.`);
        return;
      }
      const readers = validFiles.map(file => {
        return new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(readers).then(newImages => {
        // Append new images, avoid duplicates
        setForm(prev => ({ ...prev, images: [...prev.images, ...newImages.filter(img => !prev.images.includes(img))] }));
        setImagePreviews(prev => [...prev, ...newImages.filter(img => !prev.includes(img))]);
      });
    }
  };

  const addProductToAPI = async (storeId, product) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, product }),
    });
    if (!res.ok) throw new Error('Failed to add product');
    return await res.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!form.name || !form.description || !form.pricePKR || !form.category) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (!storeId || typeof storeId !== 'string' || storeId.length !== 24) {
      setError('Invalid store ID. Please try again or refresh the page.');
      setLoading(false);
      return;
    }

    try {
      // Create new product object
      const newProduct = {
        name: form.name,
        description: form.description,
        price: form.pricePKR, // The price is now in PKR
        category: form.category,
        images: form.images,
        createdAt: new Date().toISOString()
      };
      await addProductToAPI(storeId, newProduct);
        setSuccess('Product added successfully!');
        setTimeout(() => {
          router.push(`/store/${storeId}/products`);
      }, 1200);
    } catch (err) {
      setError('An error occurred while adding the product.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <Layout>
      <Container>
        <Header as="h2" style={{ marginTop: '2em' }}>
          <Icon name="add" />
          Adding Product to: {store ? store.name : '...'}
          <Header.Subheader>
            Owner: {store ? store.ownerName : ''} | Address: {store ? store.ownerAddress : ''}
          </Header.Subheader>
        </Header>
        <Segment raised style={{ maxWidth: '700px', margin: '2em auto', padding: '2em' }}>
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
          <Form onSubmit={handleSubmit} loading={loading}>
            <Form.Group widths="equal">
              <Form.Field required>
                <label>Product Name</label>
                <Input name="name" value={form.name} onChange={handleChange} placeholder="Product name" />
              </Form.Field>
              <Form.Field required>
                  <label>Product Images <span style={{ color: '#888', fontWeight: 'normal' }}>(Max {MAX_IMAGE_SIZE_MB}MB each, multiple allowed)</span></label>
                <Input type="file" accept="image/*" multiple onChange={handleImageChange} />
              </Form.Field>
            </Form.Group>
            <Form.Group widths="equal" stackable>
              <Form.Field required>
                <label>Description</label>
                <Input name="description" value={form.description} onChange={handleChange} placeholder="Description" />
              </Form.Field>
              <Form.Field required>
                <label>Price (PKR)</label>
                <Input name="pricePKR" value={form.pricePKR} onChange={handleChange} placeholder="e.g. 4000" />
              </Form.Field>
              <Form.Field required style={{ minWidth: 0 }}>
                <label>Category</label>
                <Input name="category" value={form.category} onChange={handleChange} placeholder="Category" style={{ width: '100%' }} />
              </Form.Field>
            </Form.Group>
                {imagePreviews.length > 0 && (
              <div style={{ margin: '1em 0', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <label>Image Previews:</label>
                {imagePreviews.map((src, idx) => (
                  <Image key={idx} src={src} size="small" bordered style={{ borderRadius: 8 }} />
                ))}
                  </div>
                )}
            <Button type="submit" color="green" fluid loading={loading}>
              <Icon name="add" /> Add Product to Store
            </Button>
            <Button type="button" fluid style={{ marginTop: '1em' }} onClick={() => router.push(`/store/${storeId}/products`)}>
              <Icon name="arrow left" /> Back to Store
            </Button>
          </Form>
        </Segment>
      </Container>
    </Layout>
  );
};

export default AddProduct; 