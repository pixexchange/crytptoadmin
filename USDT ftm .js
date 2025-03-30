const bip39 = require('bip39');
const ethers = require('ethers');
const axios = require('axios');

const FANTOM_RPC = 'https://rpc.ftm.tools/';
const USDT_CONTRACT_ADDRESS = '0x049d68029688eAbF473097a2fC38ef61633A3C7A'; // USDT on Fantom
const provider = new ethers.JsonRpcProvider(FANTOM_RPC);
const USDT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)"
];

// Function to generate Fantom address from mnemonic and userId (index)
function generateFantomAddress(mnemonic, userId) {
    const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonic).derivePath(`m/44'/250'/${userId}'/0/0`);
    return { address: wallet.address, wallet };
}

// Function to check USDT balance on Fantom
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

// Function to transfer USDT funds on Fantom
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
    const adminAddresses = generateFantomAddress(mnemonic, 1);
    const userAddresses = generateFantomAddress(mnemonic, user.userIndex);
    await transferUSDT(userAddresses.wallet, adminAddresses.address, balance);
}

// Main function to check balances and transfer funds
async function checkBalancesAndTransfer(mnemonic, userList) {
    for (const user of userList) {
        const { userIndex } = user;
        const addresses = generateFantomAddress(mnemonic, userIndex);
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
