# Woop Protocol NFT Store Sample Dapp

This example will help you deploy an WRC-721 (ERC-721 compatible) NFT Store on the Woop Protocol.

## Server

The dashboard, "minter" for setting the inventory and primary issuance of NFTs.

## Client

A sample Dapp where users can buy NFTs from the "minter" or "store" through a primary issuance sale.

Users can also sell items on the "market" peer to peer.

## Getting Started

1. Install packages `npm install`
2. (OPTIONAL) [Set up your woop localnet](https://docs.wikiwoop.com/onboarding-wiki/interns-onboarding-guide/onboarding-overview/setting-up-the-go-environment)
3. Run `npm run deploy <target_network>` to deploy the contracts, where `<target_network>` can be:
    - `local`: for a local running instance of the Woop blockchain
    - `testnet`: for our current long running testnet (current URL: `https://trpc.woopchain.com/`)
    - `mainnet0`: for our Mainnet (current URL: `https://rpc.woopchain.com/`)
4. In the `.env` file located in the same directory as this Readme, set `ENV=<target_network>` where <target_network> is the network you deployed the smart contract to.
5. Use `npm start` to run the dapp

### Note: restarting the dapp IS necessary after re-deploying the contracts
```
npm start
```

## Making Changes

If you want to point the dapp to a contract that is already deployed on testnet or mainnet, modify the following entries in the `.env` file:
```
//WRC721 Contract Addresses
TESTNET_WRC721CROWDSALE='<testnet_WRC721Crowdsale_address>'
TESTNET_WOOPMINTABLE='<testnet_WRC721_address>'
TESTNET_MIGRATIONS='<testnet_Migrations_address>'

//MAINNET
MAINNET_WRC721CROWDSALE='<mainnet_WRC721Crowdsale_address>'
MAINNET_WOOPMINTABLE='<mainnet_WRC721_address>'
MAINNET_MIGRATIONS='<mainnet_Migrations_address>'
```
Replace the address fields with the hexadecimal address pointing to the contract on your network of choice.

## Other Notes
