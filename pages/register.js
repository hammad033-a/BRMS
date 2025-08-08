import React, { useState } from 'react';
import { Form, Button, Message, Container, Header, Segment, Icon, Input } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e, { name, value }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
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
            <Icon name="user plus" />
            <Header.Content>
              Create an Account
              <Header.Subheader style={{ color: '#4db8ff' }}>
                Join our community of buyers
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

          <Form onSubmit={handleSubmit} loading={loading}>
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
              <label style={{ color: 'white' }}>Password</label>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
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
                placeholder="Confirm your password"
                required
              />
            </Form.Field>

            <Button type="submit" primary fluid>
              Register
            </Button>
          </Form>

          <div style={{ textAlign: 'center', marginTop: '1em' }}>
            <p style={{ color: 'white' }}>
              Already have an account?{' '}
              <a href="/login" style={{ color: '#4db8ff' }}>
                Login here
              </a>
            </p>
          </div>
        </Segment>
      </Container>
    </Layout>
  );
};

export default Register; 