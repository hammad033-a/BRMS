import { getWeb3 } from './web3';
import contractAddress from './review_contract_address';
import abi from './review_contract_abi.json';

export async function getReviewContract() {
  const web3 = await getWeb3();
  return new web3.eth.Contract(abi, contractAddress);
} 