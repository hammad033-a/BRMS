import React, { useState, useEffect } from 'react';
import { Container, Header, Segment, Message, Icon, Grid, Button, Table, Input, Label, Image, Modal } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import MetaMaskManager from '../../components/MetaMaskManager';

const initialUsers = [
  {
    id: '1',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    email: 'john.doe@example.com',
    username: 'john_doe',
    role: 'buyer',
    status: 'active',
    joinDate: '2024-01-15',
    totalPurchases: 12,
    totalReviews: 8,
    lastActive: '2024-01-20',
    avatar: 'https://img.icons8.com/color/96/000000/user.png'
  },
  {
    id: '2',
    walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    email: 'jane.smith@example.com',
    username: 'jane_smith',
    role: 'store_owner',
    status: 'active',
    joinDate: '2024-01-14',
    totalPurchases: 0,
    totalReviews: 0,
    lastActive: '2024-01-19',
    avatar: 'https://img.icons8.com/color/96/000000/user-female.png'
  },
  {
    id: '3',
    walletAddress: '0x567890abcdef1234567890abcdef1234567890ab',
    email: 'mike.johnson@example.com',
    username: 'mike_j',
    role: 'buyer',
    status: 'active',
    joinDate: '2024-01-13',
    totalPurchases: 5,
    totalReviews: 3,
    lastActive: '2024-01-18',
    avatar: 'https://img.icons8.com/color/96/000000/user-male.png'
  },
  {
    id: '4',
    walletAddress: '0xdef1234567890abcdef1234567890abcdef12345',
    email: 'sarah.wilson@example.com',
    username: 'sarah_w',
    role: 'store_owner',
    status: 'pending',
    joinDate: '2024-01-12',
    totalPurchases: 0,
    totalReviews: 0,
    lastActive: '2024-01-17',
    avatar: 'https://img.icons8.com/color/96/000000/user-female.png'
  },
  {
    id: '5',
    walletAddress: '0x234567890abcdef1234567890abcdef1234567890',
    email: 'tom.brown@example.com',
    username: 'tom_brown',
    role: 'buyer',
    status: 'suspended',
    joinDate: '2024-01-11',
    totalPurchases: 2,
    totalReviews: 1,
    lastActive: '2024-01-16',
    avatar: 'https://img.icons8.com/color/96/000000/user-male.png'
  },
  {
    id: '6',
    walletAddress: '0xbcdef1234567890abcdef1234567890abcdef1234',
    email: 'emma.davis@example.com',
    username: 'emma_d',
    role: 'buyer',
    status: 'active',
    joinDate: '2024-01-10',
    totalPurchases: 8,
    totalReviews: 6,
    lastActive: '2024-01-20',
    avatar: 'https://img.icons8.com/color/96/000000/user-female.png'
  },
  {
    id: '7',
    walletAddress: '0x4567890abcdef1234567890abcdef1234567890ab',
    email: 'david.lee@example.com',
    username: 'david_lee',
    role: 'store_owner',
    status: 'active',
    joinDate: '2024-01-09',
    totalPurchases: 0,
    totalReviews: 0,
    lastActive: '2024-01-19',
    avatar: 'https://img.icons8.com/color/96/000000/user-male.png'
  }
];

const AdminUsers = () => {
  const router = useRouter();
  const [error, setError] = useState('');
  const [users, setUsers] = useState(initialUsers);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState({ open: false, type: '', user: null });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const metamaskConnected = localStorage.getItem('metamaskConnected') === 'true';
    setIsMetaMaskConnected(metamaskConnected);
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
  const getRoleColor = (role) => {
    switch (role) {
      case 'store_owner': return 'blue';
      case 'buyer': return 'green';
      case 'admin': return 'purple';
      default: return 'grey';
    }
  };
  const getRoleDisplay = (role) => {
    switch (role) {
      case 'store_owner': return 'Store Owner';
      case 'buyer': return 'Buyer';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Action handlers
  const handleSuspend = (user) => setModal({ open: true, type: 'suspend', user });
  const handleDelete = (user) => setModal({ open: true, type: 'delete', user });
  const handleEdit = (user) => setModal({ open: true, type: 'edit', user });
  const handleView = (user) => setModal({ open: true, type: 'view', user });

  const confirmAction = () => {
    if (modal.type === 'suspend') {
      setUsers(users.map(u => u.id === modal.user.id ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' } : u));
      setSuccessMsg(`User "${modal.user.username}" status updated.`);
    } else if (modal.type === 'delete') {
      setUsers(users.filter(u => u.id !== modal.user.id));
      setSuccessMsg(`User "${modal.user.username}" deleted.`);
    }
    setModal({ open: false, type: '', user: null });
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const closeModal = () => setModal({ open: false, type: '', user: null });

  return (
    <Layout>
      <Container>
        <Header as="h1" textAlign="center" style={{ marginTop: '2em' }}>
          <Icon name="users" />
          Manage Users
        </Header>
        <Segment raised style={{ maxWidth: '1400px', margin: '2em auto', padding: '2em' }}>
          <MetaMaskManager />
          {!isMetaMaskConnected && (
            <Message warning>
              <Message.Header>MetaMask Required</Message.Header>
              <p>Please connect your MetaMask wallet to access the admin panel.</p>
            </Message>
          )}
          {error && (
            <Message negative>
              <Message.Header>Error</Message.Header>
              <p>{error}</p>
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
                    <Icon name="users" />
                    All Users ({filteredUsers.length})
                  </Header>
                </Grid.Column>
                <Grid.Column>
                  <Input
                    icon="search"
                    placeholder="Search users..."
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
                      <Table.HeaderCell>User</Table.HeaderCell>
                      <Table.HeaderCell>Wallet Address</Table.HeaderCell>
                      <Table.HeaderCell>Contact</Table.HeaderCell>
                      <Table.HeaderCell>Role</Table.HeaderCell>
                      <Table.HeaderCell>Status</Table.HeaderCell>
                      <Table.HeaderCell>Activity</Table.HeaderCell>
                      <Table.HeaderCell>Joined</Table.HeaderCell>
                      <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredUsers.map((user) => (
                      <Table.Row key={user.id}>
                        <Table.Cell>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Image src={user.avatar} size="tiny" circular style={{ marginRight: '1em' }} />
                            <div>
                              <strong>{user.username}</strong>
                              <br />
                              <small>ID: {user.id}</small>
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <code style={{ fontSize: '0.8em' }}>
                            {user.walletAddress.substring(0, 10)}...{user.walletAddress.substring(user.walletAddress.length - 8)}
                          </code>
                        </Table.Cell>
                        <Table.Cell>
                          <div>
                            <Icon name="mail" /> {user.email}
                            <br />
                            <small>Last active: {new Date(user.lastActive).toLocaleDateString()}</small>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Label color={getRoleColor(user.role)}>{getRoleDisplay(user.role)}</Label>
                        </Table.Cell>
                        <Table.Cell>
                          <Label color={getStatusColor(user.status)}>{user.status}</Label>
                        </Table.Cell>
                        <Table.Cell>
                          <div>
                            <Icon name="shopping cart" /> {user.totalPurchases} purchases
                            <br />
                            <Icon name="star" /> {user.totalReviews} reviews
                          </div>
                        </Table.Cell>
                        <Table.Cell>{new Date(user.joinDate).toLocaleDateString()}</Table.Cell>
                        <Table.Cell>
                          <Button.Group vertical size="tiny">
                            <Button icon="eye" content="View" onClick={() => handleView(user)} />
                            <Button icon="edit" content="Edit" onClick={() => handleEdit(user)} />
                            <Button icon="ban" content={user.status === 'suspended' ? 'Activate' : 'Suspend'} color="yellow" onClick={() => handleSuspend(user)} />
                            <Button icon="trash" content="Delete" color="red" onClick={() => handleDelete(user)} />
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
            {modal.type === 'suspend' && (modal.user?.status === 'suspended' ? 'Activate User' : 'Suspend User')}
            {modal.type === 'delete' && 'Delete User'}
            {modal.type === 'edit' && 'Edit User'}
            {modal.type === 'view' && 'User Details'}
          </Modal.Header>
          <Modal.Content>
            {modal.type === 'suspend' && (
              <p>Are you sure you want to {modal.user?.status === 'suspended' ? 'activate' : 'suspend'} user <b>{modal.user?.username}</b>?</p>
            )}
            {modal.type === 'delete' && (
              <p>Are you sure you want to <b>delete</b> user <b>{modal.user?.username}</b>? This action cannot be undone.</p>
            )}
            {modal.type === 'edit' && (
              <p>Edit functionality is not implemented in this demo.</p>
            )}
            {modal.type === 'view' && modal.user && (
              <div>
                <Image src={modal.user.avatar} size="small" circular centered />
                <p><b>Username:</b> {modal.user.username}</p>
                <p><b>Email:</b> {modal.user.email}</p>
                <p><b>Wallet:</b> {modal.user.walletAddress}</p>
                <p><b>Role:</b> {getRoleDisplay(modal.user.role)}</p>
                <p><b>Status:</b> {modal.user.status}</p>
                <p><b>Purchases:</b> {modal.user.totalPurchases}</p>
                <p><b>Reviews:</b> {modal.user.totalReviews}</p>
                <p><b>Joined:</b> {new Date(modal.user.joinDate).toLocaleDateString()}</p>
                <p><b>Last Active:</b> {new Date(modal.user.lastActive).toLocaleDateString()}</p>
              </div>
            )}
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={closeModal}>Cancel</Button>
            {(modal.type === 'suspend' || modal.type === 'delete') && (
              <Button color={modal.type === 'delete' ? 'red' : 'yellow'} onClick={confirmAction}>
                {modal.type === 'suspend' ? (modal.user?.status === 'suspended' ? 'Activate' : 'Suspend') : 'Delete'}
              </Button>
            )}
          </Modal.Actions>
        </Modal>
      </Container>
    </Layout>
  );
};

export default AdminUsers; 