const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledVendor = require('./build/Vendor.json');

const mnemonic = 'your twelve word mnemonic here';  // Replace with your wallet mnemonic
const infuraUrl = 'https://goerli.infura.io/v3/YOUR_INFURA_PROJECT_ID';  // Replace with your Infura project ID

const provider = new HDWalletProvider(mnemonic, infuraUrl);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(compiledVendor.interface))
        .deploy({ data: compiledVendor.bytecode })
        .send({ gas: '3000000', from: accounts[0] });

    console.log('Contract deployed to', result.options.address);
    provider.engine.stop();
};

deploy();
