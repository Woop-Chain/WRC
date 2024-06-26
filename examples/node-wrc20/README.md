# WRC
Woop NodeJS SDK Demo

## Overview
This sample project can be cloned to interact with the Woop Blockchain on Local, Test and Main networks

## Pre-requisites
NodeJS and JavaScript knowledge
Check out the .env and config.js files first

## Install
```
npm i
```
## Configure
```
In `.env` set `ENV=[local|testnet|mainnet]`
```
## Deploy Smart Contract
```
truffle deploy --network=testnet
```
## Run App
```
npm start
```
## Endpoints
```
/balance
```
- `address`: WOC address to query balance of
- `shard`(optional): shardID to target 
    - (defaults to 0)

```
/transfer
```
- `to`: WOC address to send tokens to
- `from`(optional): WOC address to send tokens from
    - For this demo, the private keys are stored in `simulated-keystore.js`
    - (defaults to account in `.env` corresponding to network)
- `toshard`(optional): shard to send tokens to
    - (defaults to 0)
- `fromshard`(optional): shard to send tokens from 
    - (defaults to 0)
- `value`: amounts of tokens to send

## Examples on Local Network

### Test "Alice's" Balance 
```
localhost:3000/balance?address=woc103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7
```
### Send "Bob" WOC tokens
```
localhost:3000/transfer?to=woc1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1
```
### Check "Bob's" Balance
```
localhost:3000/balance?address=woc1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65
```
