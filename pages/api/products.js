import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db();
  const storesCollection = db.collection('stores');

  if (req.method === 'GET') {
    // Optionally filter by storeId
    const { storeId } = req.query;
    let products = [];
    if (storeId) {
      const store = await storesCollection.findOne({ _id: new ObjectId(storeId) });
      products = store && Array.isArray(store.products)
        ? store.products.map(p => ({
            ...p,
            storeId: store._id,
            storeName: store.storeName,
            _store: { _id: store._id, ownerAddress: store.ownerAddress, storeName: store.storeName }
          }))
        : [];
    } else {
      // Aggregate all products from all stores
      const stores = await storesCollection.find({}).toArray();
      products = stores.flatMap(s =>
        Array.isArray(s.products)
          ? s.products.map(p => ({
              ...p,
              storeId: s._id,
              storeName: s.storeName,
              _store: { _id: s._id, ownerAddress: s.ownerAddress, storeName: s.storeName }
            }))
          : []
      );
    }
    res.status(200).json(products);
  } else if (req.method === 'POST') {
    // Add a product to a store
    const { storeId, product } = req.body;
    if (!storeId || !product) {
      res.status(400).json({ message: 'storeId and product are required' });
      return;
    }
    // Always assign a unique _id to the product as a string
    const productWithId = { ...product, _id: new ObjectId().toString(), createdAt: new Date().toISOString() };
    const result = await storesCollection.updateOne(
      { _id: new ObjectId(storeId) },
      { $push: { products: productWithId } }
    );
    if (result.modifiedCount === 1) {
      res.status(201).json({ message: 'Product added' });
    } else {
      res.status(404).json({ message: 'Store not found' });
    }
  } else if (req.method === 'DELETE') {
    // Delete a product from a store
    const { storeId, productId } = req.body;
    if (!storeId || !productId) {
      res.status(400).json({ message: 'storeId and productId are required' });
      return;
    }
    // Fix: Remove product by string _id, not ObjectId
    const result = await storesCollection.updateOne(
      { _id: new ObjectId(storeId) },
      { $pull: { products: { _id: productId } } }
    );
    if (result.modifiedCount === 1) {
      res.status(200).json({ message: 'Product deleted' });
    } else {
      res.status(404).json({ message: 'Store or product not found' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 