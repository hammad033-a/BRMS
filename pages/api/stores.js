import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('stores');

  if (req.method === 'GET') {
    const { id } = req.query;
    if (id) {
      // Fetch a single store by _id
      const store = await collection.findOne({ _id: new ObjectId(id) });
      if (!store) {
        res.status(404).json({ message: 'Store not found' });
      } else {
        res.status(200).json(store);
      }
    } else {
      // Get all stores
      const stores = await collection.find({}).toArray();
      res.status(200).json(stores);
    }
  } else if (req.method === 'POST') {
    // Add a new store
    const store = req.body;
    if (!store.ownerAddress) {
      res.status(400).json({ message: 'ownerAddress is required' });
      return;
    }
    // Hash the password before saving
    if (store.password) {
      store.password = await bcrypt.hash(store.password, 10);
    }
    const result = await collection.insertOne(store);
    res.status(201).json(result.ops ? result.ops[0] : store);
  } else if (req.method === 'PATCH') {
    // Update store info (storeName, email, logo, address)
    const { id } = req.query;
    const { storeName, email, logo, address } = req.body;
    if (!id) {
      res.status(400).json({ message: 'Missing id' });
      return;
    }
    const updateFields = {};
    if (storeName !== undefined) updateFields.storeName = storeName;
    if (email !== undefined) updateFields.email = email;
    if (logo !== undefined) updateFields.logo = logo;
    if (address !== undefined) updateFields.address = address;
    if (Object.keys(updateFields).length === 0) {
      res.status(400).json({ message: 'No fields to update' });
      return;
    }
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );
    if (result.modifiedCount === 1) {
      res.status(200).json({ message: 'Store updated successfully' });
    } else {
      res.status(404).json({ message: 'Store not found or not updated' });
    }
  } else if (req.method === 'DELETE') {
    // Delete a store after verifying email and password
    const { id } = req.query;
    const { email, password } = req.body;
    if (!id || !email || !password) {
      res.status(400).json({ message: 'Missing id, email, or password' });
      return;
    }
    const store = await collection.findOne({ _id: new ObjectId(id) });
    if (!store) {
      res.status(404).json({ message: 'Store not found' });
      return;
    }
    if (store.email !== email) {
      res.status(401).json({ message: 'Email does not match' });
      return;
    }
    const isValid = await bcrypt.compare(password, store.password);
    if (!isValid) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }
    await collection.deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: 'Store deleted successfully' });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 