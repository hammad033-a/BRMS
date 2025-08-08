import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId, review } = req.body;
  if (!productId || !review || !review.comment || !review.rating) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const reviewsFile = path.join(process.cwd(), 'data', 'reviews.json');
  let reviews = [];
  if (fs.existsSync(reviewsFile)) {
    reviews = JSON.parse(fs.readFileSync(reviewsFile, 'utf8'));
  }

  const newReview = {
    reviewId: Date.now().toString(),
    rating: review.rating,
    comment: review.comment,
    productId: String(productId),
    createdAt: new Date().toISOString(),
    image: review.image || null,
    vendorResponse: null,
    responseTimestamp: null
  };

  reviews.push(newReview);
  fs.writeFileSync(reviewsFile, JSON.stringify(reviews, null, 2));

  res.status(200).json({ success: true, review: newReview });
}
