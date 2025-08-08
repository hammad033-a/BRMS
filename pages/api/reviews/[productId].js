import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { productId } = req.query;
  const reviewsFile = path.join(process.cwd(), 'data', 'reviews.json');
  let reviews = [];
  if (fs.existsSync(reviewsFile)) {
    reviews = JSON.parse(fs.readFileSync(reviewsFile, 'utf8'));
  }
  const productReviews = reviews.filter(r => String(r.productId) === String(productId));
  res.status(200).json({
    productId,
    reviews: productReviews,
    totalReviews: productReviews.length,
    averageRating: productReviews.length > 0
      ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
      : 0
  });
}
