const bip39 = require('bip39');
const TronWeb = require('tronweb');
const axios = require('axios');

const TRON_API = 'https://api.trongrid.io';
const USDT_CONTRACT_ADDRESS = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj'; // USDT TRC-20 contract address
const tronWeb = new TronWeb({
    fullHost: TRON_API
});

// Function to generate Tron address from mnemonic and userId (index)
function generateTRXAddress(mnemonic, userId) {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = seed.slice(0, 32);
    const privateKey = tronWeb.utils.bytes.byteArray2hexStr(root);
    const address = tronWeb.address.fromPrivateKey(privateKey);
    return { address, privateKey };
}

// Function to check USDT balance on Tron
async function checkUSDTBalance(address) {
    console.log(`Checking USDT balance for address: ${address}`);
    try {
        const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);
        const balance = await contract.balanceOf(address).call();
        return parseInt(balance) / 1e6; // USDT on Tron uses 6 decimal places
    } catch (error) {
        console.error('Error fetching USDT balance:', error);
        return 0;
    }
}

// Function to transfer USDT funds on Tron
async function transferUSDT(userPrivateKey, toAddress, amount) {
    console.log(`Creating USDT transaction: ${amount} USDT from ${tronWeb.address.fromPrivateKey(userPrivateKey)} to ${toAddress}`);
    try {
        tronWeb.setPrivateKey(userPrivateKey);
        const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);
        const tx = await contract.transfer(toAddress, amount * 1e6).send();
        console.log('Transaction sent:', tx);
    } catch (error) {
        console.error('Error sending USDT transaction:', error);
    }
}

// Function to transfer funds to admin (userIndex = 1)
async function transferFunds(mnemonic, user, balance) {
    const adminAddresses = generateTRXAddress(mnemonic, 1);
    const userAddresses = generateTRXAddress(mnemonic, user.userIndex);
    await transferUSDT(userAddresses.privateKey, adminAddresses.address, balance);
}

// Main function to check balances and transfer funds
async function checkBalancesAndTransfer(mnemonic, userList) {
    for (const user of userList) {
        const { userIndex } = user;
        const addresses = generateTRXAddress(mnemonic, userIndex);
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
