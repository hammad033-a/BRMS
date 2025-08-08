import clientPromise from '../../../lib/mongodb';
import { compare } from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  const client = await clientPromise;
  const db = client.db();
  const store = await db.collection('stores').findOne({ email });
  if (!store) return res.status(401).json({ message: 'Invalid credentials' });
  const isValid = await compare(password, store.password);
  if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });
  res.status(200).json({ storeId: store._id, storeName: store.storeName });
} 