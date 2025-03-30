# USDT Balance Check and Transfer on Fantom Network

## Overview
This JavaScript script is designed to generate Fantom blockchain addresses using a mnemonic phrase, check USDT (Tether) balances, and transfer funds from user accounts to an admin account if a balance is detected.

## Features
- Generates Fantom addresses using a hierarchical deterministic (HD) wallet structure.
- Checks the USDT (TRC-20) balance of each generated address.
- Automatically transfers any detected balance to the admin wallet (user index 1).
- Uses Ethers.js to interact with the Fantom blockchain.

## Dependencies
Before running the script, ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [Ethers.js](https://docs.ethers.org/)
- [BIP39](https://github.com/bitcoinjs/bip39)

To install dependencies, run:
```sh
npm install bip39 ethers axios
```

## Configuration

### Fantom RPC URL
The script uses Fantom's public RPC endpoint:
```js
const FANTOM_RPC = 'https://rpc.ftm.tools/';
```

### USDT Contract Address
This script interacts with USDT on the Fantom network:
```js
const USDT_CONTRACT_ADDRESS = '0x049d68029688eAbF473097a2fC38ef61633A3C7A';
```

## Usage

### 1. Generate Fantom Address
The script derives an address from the mnemonic phrase and user index:
```js
function generateFantomAddress(mnemonic, userId)
```

### 2. Check USDT Balance
It fetches the balance of USDT held by the generated address:
```js
async function checkUSDTBalance(address)
```

### 3. Transfer USDT Funds
If a balance is found, it sends the funds to the admin wallet:
```js
async function transferUSDT(userWallet, toAddress, amount)
```

### 4. Execute the Script
To check balances and transfer funds, run:
```sh
node script.js
```

## Example
The script processes users from a list and transfers their USDT balance to the admin:
```js
const mnemonic = 'your mnemonic here';
const userList = [{ userIndex: 2 }];
checkBalancesAndTransfer(mnemonic, userList);
```

## Security Considerations
- **Never share your mnemonic phrase** as it grants full access to your wallet.
- Use environment variables or secure storage to manage private keys.
- Ensure the admin wallet is properly secured.
 
