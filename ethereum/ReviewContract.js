// ReviewContract.js
// This file interacts with the ReviewContract.sol smart contract

import Web3 from 'web3';
import { getContractAddress } from './review_contract_address';

class ReviewContract {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.account = null;
    this.contractAddress = null;
    this.abi = null;
  }

  // Initialize the contract
  async init() {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create a new Web3 instance
        this.web3 = new Web3(window.ethereum);
        
        // Get the user's account
        const accounts = await this.web3.eth.getAccounts();
        this.account = accounts[0];
        
        // Get the contract address
        this.contractAddress = await getContractAddress();
        
        // Get the contract ABI
        this.abi = await this.getContractABI();
        
        // Create a new contract instance
        this.contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        
        console.log('ReviewContract initialized successfully');
        return true;
      } else {
        console.error('MetaMask is not installed');
        return false;
      }
    } catch (error) {
      console.error('Error initializing ReviewContract:', error);
      return false;
    }
  }

  // Get the contract ABI
  async getContractABI() {
    try {
      // In a real implementation, this would fetch the ABI from the blockchain
      // For now, we'll use a mock ABI
      return [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "store",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "productId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "rating",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "comment",
              "type": "string"
            }
          ],
          "name": "submitReview",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "store",
              "type": "address"
            }
          ],
          "name": "getStoreReviews",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "reviewer",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "store",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "productId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "rating",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "comment",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "timestamp",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "verified",
                  "type": "bool"
                }
              ],
              "internalType": "struct ReviewContract.Review[]",
              "name": "",
              "type": "tuple[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ];
    } catch (error) {
      console.error('Error getting contract ABI:', error);
      return null;
    }
  }

  // Submit a review
  async submitReview(store, productId, rating, comment) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      // Submit the review
      const result = await this.contract.methods.submitReview(
        store,
        productId,
        rating,
        comment
      ).send({
        from: this.account,
        gas: 500000
      });
      
      console.log('Review submitted successfully:', result);
      return result;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  }

  // Get reviews for a store
  async getStoreReviews(store) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      // Get the reviews
      const reviews = await this.contract.methods.getStoreReviews(store).call();
      
      console.log('Store reviews retrieved successfully:', reviews);
      return reviews;
    } catch (error) {
      console.error('Error getting store reviews:', error);
      throw error;
    }
  }

  // Get reviews for a product
  async getProductReviews(productId) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      // Get the reviews
      const reviews = await this.contract.methods.getProductReviews(productId).call();
      
      console.log('Product reviews retrieved successfully:', reviews);
      return reviews;
    } catch (error) {
      console.error('Error getting product reviews:', error);
      throw error;
    }
  }

  // Get the average rating for a store
  async getStoreAverageRating(store) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      // Get the average rating
      const rating = await this.contract.methods.getStoreAverageRating(store).call();
      
      console.log('Store average rating retrieved successfully:', rating);
      return rating;
    } catch (error) {
      console.error('Error getting store average rating:', error);
      throw error;
    }
  }

  // Get the average rating for a product
  async getProductAverageRating(productId) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      // Get the average rating
      const rating = await this.contract.methods.getProductAverageRating(productId).call();
      
      console.log('Product average rating retrieved successfully:', rating);
      return rating;
    } catch (error) {
      console.error('Error getting product average rating:', error);
      throw error;
    }
  }

  // Get the number of reviews for a store
  async getStoreReviewCount(store) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      // Get the review count
      const count = await this.contract.methods.getStoreReviewCount(store).call();
      
      console.log('Store review count retrieved successfully:', count);
      return count;
    } catch (error) {
      console.error('Error getting store review count:', error);
      throw error;
    }
  }

  // Get the number of reviews for a product
  async getProductReviewCount(productId) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      // Get the review count
      const count = await this.contract.methods.getProductReviewCount(productId).call();
      
      console.log('Product review count retrieved successfully:', count);
      return count;
    } catch (error) {
      console.error('Error getting product review count:', error);
      throw error;
    }
  }

  // Verify a review
  async verifyReview(store, productId, reviewIndex) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      
      // Verify the review
      const result = await this.contract.methods.verifyReview(
        store,
        productId,
        reviewIndex
      ).send({
        from: this.account,
        gas: 500000
      });
      
      console.log('Review verified successfully:', result);
      return result;
    } catch (error) {
      console.error('Error verifying review:', error);
      throw error;
    }
  }

  async addProduct(name, description, price, category, imageUrl, storeOwner) {
    try {
      // Validate input
      if (!name || !description || !price || !category || !storeOwner) {
        throw new Error('Missing required fields');
      }

      // Convert price to Wei
      const priceInWei = this.web3.utils.toWei(price.toString(), 'ether');

      // Call the smart contract's addProduct function
      const result = await this.contract.methods
        .addProduct(name, description, priceInWei, category, imageUrl)
        .send({ from: storeOwner });

      // Get the product ID from the transaction receipt
      const productId = result.events.ProductAdded.returnValues.productId;

      return {
        success: true,
        productId: productId
      };
    } catch (error) {
      console.error('Error adding product:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default ReviewContract; 