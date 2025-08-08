import React, { useEffect, useState } from 'react';
import { Container, Header, Table, Button, Icon, Message } from 'semantic-ui-react';
import Layout from '../../components/Layout';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId) => {
    setError('');
    try {
      const res = await fetch('/api/orders/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      if (!res.ok) throw new Error('Failed to approve order');
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: 'dispatched' } : o));
    } catch (err) {
      setError('Failed to approve order.');
    }
  };

  return (
    <Layout>
      <Container style={{ marginTop: '2em' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1em' }}>
          <Button color="blue" size="large" onClick={() => window.location.href = '/admin/approved-orders'}>
            <Icon name="check circle" /> Approved Orders
          </Button>
        </div>
        <Header as="h2"><Icon name="shipping" /> Pending Orders</Header>
        {error && <Message negative>{error}</Message>}
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Address</Table.HeaderCell>
              <Table.HeaderCell>Phone</Table.HeaderCell>
              <Table.HeaderCell>Product</Table.HeaderCell>
              <Table.HeaderCell>Price</Table.HeaderCell>
              <Table.HeaderCell>Wallet</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Action</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {orders.filter(o => o.status === 'pending').map(order => (
              <Table.Row key={order.orderId}>
                <Table.Cell>{order.name}</Table.Cell>
                <Table.Cell>{order.address}</Table.Cell>
                <Table.Cell>{order.phone}</Table.Cell>
                <Table.Cell>{order.productId}</Table.Cell>
                <Table.Cell>{order.price}</Table.Cell>
                <Table.Cell>{order.wallet}</Table.Cell>
                <Table.Cell>{order.status}</Table.Cell>
                <Table.Cell>
                  <Button color="green" size="small" onClick={() => handleApprove(order.orderId)} disabled={order.status === 'dispatched'}>
                    <Icon name="check" /> Approve/Dispatch
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Container>
    </Layout>
  );
};

export default AdminOrders; 