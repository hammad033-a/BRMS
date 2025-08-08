import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { productId } = req.query;

  if (!productId) {
    return res.status(400).json({ message: 'A valid Product ID is required' });
  }

  try {
    const client = await clientPromise;
    // Try both 'BRMS' and 'brms'
    let db = client.db('BRMS');
    let store = await db.collection('stores').findOne({
      $or: [
        { 'products._id': productId },
        { 'products._id': ObjectId.isValid(productId) ? new ObjectId(productId) : null }
      ]
    });

    if (!store || !store.products) {
      db = client.db('brms');
      store = await db.collection('stores').findOne({
        $or: [
          { 'products._id': productId },
          { 'products._id': ObjectId.isValid(productId) ? new ObjectId(productId) : null }
        ]
      });
    }

    if (!store || !store.products) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = store.products.find(
      (prod) => prod._id === productId || (prod._id && prod._id.toString() === productId)
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productWithStoreData = {
      ...product,
      store: {
        _id: store._id,
        name: store.name || store.storeName,
        ownerAddress: store.ownerAddress,
      },
    };
    
    res.status(200).json(productWithStoreData);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
} 