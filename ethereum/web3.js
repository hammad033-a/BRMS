const { Web3 } = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');

// Use the latest Ganache mnemonic
const mnemonic = 'couple clutch pink sphere inquiry window image butter camp attack body someone';

// Ganache local network
const provider = new HDWalletProvider(mnemonic, 'http://127.0.0.1:8545');

const web3 = new Web3(provider);

function getWeb3() {
    return new Promise((resolve, reject) => {
        // For server-side rendering or environments where window is not available
        if (typeof window === 'undefined') {
            return resolve(web3);
        }

        // For browser environments with MetaMask
        if (window.ethereum) {
            const web3Instance = new Web3(window.ethereum);
            window.ethereum.enable()
                .then(() => resolve(web3Instance))
                .catch(error => reject(error));
        }
        // For older DApp browsers
        else if (window.web3) {
            resolve(new Web3(window.web3.currentProvider));
        }
        // Fallback to Ganache provider
        else {
            resolve(web3);
        }
    });
}

module.exports = { getWeb3 };
