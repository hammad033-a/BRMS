import { getReviewContract } from '../../../ethereum/review_contract';
import { getWeb3 } from '../../../ethereum/web3';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { reviewId } = req.body;

  if (reviewId === undefined) {
    return res.status(400).json({ message: 'Missing reviewId' });
  }

  try {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const reviewContract = await getReviewContract();

    // The flagReview function in the contract requires the reviewId
    // The transaction is sent from the user's connected account
    await reviewContract.methods.flagReview(reviewId).send({ from: accounts[0] });

    res.status(200).json({ message: 'Review flagged successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
} 