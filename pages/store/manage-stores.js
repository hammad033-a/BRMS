import React, { useState, useEffect } from 'react';
import { Container, Header, Segment, Message, Icon, Card, Grid, Button, Modal, Form, Input, Dropdown } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import MetaMaskManager from '../../components/MetaMaskManager';

const fetchStoresFromAPI = async () => {
  const res = await fetch('/api/stores');
  if (!res.ok) throw new Error('Failed to fetch stores');
  return await res.json();
};

const addStoreToAPI = async (store) => {
  const res = await fetch('/api/stores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(store),
  });
  if (!res.ok) throw new Error('Failed to add store');
  return await res.json();
};

const ManageStores = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stores, setStores] = useState([]);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    storeName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    password: '',
    confirmPassword: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteStoreId, setDeleteStoreId] = useState(null);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [changeLogoModalOpen, setChangeLogoModalOpen] = useState(false);
  const [logoStoreId, setLogoStoreId] = useState(null);
  const [newLogo, setNewLogo] = useState('');
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoError, setLogoError] = useState('');
  const [editStoreModalOpen, setEditStoreModalOpen] = useState(false);
  const [editStore, setEditStore] = useState({ storeName: '', email: '', logo: '', address: '', _id: '' });
  const [editStoreLoading, setEditStoreLoading] = useState(false);
  const [editStoreError, setEditStoreError] = useState('');
  // Add state for product deletion
  const [deleteProductModalOpen, setDeleteProductModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteProductLoading, setDeleteProductLoading] = useState(false);
  const [deleteProductError, setDeleteProductError] = useState('');
  // Add state for delete products modal
  const [deleteProductsModalOpen, setDeleteProductsModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [deleteProductsLoading, setDeleteProductsLoading] = useState(false);
  const [deleteProductsError, setDeleteProductsError] = useState('');
  // Remove sidebar state and mouse event logic

  useEffect(() => {
    const metamaskConnected = localStorage.getItem('metamaskConnected') === 'true';
    setIsMetaMaskConnected(metamaskConnected);
    // Redirect to login if not logged in
    const email = localStorage.getItem('storeOwnerEmail');
    if (!email) {
      router.push('/store/login');
      return;
    }
      fetchStores();
  }, []);

  // Helper to get logged-in email
  const getLoggedInEmail = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('storeOwnerEmail');
    }
    return null;
  };

  const fetchStores = async () => {
    setIsLoading(true);
    setError('');
    try {
      const allStores = await fetchStoresFromAPI();
      // Filter stores by logged-in email and remove unwanted stores
      const email = getLoggedInEmail();
      const filteredStores = email ? allStores.filter(store => store.email === email && store.storeName !== "HK's store" && store.storeName !== "hamoodi store") : allStores.filter(store => store.storeName !== "HK's store" && store.storeName !== "hamoodi store");
      setStores(filteredStores);
    } catch (err) {
      setError('Failed to fetch stores from server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterStore = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      setRegisterLoading(false);
      return;
    }

    try {
      // Create new store object
      const newStore = {
          storeName: registerForm.storeName,
          ownerName: registerForm.ownerName,
          email: registerForm.email,
        phone: registerForm.phone,
          address: registerForm.address,
          description: registerForm.description,
        createdAt: new Date().toISOString(),
        };
      await addStoreToAPI(newStore);
      await fetchStores();
        setSuccess('Store registered successfully!');
        setShowRegisterModal(false);
        setRegisterForm({
          storeName: '',
          ownerName: '',
          email: '',
          phone: '',
          address: '',
          description: '',
          password: '',
          confirmPassword: ''
        });
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
      console.error(err);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleStoreClick = (store) => {
    router.push(`/store/${store._id}/products`);
  };

  const handleAddProduct = (storeId) => {
    router.push(`/store/${storeId}/add-product`);
  };

  const handleOpenDeleteModal = (storeId) => {
    setDeleteStoreId(storeId);
    setDeleteModalOpen(true);
    setDeleteEmail('');
    setDeletePassword('');
    setDeleteError('');
  };

  const handleDeleteStore = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/stores?id=${deleteStoreId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: deleteEmail, password: deletePassword })
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteModalOpen(false);
        setStores(stores.filter(s => s._id !== deleteStoreId));
      } else {
        setDeleteError(data.message || 'Delete failed');
      }
    } catch (err) {
      setDeleteError('An error occurred.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenChangeLogoModal = (storeId) => {
    setLogoStoreId(storeId);
    setChangeLogoModalOpen(true);
    setNewLogo('');
    setLogoError('');
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangeLogo = async () => {
    setLogoLoading(true);
    setLogoError('');
    try {
      const res = await fetch(`/api/stores?id=${logoStoreId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo: newLogo })
      });
      if (!res.ok) {
        const data = await res.json();
        setLogoError(data.message || 'Failed to update logo');
      } else {
        setChangeLogoModalOpen(false);
        await fetchStores();
      }
    } catch (err) {
      setLogoError('An error occurred while updating the logo.');
    } finally {
      setLogoLoading(false);
    }
  };

  const handleOpenEditStoreModal = (store) => {
    setEditStore({ storeName: store.storeName, email: store.email, logo: store.logo || '', address: store.address || '', _id: store._id });
    setEditStoreModalOpen(true);
    setEditStoreError('');
  };

  const handleEditStoreLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditStore(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditStoreSubmit = async () => {
    setEditStoreLoading(true);
    setEditStoreError('');
    try {
      const res = await fetch(`/api/stores?id=${editStore._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeName: editStore.storeName, email: editStore.email, logo: editStore.logo, address: editStore.address })
      });
      if (!res.ok) {
        const data = await res.json();
        setEditStoreError(data.message || 'Failed to update store info');
      } else {
        setEditStoreModalOpen(false);
        await fetchStores();
      }
    } catch (err) {
      setEditStoreError('An error occurred while updating the store info.');
    } finally {
      setEditStoreLoading(false);
    }
  };

  // Handler to open delete product modal
  const handleOpenDeleteProductModal = (storeId, product) => {
    setProductToDelete({ storeId, product });
    setDeleteProductModalOpen(true);
    setDeleteProductError('');
  };
  // Handler to delete product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleteProductLoading(true);
    setDeleteProductError('');
    try {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId: productToDelete.storeId, productId: productToDelete.product._id })
      });
      if (!res.ok) {
        const data = await res.json();
        setDeleteProductError(data.message || 'Failed to delete product');
      } else {
        setDeleteProductModalOpen(false);
        setProductToDelete(null);
        await fetchStores();
      }
    } catch (err) {
      setDeleteProductError('An error occurred while deleting the product.');
    } finally {
      setDeleteProductLoading(false);
    }
  };

  // Handler to open delete products modal
  const handleOpenDeleteProductsModal = () => {
    setSelectedProducts([]);
    setDeleteProductsModalOpen(true);
    setDeleteProductsError('');
  };
  // Handler to select/deselect products
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };
  // Handler to delete selected products
  const handleDeleteSelectedProducts = async () => {
    if (!stores[0] || selectedProducts.length === 0) return;
    setDeleteProductsLoading(true);
    setDeleteProductsError('');
    try {
      for (const productId of selectedProducts) {
        await fetch('/api/products', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storeId: stores[0]._id, productId })
        });
      }
      setDeleteProductsModalOpen(false);
      setSelectedProducts([]);
      await fetchStores();
    } catch (err) {
      setDeleteProductsError('An error occurred while deleting products.');
    } finally {
      setDeleteProductsLoading(false);
    }
  };

  // Add store logout handler
  const handleStoreLogout = () => {
    localStorage.removeItem('storeOwnerEmail');
    localStorage.removeItem('storeId');
    // Add any other store-related keys if needed
    router.push('/dashboard');
  };

  // ETH to PKR conversion rate (update as needed)
  const ETH_TO_PKR = 800000;

  return (
    <Layout>
      <Container>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1em', marginBottom: '1.5em' }}>
          <Button color="teal" size="large" style={{ boxShadow: '0 8px 32px rgba(77,184,255,0.25)', borderRadius: 12, fontWeight: 'bold', fontSize: '1.1em', transform: 'perspective(400px) rotateX(8deg)', transition: 'all 0.3s cubic-bezier(.4,2,.6,1)' }} onClick={() => router.push('/admin/dashboard')}>
            <Icon name="dashboard" /> Admin Dashboard
          </Button>
          <Dropdown
            text="Store Actions"
            icon="bars"
            floating
            labeled
            button
            className="icon"
            style={{ fontWeight: 'bold', fontSize: '1.1em', borderRadius: 12 }}
          >
            <Dropdown.Menu>
              <Dropdown.Item icon="add" text="Add Product" onClick={() => handleAddProduct(stores[0]?._id)} />
              <Dropdown.Item icon="edit" text="Edit Store Info" onClick={() => handleOpenEditStoreModal(stores[0])} />
              <Dropdown.Item icon="trash" text="Delete Store" onClick={() => handleOpenDeleteModal(stores[0]?._id)} />
              <Dropdown.Item icon="trash alternate" text="Delete Product(s)" onClick={handleOpenDeleteProductsModal} />
              <Dropdown.Divider />
              <Dropdown.Item icon="sign out" text="Logout Store" onClick={handleStoreLogout} />
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <Header as="h1" textAlign="center" style={{ marginTop: '2em', color: 'white' }}>
          <Icon name="shop" />
          Manage My Stores
        </Header>

        <Segment raised style={{ maxWidth: '1000px', margin: '2em auto', padding: '2em', backgroundColor: 'rgba(30, 30, 30, 0.8)' }}>
          {/* MetaMaskManager removed */}
          {/* <MetaMaskManager /> */}
          
<<<<<<< HEAD
          {!isMetaMaskConnected && (
            <Message warning>
              <Message.Header>MetaMask Required</Message.Header>
              <p>Please connect your MetaMask wallet to manage your stores.</p>
            </Message>
          )}
=======
          {/* MetaMask is not required for managing stores via email/password. */}
>>>>>>> 7e31841 (Initial project upload)

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

<<<<<<< HEAD
          {isMetaMaskConnected && (
            <div>
=======
          <div>
>>>>>>> 7e31841 (Initial project upload)
              <Header as="h2" style={{ textAlign: 'center', fontSize: '2.2em', color: 'white', marginBottom: '1em', marginTop: '1em', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ display: 'inline-block', marginRight: '0.5em', marginBottom: '0.5em' }}>
                  {/* 3D animated logo in header */}
                  {stores.length > 0 && stores[0].logo ? (
                    <img src={stores[0].logo} alt="Store Logo" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', boxShadow: '0 8px 32px rgba(77,184,255,0.25)', transition: 'transform 0.5s cubic-bezier(.4,2,.6,1), box-shadow 0.5s', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15) rotateY(12deg)'; e.currentTarget.style.boxShadow = '0 24px 64px rgba(77,184,255,0.35)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(77,184,255,0.25)'; }}
                    />
                  ) : (
                    <Icon name="shop" size="huge" color="blue" style={{ animation: 'shop-bounce 2s infinite', filter: 'drop-shadow(0 8px 32px #4db8ff88)' }} />
                  )}
                </span>
                <span style={{ display: 'inline-block' }}>My Stores</span>
                </Header>
              {/* Product cards with animation */}
                <Grid columns={2} stackable>
                  {stores.map((store) => (
                  <Grid.Column key={store._id}>
                    <div style={{ position: 'relative' }}>
                      <Card fluid style={{
                        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                        borderRadius: 22,
                        marginBottom: '2em',
                        background: 'rgba(30,30,30,0.45)',
                        border: '1.5px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        transition: 'transform 0.3s cubic-bezier(.4,2,.6,1), box-shadow 0.3s'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03) rotateY(2deg)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.32)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)'; }}
                      >
                        <Card.Content>
                          {/* Store logo on each card with 3D animation */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1em', marginBottom: '0.5em' }}>
                            {store.logo ? (
                              <img src={store.logo} alt="Store Logo" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: '50%', boxShadow: '0 6px 24px rgba(77,184,255,0.25)', transition: 'transform 0.4s cubic-bezier(.4,2,.6,1), box-shadow 0.4s', cursor: 'pointer' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12) rotateY(10deg)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(77,184,255,0.35)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(77,184,255,0.25)'; }}
                              />
                            ) : (
                              <Icon name="shop" size="large" color="blue" style={{ filter: 'drop-shadow(0 4px 16px #4db8ff88)' }} />
                            )}
                            <div>
                              <Card.Header style={{ color: 'white', fontWeight: 'bold', fontSize: '1.3em' }}>{store.storeName}</Card.Header>
                              <Card.Meta style={{ color: '#ccc' }}>{store.ownerName}</Card.Meta>
                            </div>
                          </div>
                          <Card.Description style={{ color: 'white' }}>{store.description}</Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                            <span>
                              <Icon name="mail" />
                              {store.email}
                            </span>
                            <span>
                              <Icon name="map marker alternate" />
                              {store.address}
                            </span>
                          </div>
                        </Card.Content>
                        {/* Animated product cards */}
                        <Card.Content extra>
                          <Header as="h4" style={{ color: 'white', marginBottom: '0.5em' }}>Products</Header>
                          <Grid columns={2} stackable>
                            {(store.products || []).map((product, idx) => (
                              <Grid.Column key={product._id || product.id}>
                                <div
                                  style={{
                                    borderRadius: 16,
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                                    background: 'rgba(30,30,30,0.35)',
                                    border: '1.2px solid rgba(255,255,255,0.07)',
                                    backdropFilter: 'blur(8px)',
                                    WebkitBackdropFilter: 'blur(8px)',
                                    marginBottom: '1em',
                                    padding: '1em',
                                    transition: 'transform 0.3s cubic-bezier(.4,2,.6,1), box-shadow 0.3s',
                                    cursor: 'pointer',
                                    animation: 'fadeInUp 0.7s cubic-bezier(.4,2,.6,1)',
                                  }}
                                  onClick={() => router.push(`/products/${product._id || product.id}`)}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.04) rotate(1deg)';
                                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.10)';
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
<<<<<<< HEAD
                                    {product.image ? (
                                      <img src={product.image} alt={product.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 12 }} />
                                    ) : (
                                      <Icon name="cube" size="large" />
                                    )}
=======
                                    {(() => {
                                      // Collect possible image sources in a robust way
                                      const candidates = [];
                                      const pushIfString = (v) => { if (typeof v === 'string' && v.trim()) candidates.push(v); };
                                      // Handle array or single string in `images`
                                      if (Array.isArray(product.images)) {
                                        for (const it of product.images) {
                                          if (typeof it === 'string') {
                                            pushIfString(it);
                                          } else if (it && typeof it === 'object') {
                                            // Common keys for various uploaders (Cloudinary, file readers, etc.)
                                            pushIfString(it.url || it.secure_url || it.src || it.image || it.imageUrl || it.imageURL || it.image_url || it.path || it.dataUrl || it.data || it.base64);
                                          }
                                        }
                                      } else if (typeof product.images === 'string') {
                                        pushIfString(product.images);
                                      }
                                      // Also check common singular fields
                                      const singularFields = ['image', 'imageUrl', 'imageURL', 'image_url', 'thumbnail', 'photo', 'picture', 'img', 'url'];
                                      for (const key of singularFields) pushIfString(product && product[key]);
                                      const imgSrc = candidates[0];
                                      return imgSrc ? (
                                        <img src={imgSrc} alt={product.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 12 }} />
                                      ) : (
                                        <Icon name="image outline" size="large" />
                                      );
                                    })()}
>>>>>>> 7e31841 (Initial project upload)
                                    <div>
                                      <div style={{ fontWeight: 'bold', color: 'white' }}>{product.name}</div>
                                      <div style={{ color: '#ccc' }}>{product.category}</div>
                                      <div style={{ color: '#fff', fontWeight: 600 }}>
                                        PKR {product.price ? parseFloat(product.price).toLocaleString('en-PK', { maximumFractionDigits: 0 }) : '0'}
                                      </div>
                                    </div>
                                  </div>
                          </div>
                              </Grid.Column>
                            ))}
                          </Grid>
                        </Card.Content>
                      </Card>
                      {/* 3D Animated Action Buttons below the card */}
                      {/* <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5em', marginTop: '-1.2em', marginBottom: '2.5em' }}>
                        <button className="action-3d-btn green" onClick={() => handleAddProduct(store._id)}>
                          <Icon name="add" /> Add Product
                        </button>
                        <button className="action-3d-btn blue" onClick={() => handleOpenEditStoreModal(store)}>
                          <Icon name="edit" /> Edit Store Info
                        </button>
                        <button className="action-3d-btn red" onClick={() => handleOpenDeleteModal(store._id)}>
                          <Icon name="trash" /> Delete Store
                        </button>
                      </div> */}
                    </div>
                    </Grid.Column>
                  ))}
                </Grid>
              {/* Delete Store Modal */}
              <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} size="tiny">
                <Modal.Header>Delete Store</Modal.Header>
                <Modal.Content>
                  <Form>
                    <Form.Input
                      label="Email"
                      type="email"
                      value={deleteEmail}
                      onChange={e => setDeleteEmail(e.target.value)}
                      required
                    />
                    <Form.Input
                      label="Password"
                      type="password"
                      value={deletePassword}
                      onChange={e => setDeletePassword(e.target.value)}
                      required
                    />
                    {deleteError && <Message negative>{deleteError}</Message>}
                  </Form>
                </Modal.Content>
                <Modal.Actions>
                  <Button onClick={() => setDeleteModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button color="red" loading={deleteLoading} onClick={handleDeleteStore}>
                    Confirm Delete
                  </Button>
                </Modal.Actions>
              </Modal>
              {/* Change Logo Modal */}
              <Modal open={changeLogoModalOpen} onClose={() => setChangeLogoModalOpen(false)} size="tiny">
                <Modal.Header>Change Store Logo</Modal.Header>
                <Modal.Content>
                  <Form loading={logoLoading} error={!!logoError}>
                    <Form.Input
                      label="Upload New Logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                    />
                    {newLogo && (
                      <img src={newLogo} alt="New Logo Preview" style={{ marginTop: 10, maxHeight: 100, borderRadius: 12 }} />
                    )}
                    {logoError && <Message negative>{logoError}</Message>}
                  </Form>
                </Modal.Content>
                <Modal.Actions>
                  <Button onClick={() => setChangeLogoModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button color="blue" loading={logoLoading} disabled={!newLogo} onClick={handleChangeLogo}>
                    Update Logo
                  </Button>
                </Modal.Actions>
              </Modal>
              {/* Edit Store Info Modal */}
              <Modal open={editStoreModalOpen} onClose={() => setEditStoreModalOpen(false)} size="tiny">
                <Modal.Header>Edit Store Info</Modal.Header>
                <Modal.Content>
                  <Form loading={editStoreLoading} error={!!editStoreError}>
                    <Form.Input
                      label="Store Name"
                      value={editStore.storeName}
                      onChange={e => setEditStore(prev => ({ ...prev, storeName: e.target.value }))}
                      required
                    />
                    <Form.Input
                      label="Store Email"
                      type="email"
                      value={editStore.email}
                      onChange={e => setEditStore(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                    <Form.TextArea
                      label="Store Address"
                      value={editStore.address || ''}
                      onChange={e => setEditStore(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter your store address"
                      required
                    />
                    <Form.Input
                      label="Store Logo"
                      type="file"
                      accept="image/*"
                      onChange={handleEditStoreLogoChange}
                    />
                    {editStore.logo && (
                      <img src={editStore.logo} alt="New Logo Preview" style={{ marginTop: 10, maxHeight: 100, borderRadius: 12 }} />
                    )}
                    {editStoreError && <Message negative>{editStoreError}</Message>}
                  </Form>
                </Modal.Content>
                <Modal.Actions>
                  <Button onClick={() => setEditStoreModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button color="blue" loading={editStoreLoading} onClick={handleEditStoreSubmit}>
                    Update Store Info
                  </Button>
                </Modal.Actions>
              </Modal>
              {/* Delete Product Modal */}
              <Modal open={deleteProductModalOpen} onClose={() => setDeleteProductModalOpen(false)} size="tiny">
                <Modal.Header>Delete Product</Modal.Header>
                <Modal.Content>
                  <p>Are you sure you want to delete this product?</p>
                  {deleteProductError && <Message negative>{deleteProductError}</Message>}
                </Modal.Content>
                <Modal.Actions>
                  <Button onClick={() => setDeleteProductModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button color="red" loading={deleteProductLoading} onClick={handleDeleteProduct}>
                    Confirm Delete
                  </Button>
                </Modal.Actions>
              </Modal>
              {/* Delete Products Modal */}
              <Modal open={deleteProductsModalOpen} onClose={() => setDeleteProductsModalOpen(false)} size="tiny">
                <Modal.Header>Delete Product(s)</Modal.Header>
                <Modal.Content>
                  <p>Select the products you want to delete:</p>
                  {stores[0] && stores[0].products && stores[0].products.length > 0 ? (
                    <Form>
                      {stores[0].products.map(product => (
                        <Form.Field key={product._id}>
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => handleSelectProduct(product._id)}
                            id={`delete-product-${product._id}`}
                          />
                          <label htmlFor={`delete-product-${product._id}`} style={{ marginLeft: 8 }}>
                            {product.name} ({product.category})
                          </label>
                        </Form.Field>
                      ))}
                    </Form>
                  ) : (
                    <p>No products found.</p>
                  )}
                  {deleteProductsError && <Message negative>{deleteProductsError}</Message>}
                </Modal.Content>
                <Modal.Actions>
                  <Button onClick={() => setDeleteProductsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button color="red" loading={deleteProductsLoading} disabled={selectedProducts.length === 0} onClick={handleDeleteSelectedProducts}>
                    Delete Selected
                  </Button>
                </Modal.Actions>
              </Modal>
            </div>
<<<<<<< HEAD
          )}
=======
>>>>>>> 7e31841 (Initial project upload)
        </Segment>

        {/* Register Store Modal */}
        <Modal
          open={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          size="small"
        >
          <Modal.Header>Register New Store</Modal.Header>
          <Modal.Content>
            <Form onSubmit={handleRegisterStore} loading={registerLoading}>
              <Form.Field>
                <label>Store Name</label>
                <Input
                  name="storeName"
                  value={registerForm.storeName}
                  onChange={(e, { name, value }) => setRegisterForm(prev => ({ ...prev, [name]: value }))}
                  placeholder="Enter your store name"
                  required
                />
              </Form.Field>

              <Form.Field>
                <label>Owner Name</label>
                <Input
                  name="ownerName"
                  value={registerForm.ownerName}
                  onChange={(e, { name, value }) => setRegisterForm(prev => ({ ...prev, [name]: value }))}
                  placeholder="Enter owner's name"
                  required
                />
              </Form.Field>

              <Form.Field>
                <label>Email</label>
                <Input
                  name="email"
                  type="email"
                  value={registerForm.email}
                  onChange={(e, { name, value }) => setRegisterForm(prev => ({ ...prev, [name]: value }))}
                  placeholder="Enter your email"
                  required
                />
              </Form.Field>

              <Form.Field>
                <label>Phone Number</label>
                <Input
                  name="phone"
                  value={registerForm.phone}
                  onChange={(e, { name, value }) => setRegisterForm(prev => ({ ...prev, [name]: value }))}
                  placeholder="Enter your phone number"
                  required
                />
              </Form.Field>

              <Form.Field>
                <label>Store Address</label>
                <Form.TextArea
                  name="address"
                  value={registerForm.address}
                  onChange={(e, { name, value }) => setRegisterForm(prev => ({ ...prev, [name]: value }))}
                  placeholder="Enter your store address"
                  required
                />
              </Form.Field>

              <Form.Field>
                <label>Store Description</label>
                <Form.TextArea
                  name="description"
                  value={registerForm.description}
                  onChange={(e, { name, value }) => setRegisterForm(prev => ({ ...prev, [name]: value }))}
                  placeholder="Describe your store and what you sell"
                  required
                />
              </Form.Field>

              <Form.Field>
                <label>Password</label>
                <Input
                  name="password"
                  type="password"
                  value={registerForm.password}
                  onChange={(e, { name, value }) => setRegisterForm(prev => ({ ...prev, [name]: value }))}
                  placeholder="Enter password"
                  required
                />
              </Form.Field>

              <Form.Field>
                <label>Confirm Password</label>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e, { name, value }) => setRegisterForm(prev => ({ ...prev, [name]: value }))}
                  placeholder="Confirm password"
                  required
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={() => setShowRegisterModal(false)}>
              Cancel
            </Button>
            <Button primary onClick={handleRegisterStore} loading={registerLoading}>
              Register Store
            </Button>
          </Modal.Actions>
        </Modal>
      </Container>
      <style jsx global>{`
        @keyframes shop-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .action-3d-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5em;
          font-size: 1.08em;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          padding: 0.7em 1.5em;
          margin: 0 0.2em;
          box-shadow: 0 4px 18px rgba(77,184,255,0.13);
          background: #fff;
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(.4,2,.6,1), box-shadow 0.25s, background 0.2s;
        }
        .action-3d-btn.green { background: #21ba45; color: #fff; }
        .action-3d-btn.blue { background: #2185d0; color: #fff; }
        .action-3d-btn.red { background: #db2828; color: #fff; }
        .action-3d-btn:hover {
          transform: scale(1.12) rotateY(8deg);
          box-shadow: 0 12px 36px rgba(77,184,255,0.25);
          background: #f4faff;
          z-index: 2;
        }
      `}</style>
    </Layout>
  );
};

export default ManageStores; 