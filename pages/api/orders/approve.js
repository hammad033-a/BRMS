import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: 'Missing orderId' });
  }

  const ordersFile = path.join(process.cwd(), 'data', 'orders.json');
  let orders = [];
  if (fs.existsSync(ordersFile)) {
    orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
  }

  const idx = orders.findIndex(o => o.orderId === String(orderId));
  if (idx === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  orders[idx].status = 'dispatched';
  orders[idx].updatedAt = new Date().toISOString();
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

  res.status(200).json({ success: true, order: orders[idx] });
} 