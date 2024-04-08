# Woop Protocol WRC-20 Token Standard

This example will help you deploy an WRC-20 (ERC-20 compatible) token on Woop Protocol.

## Getting Started

1. Install packages `npm install`
2. (OPTIONAL) [Set up your woop localnet](https://docs.wikiwoop.com/onboarding-wiki/interns-onboarding-guide/onboarding-overview/setting-up-the-go-environment)
3. Run `./deploy.sh <target_network>` to deploy the contracts, where `<target_network>` can be:
    - `local`: for a local running instance of the Woop blockchain
    - `testnet`: for our current long running testnet (current URL: `https://trpc.woopchain.com/`)
    - `mainnet0`: for our Mainnet (current URL: `https://rpc.woopchain.com/`)
4. In the `.env` file located in the same directory as this Readme, set `ENV=<target_network>` where `<target_network>` is the network you deployed the smart contract to.
5. Use `npm start` to run the dapp

#### Note: restarting the dapp IS necessary after re-deploying the contracts

## Making Changes

If you want to point the dapp to a contract that is already deployed on testnet or mainnet, modify the following entries in the `.env` file:
```
//WRC20 Contract Addresses
TESTNET_WRC20CROWDSALE='<testnet_WRC20Crowdsale_address>'
TESTNET_WOOPMINTABLE='<testnet_WoopMintable_address>'
TESTNET_MIGRATIONS='<testnet_Migrations_address>'

//MAINNET
MAINNET_WRC20CROWDSALE='<mainnet_WRC20Crowdsale_address>'
MAINNET_WOOPMINTABLE='<mainnet_WoopMintable_address>'
MAINNET_MIGRATIONS='<mainnet_Migrations_address>'
```
Replace the `<address>` fields with the hexadecimal address pointing to the contract on your network of choice.


## Other Notes

#### Contract transactions not confirming and sending error from `validators.js`

Add
```
if (!blockNumber) {
    blockNumber = '0x0'
}
```
To line 232 of your `node_modules/@woop-js/transaction/dist/transactionBase.js`
