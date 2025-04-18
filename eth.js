const bip39 = require('bip39');
const ethers = require('ethers');
const axios = require('axios');

const ETHERSCAN_API = 'https://api.etherscan.io/api';
const INFURA_URL = 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID';
const provider = new ethers.JsonRpcProvider(INFURA_URL);

// Function to generate Ethereum address from mnemonic and userId (index)
function generateETHAddress(mnemonic, userId) {
    const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonic).derivePath(`m/44'/60'/${userId}'/0/0`);
    return { address: wallet.address, wallet };
}

// Function to check Ethereum balance
async function checkETHBalance(address) {
    console.log(`Checking balance for Ethereum address: ${address}`);
    try {
        const balance = await provider.getBalance(address);
        return ethers.formatUnits(balance, 'wei');
    } catch (error) {
        console.error('Error fetching balance:', error);
        return 0;
    }
}

// Function to transfer Ethereum funds
async function transferETH(userWallet, toAddress, amount) {
    console.log(`Creating Ethereum transaction: ${amount} Wei from ${userWallet.address} to ${toAddress}`);
    try {
        const tx = await userWallet.sendTransaction({
            to: toAddress,
            value: ethers.parseUnits(amount, 'wei'),
            gasLimit: ethers.toBigInt(21000),
        });
        
        console.log('Transaction sent:', tx.hash);
        await tx.wait();
        console.log('Transaction confirmed');
    } catch (error) {
        console.error('Error sending transaction:', error);
    }
}

// Function to transfer funds to admin (userIndex = 1)
async function transferFunds(mnemonic, user, balance) {
    const adminAddresses = generateETHAddress(mnemonic, 1);
    const userAddresses = generateETHAddress(mnemonic, user.userIndex);
    await transferETH(userAddresses.wallet, adminAddresses.address, balance);
}

// Main function to check balances and transfer funds
async function checkBalancesAndTransfer(mnemonic, userList) {
    for (const user of userList) {
        const { userIndex } = user;
        const addresses = generateETHAddress(mnemonic, userIndex);
        let balance = await checkETHBalance(addresses.address);
        
        if (balance > 0) {
            await transferFunds(mnemonic, user, balance);
        }
    }
}

// Example usage
const mnemonic = 'pistol swing silver leaf crash family extend lamp purchase woman circus original';
const userList = [
    { userIndex: 2 }
];

checkBalancesAndTransfer(mnemonic, userList);
