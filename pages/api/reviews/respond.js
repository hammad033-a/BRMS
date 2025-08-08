
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reviewId, response } = req.body;
  if (!reviewId || !response) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const reviewsFile = path.join(process.cwd(), 'data', 'reviews.json');
  let reviews = [];
  if (fs.existsSync(reviewsFile)) {
    reviews = JSON.parse(fs.readFileSync(reviewsFile, 'utf8'));
  }

  const idx = reviews.findIndex(r => r.reviewId === String(reviewId));
  if (idx === -1) {
    return res.status(404).json({ error: 'Review not found' });
  }

  reviews[idx].vendorResponse = response;
  reviews[idx].responseTimestamp = new Date().toISOString();
  fs.writeFileSync(reviewsFile, JSON.stringify(reviews, null, 2));

  res.status(200).json({ success: true, review: reviews[idx] });
} 