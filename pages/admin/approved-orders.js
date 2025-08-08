import React, { useEffect, useState } from 'react';
import { Container, Header, Table, Icon, Message, Button } from 'semantic-ui-react';
import Layout from '../../components/Layout';

const ApprovedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState({});
  const [storeId, setStoreId] = useState(null);

  useEffect(() => {
    const id = typeof window !== 'undefined' ? localStorage.getItem('storeId') : null;
    setStoreId(id);
    fetchOrders();
    fetchProducts();
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

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      // Map productId to product object for quick lookup
      const map = {};
      (data.products || data).forEach(p => { map[p.productId || p._id] = p; });
      setProducts(map);
    } catch {}
  };

  // Only show orders for products that belong to the current store
  const filteredOrders = orders.filter(o => {
    if (o.status !== 'dispatched') return false;
    const product = products[o.productId];
    if (!product) return false;
    // storeId can be ObjectId or string, so compare as strings
    return product.storeId && storeId && String(product.storeId) === String(storeId);
  });

  return (
    <Layout>
      <Container style={{ marginTop: '2em' }}>
        <Header as="h2"><Icon name="check circle" /> Approved Orders</Header>
        <Button color="teal" onClick={() => window.location.href = '/admin/orders'} style={{ marginBottom: 16 }}>
          <Icon name="shipping" /> Back to Pending Orders
        </Button>
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
              <Table.HeaderCell>Approved At</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredOrders.map(order => (
              <Table.Row key={order.orderId}>
                <Table.Cell>{order.name}</Table.Cell>
                <Table.Cell>{order.address}</Table.Cell>
                <Table.Cell>{order.phone}</Table.Cell>
                <Table.Cell>
                  {products[order.productId]?.name || order.productId}
                  <div style={{ color: '#888', fontSize: 12 }}>
                    {products[order.productId]?.description}
                  </div>
                </Table.Cell>
                <Table.Cell>{order.price}</Table.Cell>
                <Table.Cell>{order.wallet}</Table.Cell>
                <Table.Cell>{order.status}</Table.Cell>
                <Table.Cell>{order.updatedAt ? new Date(order.updatedAt).toLocaleString() : ''}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Container>
    </Layout>
  );
};

export default ApprovedOrders; 