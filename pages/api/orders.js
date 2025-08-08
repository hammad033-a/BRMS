import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const ordersFile = path.join(process.cwd(), 'data', 'orders.json');
  if (req.method === 'POST') {
    const { name, address, phone, productId, price, wallet } = req.body;
    if (!name || !address || !phone || !productId || !price || !wallet) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    let orders = [];
    if (fs.existsSync(ordersFile)) {
      orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    }
    const newOrder = {
      orderId: Date.now().toString(),
      name,
      address,
      phone,
      productId,
      price,
      wallet,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
    res.status(200).json({ success: true, order: newOrder });
  } else if (req.method === 'GET') {
    let orders = [];
    if (fs.existsSync(ordersFile)) {
      orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    }
    res.status(200).json({ orders });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 