const bip39 = require('bip39');
const TronWeb = require('tronweb');
const axios = require('axios');

const TRON_API = 'https://api.trongrid.io';
const tronWeb = new TronWeb({
    fullHost: TRON_API
});

// Function to generate Tron address from mnemonic and userId (index)
function generateTRXAddress(mnemonic, userId) {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip39.mnemonicToSeedSync(mnemonic);
    const path = `m/44'/195'/${userId}'/0/0`;
    const child = root.slice(0, 32);
    const privateKey = tronWeb.utils.bytes.byteArray2hexStr(child);
    const address = tronWeb.address.fromPrivateKey(privateKey);
    return { address, privateKey };
}

// Function to check Tron balance
async function checkTRXBalance(address) {
    console.log(`Checking balance for Tron address: ${address}`);
    try {
        const response = await axios.get(`${TRON_API}/v1/accounts/${address}`);
        return response.data.data[0]?.balance || 0;
    } catch (error) {
        console.error('Error fetching balance:', error);
        return 0;
    }
}

// Function to transfer Tron funds
async function transferTRX(userPrivateKey, toAddress, amount) {
    console.log(`Creating Tron transaction: ${amount} Sun from ${tronWeb.address.fromPrivateKey(userPrivateKey)} to ${toAddress}`);
    try {
        tronWeb.setPrivateKey(userPrivateKey);
        const transaction = await tronWeb.transactionBuilder.sendTrx(toAddress, amount, tronWeb.address.fromPrivateKey(userPrivateKey));
        const signedTransaction = await tronWeb.trx.sign(transaction);
        const result = await tronWeb.trx.sendRawTransaction(signedTransaction);
        console.log('Transaction sent:', result.txid);
    } catch (error) {
        console.error('Error sending transaction:', error);
    }
}

// Function to transfer funds to admin (userIndex = 1)
async function transferFunds(mnemonic, user, balance) {
    const adminAddresses = generateTRXAddress(mnemonic, 1);
    const userAddresses = generateTRXAddress(mnemonic, user.userIndex);
    await transferTRX(userAddresses.privateKey, adminAddresses.address, balance);
}

// Main function to check balances and transfer funds
async function checkBalancesAndTransfer(mnemonic, userList) {
    for (const user of userList) {
        const { userIndex } = user;
        const addresses = generateTRXAddress(mnemonic, userIndex);
        let balance = await checkTRXBalance(addresses.address);
        
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
