const bip39 = require('bip39');
const ethers = require('ethers');
const axios = require('axios');

const INFURA_URL = 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID';
const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // USDT ERC-20 contract address
const provider = new ethers.JsonRpcProvider(INFURA_URL);
const USDT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)"
];

// Function to generate Ethereum address from mnemonic and userId (index)
function generateETHAddress(mnemonic, userId) {
    const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonic).derivePath(`m/44'/60'/${userId}'/0/0`);
    return { address: wallet.address, wallet };
}

// Function to check USDT balance
async function checkUSDTBalance(address) {
    console.log(`Checking USDT balance for address: ${address}`);
    try {
        const contract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider);
        const balance = await contract.balanceOf(address);
        return ethers.formatUnits(balance, 6); // USDT uses 6 decimal places
    } catch (error) {
        console.error('Error fetching USDT balance:', error);
        return 0;
    }
}

// Function to transfer USDT funds
async function transferUSDT(userWallet, toAddress, amount) {
    console.log(`Creating USDT transaction: ${amount} USDT from ${userWallet.address} to ${toAddress}`);
    try {
        const contract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, userWallet);
        const tx = await contract.transfer(toAddress, ethers.parseUnits(amount, 6));
        
        console.log('Transaction sent:', tx.hash);
        await tx.wait();
        console.log('Transaction confirmed');
    } catch (error) {
        console.error('Error sending USDT transaction:', error);
    }
}

// Function to transfer funds to admin (userIndex = 1)
async function transferFunds(mnemonic, user, balance) {
    const adminAddresses = generateETHAddress(mnemonic, 1);
    const userAddresses = generateETHAddress(mnemonic, user.userIndex);
    await transferUSDT(userAddresses.wallet, adminAddresses.address, balance);
}

// Main function to check balances and transfer funds
async function checkBalancesAndTransfer(mnemonic, userList) {
    for (const user of userList) {
        const { userIndex } = user;
        const addresses = generateETHAddress(mnemonic, userIndex);
        let balance = await checkUSDTBalance(addresses.address);
        
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
