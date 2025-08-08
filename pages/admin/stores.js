import React, { useState, useEffect } from 'react';
import { Container, Header, Segment, Message, Icon, Grid, Button, Table, Input, Label, Modal } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import MetaMaskManager from '../../components/MetaMaskManager';

const fetchStoresFromAPI = async () => {
  const res = await fetch('/api/stores');
  if (!res.ok) throw new Error('Failed to fetch stores');
  return await res.json();
};

const AdminStores = () => {
  const router = useRouter();
  const [stores, setStores] = useState([]);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState({ open: false, type: '', store: null });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const metamaskConnected = localStorage.getItem('metamaskConnected') === 'true';
    setIsMetaMaskConnected(metamaskConnected);
    // Load all stores from API
    fetchStoresFromAPI()
      .then(setStores)
      .catch(() => setStores([]));
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

  const filteredStores = stores.filter(store =>
    (store.storeName && store.storeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (store.ownerName && store.ownerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (store.address && store.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Action handlers
  const handleSuspend = (store) => setModal({ open: true, type: 'suspend', store });
  const handleDelete = (store) => setModal({ open: true, type: 'delete', store });
  const handleEdit = (store) => setModal({ open: true, type: 'edit', store });
  const handleView = (store) => setModal({ open: true, type: 'view', store });

  const confirmAction = () => {
    if (modal.type === 'suspend') {
      setStores(stores.map(s => s.id === modal.store.id ? { ...s, status: s.status === 'suspended' ? 'active' : 'suspended' } : s));
      setSuccessMsg(`Store "${modal.store.storeName}" status updated.`);
    } else if (modal.type === 'delete') {
      setStores(stores.filter(s => s.id !== modal.store.id));
      setSuccessMsg(`Store "${modal.store.storeName}" deleted.`);
    }
    setModal({ open: false, type: '', store: null });
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const closeModal = () => setModal({ open: false, type: '', store: null });

  return (
    <Layout>
      <Container>
        <Header as="h1" textAlign="center" style={{ marginTop: '2em' }}>
          <Icon name="shop" />
          Manage Stores
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
                    <Icon name="shop" />
                    All Stores ({filteredStores.length})
                  </Header>
                </Grid.Column>
                <Grid.Column>
                  <Input
                    icon="search"
                    placeholder="Search stores..."
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
                      <Table.HeaderCell>Store Name</Table.HeaderCell>
                      <Table.HeaderCell>Owner</Table.HeaderCell>
                      <Table.HeaderCell>Contact</Table.HeaderCell>
                      <Table.HeaderCell>Status</Table.HeaderCell>
                      <Table.HeaderCell>Products</Table.HeaderCell>
                      <Table.HeaderCell>Reviews</Table.HeaderCell>
                      <Table.HeaderCell>Created</Table.HeaderCell>
                      <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredStores.map((store) => (
                      <Table.Row key={store.id}>
                        <Table.Cell>
                          <Header as="h4">
                            {store.storeName}
                            <Header.Subheader>{store.description}</Header.Subheader>
                          </Header>
                        </Table.Cell>
                        <Table.Cell>
                          <div>
                            <strong>{store.ownerName}</strong>
                            <br />
                            <small>{store.address}</small>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div>
                            <Icon name="mail" /> {store.email}
                            <br />
                            <Icon name="phone" /> {store.phone}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Label color={getStatusColor(store.status)}>{store.status || 'active'}</Label>
                        </Table.Cell>
                        <Table.Cell>
                          <Icon name="box" /> {Array.isArray(store.products) ? store.products.length : 0}
                        </Table.Cell>
                        <Table.Cell>
                          <Icon name="star" /> {store.reviewCount || 0}
                        </Table.Cell>
                        <Table.Cell>
                          {store.createdAt ? new Date(store.createdAt).toLocaleDateString() : ''}
                        </Table.Cell>
                        <Table.Cell>
                          <Button.Group vertical size="tiny">
                            <Button icon="eye" content="View" onClick={() => handleView(store)} />
                            <Button icon="edit" content="Edit" onClick={() => handleEdit(store)} />
                            <Button icon="ban" content={store.status === 'suspended' ? 'Activate' : 'Suspend'} color="yellow" onClick={() => handleSuspend(store)} />
                            <Button icon="trash" content="Delete" color="red" onClick={() => handleDelete(store)} />
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
            {modal.type === 'suspend' && (modal.store?.status === 'suspended' ? 'Activate Store' : 'Suspend Store')}
            {modal.type === 'delete' && 'Delete Store'}
            {modal.type === 'edit' && 'Edit Store'}
            {modal.type === 'view' && 'Store Details'}
          </Modal.Header>
          <Modal.Content>
            {modal.type === 'suspend' && (
              <p>Are you sure you want to {modal.store?.status === 'suspended' ? 'activate' : 'suspend'} store <b>{modal.store?.storeName}</b>?</p>
            )}
            {modal.type === 'delete' && (
              <p>Are you sure you want to <b>delete</b> store <b>{modal.store?.storeName}</b>? This action cannot be undone.</p>
            )}
            {modal.type === 'edit' && (
              <p>Edit functionality is not implemented in this demo.</p>
            )}
            {modal.type === 'view' && modal.store && (
              <div>
                <p><b>Store Name:</b> {modal.store.storeName}</p>
                <p><b>Owner:</b> {modal.store.ownerName}</p>
                <p><b>Email:</b> {modal.store.email}</p>
                <p><b>Phone:</b> {modal.store.phone}</p>
                <p><b>Address:</b> {modal.store.address}</p>
                <p><b>Status:</b> {modal.store.status || 'active'}</p>
                <p><b>Products:</b> {Array.isArray(modal.store.products) ? modal.store.products.length : 0}</p>
                <p><b>Reviews:</b> {modal.store.reviewCount || 0}</p>
                <p><b>Created:</b> {modal.store.createdAt ? new Date(modal.store.createdAt).toLocaleDateString() : ''}</p>
              </div>
            )}
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={closeModal}>Cancel</Button>
            {(modal.type === 'suspend' || modal.type === 'delete') && (
              <Button color={modal.type === 'delete' ? 'red' : 'yellow'} onClick={confirmAction}>
                {modal.type === 'suspend' ? (modal.store?.status === 'suspended' ? 'Activate' : 'Suspend') : 'Delete'}
              </Button>
            )}
          </Modal.Actions>
        </Modal>
      </Container>
    </Layout>
  );
};

export default AdminStores; 