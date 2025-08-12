import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { storeId } = req.query;
  if (!storeId) return res.status(400).json({ error: 'Missing storeId' });
  try {
    const client = await clientPromise;
    const db = client.db();
<<<<<<< HEAD
    const store = await db.collection('stores').findOne({ _id: new ObjectId(storeId) });
=======
    const filter = ObjectId.isValid(storeId) ? { _id: new ObjectId(storeId) } : { id: storeId };
    const store = await db.collection('stores').findOne(filter);
>>>>>>> 7e31841 (Initial project upload)
    if (!store) return res.status(404).json({ error: 'Store not found' });
    // Return only safe fields
    res.status(200).json({
      _id: store._id,
      storeName: store.storeName,
      ownerName: store.ownerName,
      email: store.email,
      phone: store.phone,
      address: store.address,
      description: store.description,
      createdAt: store.createdAt,
      products: store.products || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch store', details: err.message });
  }
} 