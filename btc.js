const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');
const { ECPair } = require('bitcoinjs-lib');
const { Psbt } = require('bitcoinjs-lib');

const BLOCKSTREAM_API = 'https://blockstream.info/api';

// Function to generate Bitcoin address from mnemonic and userId (index)
function generateBTCAddress(mnemonic, userId) {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bitcoin.bip32.fromSeed(seed);
    const path = `m/44'/0'/${userId}'/0/0`;
    const child = root.derivePath(path);
    const { address } = bitcoin.payments.p2pkh({ pubkey: child.publicKey });
    return { address, keyPair: child };
}

// Function to check Bitcoin balance
async function checkBTCBalance(address) {
    console.log(`Checking balance for Bitcoin address: ${address}`);
    try {
        const response = await axios.get(`${BLOCKSTREAM_API}/address/${address}`);
        return response.data.chain_stats.funded_txo_sum - response.data.chain_stats.spent_txo_sum;
    } catch (error) {
        console.error('Error fetching balance:', error);
        return 0;
    }
}

// Function to get UTXOs for an address
async function getUTXOs(address) {
    try {
        const response = await axios.get(`${BLOCKSTREAM_API}/address/${address}/utxo`);
        return response.data;
    } catch (error) {
        console.error('Error fetching UTXOs:', error);
        return [];
    }
}

// Function to transfer Bitcoin funds
async function transferBTC(userKeyPair, fromAddress, toAddress, amount) {
    console.log(`Creating Bitcoin transaction: ${amount} Satoshis from ${fromAddress} to ${toAddress}`);
    
    const utxos = await getUTXOs(fromAddress);
    if (utxos.length === 0) {
        console.error('No UTXOs available for this address');
        return;
    }
    
    const psbt = new Psbt();
    let inputAmount = 0;
    for (const utxo of utxos) {
        psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            nonWitnessUtxo: Buffer.from(await axios.get(`${BLOCKSTREAM_API}/tx/${utxo.txid}/hex`)),
        });
        inputAmount += utxo.value;
        if (inputAmount >= amount + 1000) break; // Include transaction fee buffer
    }
    
    const fee = 1000; // Approximate fee in satoshis
    const change = inputAmount - amount - fee;
    
    psbt.addOutput({ address: toAddress, value: amount });
    if (change > 0) {
        psbt.addOutput({ address: fromAddress, value: change });
    }
    
    psbt.signAllInputs(ECPair.fromWIF(userKeyPair.toWIF()));
    psbt.finalizeAllInputs();
    
    const txHex = psbt.extractTransaction().toHex();
    const broadcastResponse = await axios.post(`${BLOCKSTREAM_API}/tx`, txHex);
    
    console.log('Transaction broadcasted:', broadcastResponse.data);
}

// Function to transfer funds to admin (userIndex = 1)
async function transferFunds(mnemonic, user, balance) {
    const adminAddresses = generateBTCAddress(mnemonic, 1);
    const userAddresses = generateBTCAddress(mnemonic, user.userIndex);
    await transferBTC(userAddresses.keyPair, userAddresses.address, adminAddresses.address, balance);
}

// Main function to check balances and transfer funds
async function checkBalancesAndTransfer(mnemonic, userList) {
    for (const user of userList) {
        const { userIndex } = user;
        const addresses = generateBTCAddress(mnemonic, userIndex);
        let balance = await checkBTCBalance(addresses.address);
        
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
