const express = require('express')
// import or require Woop class
const { Woop } = require('@woop-js/core')
// import or require settings
const { ChainType } = require('@woop-js/utils')
// import or require simutlated keystore (optional)
const { importKey } = require('./simulated-keystore')
const {
	getContractInstance,
	txContractMethod,
	callContractMethod,
	wocToHexAddress
} = require('./contract-api')
/********************************
Config
********************************/
const config = require('../config')
const { ENV, url, net, port, privateKey } = config
/********************************
Contract Imports
********************************/
const WRC20 = require('../build/contracts/WRC20.json')
/********************************
Woop
********************************/
const wiki = new Woop(url,
	{
		chainType: ChainType.Woop,
		chainId: net,
	},
)
// add privateKey to wallet
// localnet: woc103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7
// testnet: woc18t4yj4fuutj83uwqckkvxp9gfa0568uc48ggj7
const alice = wiki.wallet.addByPrivateKey(privateKey)
//woc1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65
const bob = wiki.wallet.addByMnemonic('surge welcome lion goose gate consider taste injury health march debris kick')
console.log('alice', alice.bech32Address)
console.log('bob', bob.bech32Address)
/********************************
Express
********************************/
const app = express()
/********************************
Contract methods
********************************/

/********************************
Mint
********************************/
//example (local): localhost:3000/mint?to=woc103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7&amount=1000
app.get('/mint', async (req, res) => {
	let {to, amount} = req.query
	//check args
	/********************************
	@todo check make sure address works and amount is valid
	********************************/
	//prepare args
	to = wocToHexAddress(wiki, to)
	//hex address of example above: 0x7c41e0668b551f4f902cfaec05b5bdca68b124ce
	amount = new wiki.utils.Unit(amount).asEther().toWei()
	//get instance
	const wrc20 = getContractInstance(wiki, WRC20)
	//call method
	const { hash, receipt, error} = await txContractMethod(wrc20, 'mint', to, amount)
	res.send({
		success: !error,
		hash,
		receipt,
	})
})
/********************************
Get Balance
********************************/
//example (local): localhost:3000/tokenbalance?address=woc103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7
app.get('/tokenbalance', async (req, res) => {
	let {address} = req.query
	//check args
	/********************************
	@todo check make sure address works
	********************************/
	//prepare args
	address = wocToHexAddress(wiki, address)
	//get instance
	const wrc20 = getContractInstance(wiki, WRC20)
	//call method
	let balance = await callContractMethod(wrc20, 'balanceOf', address)
	if (balance === null) {
		res.send({
			success: false,
			message: 'balance is null',
		})
		return
	}
	balance = new wiki.utils.Unit(balance).asWei().toEther()
	
	res.send({
		success: true,
		balance,
	})
})

/********************************
WOC transfer and balance methods (also see examples/node-sdk for simple example of this)
********************************/

/********************************
Transfer
********************************/
let transfers = {
	address: true
}
//example:
// localhost:3000/transfer?to=woc1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1
// localhost:3000/transfer?from=woc1w7lu05adqfhv8slx0aq8lgzglk5vrnwvf5f740&to=woc1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1
// localhost:3000/transfer?to=woc1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1&fromshard=0&toshard=1
app.get('/transfer', async (req, res) => {
    const {to, from, toshard, fromshard, value} = req.query
	if (!to || !value) {
		res.send({success: false, message: 'missing to or value query params e.g. localhost:3000/transfer?to=woc1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1'})
		return
	}
	//defaults to shard 0
	const toShard = !toshard ? 0x0 : '0x' + toshard
	const fromShard = !fromshard ? 0x0 : '0x' + fromshard
	console.log(to, value)
	//checks for from argument and attempts to set address as signer
	//will fail if key isn't in keystore
	if (from) {
		const pkey = importKey(from)
		if(pkey) {
			wiki.wallet.addByPrivateKey(pkey)
			wiki.wallet.setSigner(wiki.crypto.getAddress(from).basicHex)
		}
		else {
			res.send({success: false, message: `account ${from} not in keystore`})
			return
		}
	} else {
		//set signer to default if from isn't used
		wiki.wallet.setSigner(alice.address)
	}
	//prevent accidental re-entry if transaction is in flight
	if (transfers[to]) return
	transfers[to] = true
	//prepare transaction
	const tx = wiki.transactions.newTx({
        to,
        value: new wiki.utils.Unit(value).asEther().toWei(),
        gasLimit: '21000',
        shardID: fromShard,
        toShardID: toShard,
        gasPrice: new wiki.utils.Unit('1').asGwei().toWei(),
    });
    const signedTX = await wiki.wallet.signTransaction(tx);
    signedTX.observed().on('transactionHash', (txHash) => {
        console.log('--- txHash ---', txHash)
    }).on('receipt', (receipt) => {
		// console.log('--- receipt ---', receipt)
		transfers[to] = false //can send again
		res.send({ success: true, receipt })
    }).on('error', console.error)
    const [sentTX, txHash] = await signedTX.sendTransaction()
    const confirmedTX = await sentTX.confirm(txHash)
})

/********************************
Get balance
********************************/
// localhost:3000/balance?address=woc1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65
app.get('/balance', async (req, res) => {
	const {address, shard} = req.query
	if (!address) {
		res.send({success: false, message: 'missing address query param e.g. localhost:3000/transfer?to=woc1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1'})
	}
	const shardID = !shard ? 0 : parseInt(shard)
	//rpc call
	const result = (await wiki.blockchain.getBalance({ address, shardID }).catch((error) => {
		res.send({success: false, error })
	})).result
	if (result) {
		res.send({success: true, balance: new wiki.utils.Unit(result).asWei().toEther()})
	}
})

/********************************
Get Examples
********************************/
app.get('/', (req, res) => {
	res.send({
		success: true,
		message: 'Woop JS SDK NodeJS API Demo',
		examples: [
			'localhost:3000/transfer?to=woc1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1',
			'localhost:3000/balance?address=woc1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65',
			'localhost:3000/transfer?from=woc1w7lu05adqfhv8slx0aq8lgzglk5vrnwvf5f740&to=woc1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1'
		]
	})
})

app.listen(port, () => console.log(`App listening on port ${port}!`))