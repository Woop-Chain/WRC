# WRC
Woop ERC20

## Overview
This sample project can be used to deploy an ERC20 token on Woop's Testnet

## Pre-requisites
Please read the guideline for [Smart Contract Development using Truffle](https://docs.wikiwoop.com/home/developers-1/which-one-are-you/h2o)

## Install

```bash
#install truffle
$npm install -g truffle@5.0.38

#clone this project
$git clone https://github.com/woop-chain/WRC.git
$cd WRC
$cp .envSample .env

#install modules
$npm install
```

## Compile smart contract
```bash
$truffle compile
```

## Deploy smart contract to Woop's testnet 
```bash
$truffle migrate --network testnet --reset
```

## List the smart contract on testnet

```bash
$truffle networks

Network: development (id: 2)
  No contracts deployed.

Network: testnet (id: 2)
  WoopERC20: 0xf2c3b75dAB0e45652Bf0f9BD9e08d48b03c3926E
  Migrations: 0x7b5B72fD8A1A4B923Fb12fF1f50b5C84F920278d
```

## Get the event logs of a transaction

```bash
LOCAL=http://localhost:9500
SHARD0=https://trpc.woopchain.com
SHARD1=https://trpc1.woopchain.com
SHARD2=https://trpc2.woopchain.com
#your params
SHARD=LOCAL
#example is WRC20 mint and transfer
TXID=0x039d2f87e6bdb81220e5a7490dc783ea835443f57f4e12d16d90dd0b3aa1f5af
#curl
curl -X POST $SHARD -H 'Accept: */*'   -H 'Accept-Encoding: gzip, deflate'   -H 'Cache-Control: no-cache'   -H 'Connection: keep-alive'   -H 'Content-Length: 162'   -H 'Content-Type: application/json'   -H 'Host: trpc.woopchain.com'   -H 'Postman-Token: d5415117-657a-49f9-9100-a5b7ebc70daf,cc2f3cb9-2d10-408c-a003-d6e0822ec985'   -H 'User-Agent: PostmanRuntime/7.19.0'   -H 'cache-control: no-cache'   -d '{
    "jsonrpc":"2.0",
    "method":"wiki_getTransactionReceipt",
    "params":["'$TXID'"],
    "id":1
}'
```

## Interact with smart contract with a custom javascript
A custom javascript **mint_transfer.js** is used to mint and transfer token
```javascript
var WoopERC20 = artifacts.require("WoopERC20");

//mint amount address
const myAddress =   "0x3aea49553Ce2E478f1c0c5ACC304a84F5F4d1f98";

//test account address, keys under
//https://github.com/woop-chain/woop/blob/master/.wiki/keystore/woc103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7.key
const testAccount = "0x7c41e0668b551f4f902cfaec05b5bdca68b124ce";

const transferAmount = 2000000;

module.exports = function() {
    async function getWoopERC20Information() {
        let instance = await WoopERC20.deployed();
        let name = await instance.name();
        let total = await instance.totalSupply();
        let decimals = await instance.decimals();
        let mybalance = await instance.balanceOf(myAddress);
        
        instance.transfer(testAccount, transferAmount);
        let testAccBalance = await instance.balanceOf(testAccount);

        console.log("WoopERC20 is deployed at address " + instance.address);
        console.log("Woop ERC20 Information: Name    : " + name);
        console.log("Woop ERC20 Information: Decimals: " + decimals);
        console.log("Woop ERC20 Information: Total   : " + total.toString());
        console.log("my address : " + myAddress);
        console.log("test account address : " + testAccount);
        console.log("my minted    H2O balance is: " + mybalance.toString());
        console.log("test account H2O balance is: " + testAccBalance.toString());
        console.log("\ntransfered " + transferAmount.toString() + " from my address (minter) to test account");
    }
    getWoopERC20Information();
};
```

A custom javascript **show_balance.js** is used to show balance
```javascript
var WoopERC20 = artifacts.require("WoopERC20");

//mint amount address
const myAddress =   "0x3aea49553Ce2E478f1c0c5ACC304a84F5F4d1f98";

//test account address, keys under
//https://github.com/woop-chain/woop/blob/master/.wiki/keystore/woc103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7.key
const testAccount = "0x7c41e0668b551f4f902cfaec05b5bdca68b124ce";

const transferAmount = 2000000;

module.exports = function() {
    async function getWoopERC20Information() {
        let instance = await WoopERC20.deployed();
        let name = await instance.name();
        let total = await instance.totalSupply();
        let decimals = await instance.decimals();
        let mybalance = await instance.balanceOf(myAddress);
        let testAccBalance = await instance.balanceOf(testAccount);

        console.log("WoopERC20 is deployed at address " + instance.address);
        console.log("Woop ERC20 Information: Name    : " + name);
        console.log("Woop ERC20 Information: Decimals: " + decimals);
        console.log("Woop ERC20 Information: Total   : " + total.toString());
        console.log("my address : " + myAddress);
        console.log("test account address : " + testAccount);
        console.log("my minted    H2O balance is: " + mybalance.toString());
        console.log("test account H2O balance is: " + testAccBalance.toString());

    }
    getWoopERC20Information();
};
```

## Mint and send token to a test account

```bash
$ truffle exec ./mint_transfer_token.js  --network testnet
Using network 'testnet'.

WoopERC20 is deployed at address 0xbBE1E92631C8846ff729C09FD629F98544966c6A
Woop ERC20 Information: Name    : WoopERC20
Woop ERC20 Information: Decimals: 18
Woop ERC20 Information: Total   : 1000000000000000000000000
my address : 0x3aea49553Ce2E478f1c0c5ACC304a84F5F4d1f98
test account address : 0x7c41e0668b551f4f902cfaec05b5bdca68b124ce
my minted    H2O balance is: 1000000000000000000000000
test account H2O balance is: 0

transfered 2000000 from my address (minter) to test account
```

type ctrl+C to exit

## Show balance of two accounts

```bash
$ truffle exec ./show_balance.js  --network testnet
Using network 'testnet'.

WoopERC20 is deployed at address 0xbBE1E92631C8846ff729C09FD629F98544966c6A
Woop ERC20 Information: Name    : WoopERC20
Woop ERC20 Information: Decimals: 18
Woop ERC20 Information: Total   : 1000000000000000000000000
my address : 0x3aea49553Ce2E478f1c0c5ACC304a84F5F4d1f98
test account address : 0x7c41e0668b551f4f902cfaec05b5bdca68b124ce
my minted    H2O balance is: 999999999999999998000000
test account H2O balance is: 2000000
```

type ctrl+C to exit
