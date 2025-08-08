import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Form, Button, Header, Segment, Message, Icon } from 'semantic-ui-react';
import Layout from '../../components/Layout';

const StoreLogin = () => {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e, { name, value }) => setForm(prev => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('storeId', data.storeId);
        localStorage.setItem('storeOwnerEmail', form.email); // Save email for filtering
        router.push('/store/manage-stores');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container>
        <Segment style={{ maxWidth: 400, margin: '4em auto', padding: '2em' }}>
          <Header as="h2" textAlign="center">
            <Icon name="lock" /> Store Owner Login
          </Header>
          {error && <Message negative>{error}</Message>}
          <Form onSubmit={handleSubmit} loading={loading}>
            <Form.Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Form.Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <Button type="submit" color="blue" fluid>Login</Button>
          </Form>
        </Segment>
      </Container>
    </Layout>
  );
};

export default StoreLogin; 