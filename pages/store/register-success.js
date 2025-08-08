import React, { useState, useEffect } from 'react';
import { Container, Header, Segment, Message, Icon, Button, Grid } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

const StoreRegisterSuccess = () => {
  const router = useRouter();
  const [storeData, setStoreData] = useState(null);

  useEffect(() => {
    // Get store data from localStorage or URL params
    const storedStoreData = localStorage.getItem('newStoreData');
    if (storedStoreData) {
      setStoreData(JSON.parse(storedStoreData));
      localStorage.removeItem('newStoreData'); // Clean up
    }
  }, []);

  const handleManageStores = () => {
    router.push('/store/manage-stores');
  };

  const handleAddProducts = () => {
    if (storeData && storeData._id) {
      router.push(`/store/${storeData._id}/add-product`);
    } else {
      router.push('/store/manage-stores');
    }
  };

  const handleViewStore = () => {
    if (storeData && storeData._id) {
      router.push(`/store/${storeData._id}/products`);
    } else {
      router.push('/store/manage-stores');
    }
  };

  return (
    <Layout>
      <Container>
        <Header as="h1" textAlign="center" style={{ marginTop: '2em' }}>
          <Icon name="check circle" color="green" />
          Store Registration Successful!
        </Header>

        <Segment raised style={{ maxWidth: '800px', margin: '2em auto', padding: '2em' }}>
          <Message positive>
            <Message.Header>Congratulations!</Message.Header>
            <p>Your store has been successfully registered on our blockchain platform.</p>
          </Message>

          {storeData && (
            <Grid columns={2} stackable style={{ marginTop: '2em' }}>
              <Grid.Column>
                <Header as="h3">
                  <Icon name="shop" />
                  Store Details
                </Header>
                <p><strong>Store Name:</strong> {storeData.storeName}</p>
                <p><strong>Owner:</strong> {storeData.ownerName}</p>
                <p><strong>Email:</strong> {storeData.email}</p>
                <p><strong>Address:</strong> {storeData.address}</p>
                <p><strong>Description:</strong> {storeData.description}</p>
              </Grid.Column>
              <Grid.Column>
                <Header as="h3">
                  <Icon name="ethereum" />
                  Blockchain Verified
                </Header>
                <p>Your store is now registered on the Ethereum blockchain, ensuring transparency and trust.</p>
                <p>All transactions and reviews will be immutably recorded.</p>
              </Grid.Column>
            </Grid>
          )}

          <div style={{ marginTop: '2em', textAlign: 'center' }}>
            <Header as="h3">
              What's Next?
            </Header>
            <p>Start building your store by adding products and managing your inventory.</p>
            
            <Grid columns={3} stackable style={{ marginTop: '1em' }}>
              <Grid.Column>
                <Button
                  color="blue"
                  fluid
                  size="large"
                  onClick={handleManageStores}
                >
                  <Icon name="settings" />
                  Manage Stores
                </Button>
              </Grid.Column>
              <Grid.Column>
                <Button
                  color="green"
                  fluid
                  size="large"
                  onClick={handleAddProducts}
                >
                  <Icon name="add" />
                  Add Products
                </Button>
              </Grid.Column>
              <Grid.Column>
                <Button
                  color="orange"
                  fluid
                  size="large"
                  onClick={handleViewStore}
                >
                  <Icon name="eye" />
                  View Store
                </Button>
              </Grid.Column>
            </Grid>
          </div>

          <div style={{ marginTop: '2em', textAlign: 'center' }}>
            <Button
              color="grey"
              onClick={() => router.push('/')}
            >
              <Icon name="home" />
              Back to Home
            </Button>
          </div>
        </Segment>
      </Container>
    </Layout>
  );
};

export default StoreRegisterSuccess; 