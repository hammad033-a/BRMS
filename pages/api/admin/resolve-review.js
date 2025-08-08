import { getReviewContract } from '../../../ethereum/review_contract';
import { getWeb3 } from '../../../ethereum/web3';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { reviewId, newStatus } = req.body;

  if (reviewId === undefined || newStatus === undefined) {
    return res.status(400).json({ message: 'Missing reviewId or newStatus' });
  }

  // newStatus should be 0 for Active or 2 for Resolved
  if (newStatus !== 0 && newStatus !== 2) {
      return res.status(400).json({ message: 'Invalid status. Must be 0 (Active) or 2 (Resolved).' });
  }

  try {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const reviewContract = await getReviewContract();

    // The sender must be the contract owner (admin)
    await reviewContract.methods.resolveFlaggedReview(reviewId, newStatus).send({ from: accounts[0] });

    res.status(200).json({ message: 'Review status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
} 