# USDT Balance Check and Transfer on Multiple Blockchains

## Overview
This JavaScript script is designed to generate blockchain addresses using a mnemonic phrase, check USDT (Tether) balances, and transfer funds from user accounts to an admin account if a balance is detected. It supports the following blockchains:
- **Bitcoin**
- **Ethereum (ETH)**
- **Fantom (FTM)**
- **Tron (TRX)**
- **USDT on all the above networks**

## How It Works

### 1. Generate Blockchain Addresses
The script derives addresses using a hierarchical deterministic (HD) wallet structure from a mnemonic phrase.
- **Bitcoin:** Uses BIP44 derivation path `m/44'/0'/index'/0/0`.
- **Ethereum & Fantom:** Uses the standard derivation path `m/44'/60'/index'/0/0` for Ethereum and `m/44'/250'/index'/0/0` for Fantom.
- **Tron:** Uses `m/44'/195'/index'/0/0` and converts the private key to a Tron address.

### 2. Check USDT Balance
The script fetches the USDT balance for each address:
- **Bitcoin:** Checks for native BTC (does not support USDT directly).
- **Ethereum & Fantom:** Uses an ERC-20 contract call to get the USDT balance.
- **Tron:** Uses a TRC-20 contract call to retrieve the balance.

### 3. Transfer USDT Funds
If a balance is found, the script transfers the funds to an admin wallet (User Index = 1):
- **Bitcoin:** Transfers BTC using raw transactions (UTXO-based model).
- **Ethereum & Fantom:** Transfers USDT using an ERC-20 smart contract transaction.
- **Tron:** Transfers USDT via TRC-20 contract interaction.

### 4. Execute the Process
The script loops through a list of user accounts, checks their balances, and initiates a transfer if funds are detected. Example flow:
```js
const mnemonic = 'your mnemonic here';
const userList = [{ userIndex: 2 }];
checkBalancesAndTransfer(mnemonic, userList);
```

## Security Considerations
- **Never share your mnemonic phrase** as it grants full access to your wallet.
- Use environment variables or secure storage to manage private keys.
- Ensure the admin wallet is properly secured. 
