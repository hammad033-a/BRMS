const { getWeb3 } = require('./web3');
const fs = require('fs');
const path = require('path');
const solc = require('solc');

// Read the contract source code
const contractPath = path.resolve(__dirname, 'contracts', 'ReviewContract.sol');
const source = fs.readFileSync(contractPath, 'utf8');

// Compile the contract
const input = {
  language: 'Solidity',
  sources: {
    'ReviewContract.sol': {
      content: source
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Check for errors
if (output.errors) {
  output.errors.forEach(error => {
    console.log(error.formattedMessage);
  });
}

// Extract the contract ABI and bytecode
const contract = output.contracts['ReviewContract.sol']['ReviewContract'];
const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

// Save the ABI to a file for the frontend to use
fs.writeFileSync(
  path.resolve(__dirname, 'review_contract_abi.json'),
  JSON.stringify(abi, null, 2)
);
console.log('Contract ABI saved to review_contract_abi.json');

// Deploy the contract
async function deployContract() {
  try {
    const web3 = await getWeb3();

    // Get the account to deploy the contract from
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    
    console.log(`Deploying contract from account: ${account}`);
    
    // Create a new contract instance
    const ReviewContract = new web3.eth.Contract(abi);

    // Deploy the contract
    const result = await ReviewContract.deploy({
      data: bytecode
    })
    .send({
      from: account,
      gas: '5000000', // Adjusted for local Ganache
    });
    
    console.log(`Contract deployed at address: ${result.options.address}`);
    
    // Save the contract address to a file
    fs.writeFileSync(
      path.resolve(__dirname, 'review_contract_address.js'),
      `module.exports = '${result.options.address}';`
    );
    
    console.log('Contract address saved to review_contract_address.js');
    
    return result.options.address;
  } catch (error) {
    console.error('Error deploying contract:', error);
    throw error;
  }
}

// Execute the deployment
deployContract()
  .then(address => {
    console.log(`Deployment successful! Contract address: ${address}`);
  })
  .catch(error => {
    console.error('Deployment failed:', error);
  }); 