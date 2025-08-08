import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { storeId } = req.body;
  if (!storeId) {
    return res.status(400).json({ error: 'Missing storeId' });
  }
  try {
    const client = await clientPromise;
    const db = client.db();
    const store = await db.collection('stores').findOne({ _id: typeof storeId === 'string' ? new (require('mongodb').ObjectId)(storeId) : storeId });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    // Aggregate stats
    let totalEarnings = 0;
    let totalReviews = 0;
    let productsSold = 0;
    let monthlySales = Array(12).fill(0);
    let yearlySales = 0;
    const currentYear = new Date().getFullYear();
    if (Array.isArray(store.products)) {
      store.products.forEach(product => {
        // Assume product.sold or product.sales is an array of sales with { amount, date }
        if (Array.isArray(product.sales)) {
          product.sales.forEach(sale => {
            const saleDate = new Date(sale.date);
            const year = saleDate.getFullYear();
            const month = saleDate.getMonth();
            if (year === currentYear) {
              monthlySales[month] += sale.amount;
              yearlySales += sale.amount;
            }
            totalEarnings += sale.amount;
            productsSold += 1;
          });
        }
        // Count reviews
        if (Array.isArray(product.reviews)) {
          totalReviews += product.reviews.length;
        }
      });
    }
    // Dummy visitors
    const totalVisitors = Math.floor(Math.random() * 10000) + 1000;
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    res.status(200).json({
      totalEarnings,
      totalVisitors,
      totalReviews,
      productsSold,
      monthlySales,
      yearlySales,
      months
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch store stats', details: err.message });
  }
} 