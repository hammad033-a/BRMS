import React, { useState, useEffect } from 'react';
import { Container, Header, Segment, Message, Icon, Grid, Button, Table, Input, Label, Image, Modal } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import MetaMaskManager from '../../components/MetaMaskManager';

const fetchAllProductsFromAPI = async () => {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error('Failed to fetch products');
  return await res.json();
};

const AdminProducts = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState({ open: false, type: '', product: null });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const metamaskConnected = localStorage.getItem('metamaskConnected') === 'true';
    setIsMetaMaskConnected(metamaskConnected);
    // Load all products from API
    fetchAllProductsFromAPI()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'yellow';
      case 'suspended': return 'red';
      default: return 'grey';
    }
  };
  const getStockColor = (stock) => {
    if (stock > 20) return 'green';
    if (stock > 5) return 'yellow';
    return 'red';
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.storeName && product.storeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Action handlers
  const handleSuspend = (product) => setModal({ open: true, type: 'suspend', product });
  const handleDelete = (product) => setModal({ open: true, type: 'delete', product });
  const handleEdit = (product) => setModal({ open: true, type: 'edit', product });
  const handleView = (product) => setModal({ open: true, type: 'view', product });

  const confirmAction = () => {
    if (modal.type === 'suspend') {
      setProducts(products.map(p => p.id === modal.product.id ? { ...p, status: p.status === 'suspended' ? 'active' : 'suspended' } : p));
      setSuccessMsg(`Product "${modal.product.name}" status updated.`);
    } else if (modal.type === 'delete') {
      setProducts(products.filter(p => p.id !== modal.product.id));
      setSuccessMsg(`Product "${modal.product.name}" deleted.`);
    }
    setModal({ open: false, type: '', product: null });
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const closeModal = () => setModal({ open: false, type: '', product: null });

  return (
    <Layout>
      <Container>
        <Header as="h1" textAlign="center" style={{ marginTop: '2em' }}>
          <Icon name="box" />
          Manage Products
        </Header>
        <Segment raised style={{ maxWidth: '1400px', margin: '2em auto', padding: '2em' }}>
          <MetaMaskManager />
          {!isMetaMaskConnected && (
            <Message warning>
              <Message.Header>MetaMask Required</Message.Header>
              <p>Please connect your MetaMask wallet to access the admin panel.</p>
            </Message>
          )}
          {successMsg && (
            <Message positive>
              <Message.Header>Success</Message.Header>
              <p>{successMsg}</p>
            </Message>
          )}
          {isMetaMaskConnected && (
            <div>
              <Grid columns={2} style={{ marginBottom: '2em' }}>
                <Grid.Column>
                  <Header as="h3">
                    <Icon name="box" />
                    All Products ({filteredProducts.length})
                  </Header>
                </Grid.Column>
                <Grid.Column>
                  <Input
                    icon="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleSearch}
                    fluid
                  />
                </Grid.Column>
              </Grid>
              <div style={{ overflowX: 'auto' }}>
                <Table celled stackable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Product</Table.HeaderCell>
                      <Table.HeaderCell>Store</Table.HeaderCell>
                      <Table.HeaderCell>Category</Table.HeaderCell>
                      <Table.HeaderCell>Price</Table.HeaderCell>
                      <Table.HeaderCell>Status</Table.HeaderCell>
                      <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredProducts.map((product) => (
                      <Table.Row key={product.id}>
                        <Table.Cell>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Image src={product.image || product.imageUrl} size="tiny" style={{ marginRight: '1em' }} />
                            <div>
                              <strong>{product.name}</strong>
                              <br />
                              <small>{product.description}</small>
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Icon name="shop" /> {product.storeName}
                        </Table.Cell>
                        <Table.Cell>
                          <Label>{product.category}</Label>
                        </Table.Cell>
                        <Table.Cell>
                          <div>
                            <strong>{product.priceETH ? `${product.priceETH} ETH` : `${product.price} ETH`}</strong>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Label color={getStatusColor(product.status)}>{product.status || 'active'}</Label>
                        </Table.Cell>
                        <Table.Cell>
                          <Button.Group vertical size="tiny">
                            <Button icon="eye" content="View" onClick={() => handleView(product)} />
                            <Button icon="edit" content="Edit" onClick={() => handleEdit(product)} />
                            <Button icon="ban" content={product.status === 'suspended' ? 'Activate' : 'Suspend'} color="yellow" onClick={() => handleSuspend(product)} />
                            <Button icon="trash" content="Delete" color="red" onClick={() => handleDelete(product)} />
                          </Button.Group>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
              <div style={{ marginTop: '2em', textAlign: 'center' }}>
                <Button color="blue" size="large" onClick={() => router.push('/admin/dashboard')}>
                  <Icon name="arrow left" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          )}
        </Segment>
        {/* Modal for actions */}
        <Modal open={modal.open} onClose={closeModal} size="tiny">
          <Modal.Header>
            {modal.type === 'suspend' && (modal.product?.status === 'suspended' ? 'Activate Product' : 'Suspend Product')}
            {modal.type === 'delete' && 'Delete Product'}
            {modal.type === 'edit' && 'Edit Product'}
            {modal.type === 'view' && 'Product Details'}
          </Modal.Header>
          <Modal.Content>
            {modal.type === 'suspend' && (
              <p>Are you sure you want to {modal.product?.status === 'suspended' ? 'activate' : 'suspend'} product <b>{modal.product?.name}</b>?</p>
            )}
            {modal.type === 'delete' && (
              <p>Are you sure you want to <b>delete</b> product <b>{modal.product?.name}</b>? This action cannot be undone.</p>
            )}
            {modal.type === 'edit' && (
              <p>Edit functionality is not implemented in this demo.</p>
            )}
            {modal.type === 'view' && modal.product && (
              <div>
                <Image src={modal.product.image || modal.product.imageUrl} size="small" centered />
                <p><b>Product Name:</b> {modal.product.name}</p>
                <p><b>Store:</b> {modal.product.storeName}</p>
                <p><b>Category:</b> {modal.product.category}</p>
                <p><b>Price:</b> {modal.product.priceETH ? `${modal.product.priceETH} ETH` : `${modal.product.price} ETH`}</p>
                <p><b>Status:</b> {modal.product.status || 'active'}</p>
                <p><b>Created:</b> {modal.product.createdAt ? new Date(modal.product.createdAt).toLocaleDateString() : ''}</p>
              </div>
            )}
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={closeModal}>Cancel</Button>
            {(modal.type === 'suspend' || modal.type === 'delete') && (
              <Button color={modal.type === 'delete' ? 'red' : 'yellow'} onClick={confirmAction}>
                {modal.type === 'suspend' ? (modal.product?.status === 'suspended' ? 'Activate' : 'Suspend') : 'Delete'}
              </Button>
            )}
          </Modal.Actions>
        </Modal>
      </Container>
    </Layout>
  );
};

export default AdminProducts; 