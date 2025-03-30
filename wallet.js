const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const ethers = require('ethers');
const TronWeb = require('tronweb');

// Function to generate Bitcoin address from mnemonic and userId (index)
function generateBTCAddress(mnemonic, userId) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bitcoin.bip32.fromSeed(seed);
  const path = `m/44'/0'/${userId}'/0/0`;
  const child = root.derivePath(path);
  const { address } = bitcoin.payments.p2pkh({ pubkey: child.publicKey });
  return address;
}

// Function to generate Ethereum address from mnemonic and userId (index)
function generateETHAddress(mnemonic, userId) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = ethers.utils.HDNode.fromSeed(seed);
  const child = root.derivePath(`m/44'/60'/${userId}'/0/0`);
  return child.address;
}

// Function to generate Fantom address from mnemonic and userId (index)
function generateFantomAddress(mnemonic, userId) {
  return generateETHAddress(mnemonic, userId);
}

// Function to generate Tron address from mnemonic and userId (index)
function generateTRXAddress(mnemonic, userId) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bitcoin.bip32.fromSeed(seed);
  const path = `m/44'/195'/${userId}'/0/0`;
  const child = root.derivePath(path);
  const privateKeyHex = child.privateKey.toString('hex');
  const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
  });
  const address = tronWeb.address.fromPrivateKey(privateKeyHex);
  return address;
}

// Function to generate all addresses for a user by index
function generateAddressesForUser(mnemonic, userId) {
  const btcAddress = generateBTCAddress(mnemonic, userId);
  const ethAddress = generateETHAddress(mnemonic, userId);
  const fantomAddress = generateFantomAddress(mnemonic, userId);
  const trxAddress = generateTRXAddress(mnemonic, userId);

  return {
    btcAddress,
    ethAddress,
    fantomAddress,
    trxAddress
  };
}

// Example usage:
const mnemonic = 'pistol swing silver leaf crash family extend lamp purchase woman circus original';
const userId = 2; // Example user ID (index)

const userAddresses = generateAddressesForUser(mnemonic, userId);

console.log(`Addresses for User ${userId}:`);
console.log('Generated Bitcoin Address: ' + userAddresses.btcAddress);
console.log('Generated Ethereum Address: ' + userAddresses.ethAddress);
console.log('Generated Fantom Address: ' + userAddresses.fantomAddress);
console.log('Generated Tron Address: ' + userAddresses.trxAddress);
