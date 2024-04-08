
const { Woop } = require('@woop-js/core')
// import or require settings
const { ChainType } = require('@woop-js/utils')
// import or require simutlated keystore (optional)
const { importKey } = require('./simulated-keystore')
/********************************
Config
********************************/
const config = require('../config')
const { url, net, privateKey } = config
/********************************
Woop Setup
********************************/
const createHmy = (url) => new Woop(url,
	{
		chainType: ChainType.Woop,
		chainId: net,
	},
)
async function setSharding(hmy){
	const res = await hmy.blockchain.getShardingStructure();
	hmy.shardingStructures(res.result);
}
/********************************
Wallet Setup
********************************/
function setDefaultWallets(hmy){
	// add privateKey to wallet
	// localnet: woc103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7
	// testnet: woc1w7lu05adqfhv8slx0aq8lgzglk5vrnwvf5f740
	const alice = hmy.wallet.addByPrivateKey(privateKey)
		hmy.wallet.setSigner(alice.address)
	//woc1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65
	const bob = hmy.wallet.addByMnemonic('surge welcome lion goose gate consider taste injury health march debris kick')
	// console.log('alice', alice.bech32Address)
	// console.log('bob', bob.bech32Address)
}

const initWoop = async (url, from) => {
    //prepare Woop instance
    const hmy = createHmy(url)
    await setSharding(hmy)

    if (from) {
        const pkey = importKey(from)
        if(pkey) {
            hmy.wallet.addByPrivateKey(pkey)
            hmy.wallet.setSigner(hmy.crypto.getAddress(from).basicHex)
        } else {
            return {success: false, message: `account ${from} not in keystore`}
        }
    } else {
        setDefaultWallets(hmy)
    }
    return {success: true, hmy}
}

exports.initWoop = initWoop

/********************************
Transfer
********************************/
let transfers = {
	address: true
}

/**
 * Transfers from dapp address to provided address
 * @param {String} to The recepient of faucet funds
 * @param {Number} value The amount sent to recepient in WOC
 * @param {Number} [fromshard=0] The decimal representation of the sender's shardID
 * @param {Number} [toshard=0] The decimal representation of the recipient shardID
 */
const transfer = async (to, value, toshard, fromshard) => {

	if (!to || !value) {
		console.error('missing to or value params')
		return
	}
	
	const initRes = await initWoop(url)
	const { success, hmy } = initRes
	if (!success) {
		console.error(`Could not initialize Woop instance`)
		return
	}

    //default toShard and fromShard
	const toShard = !toshard ? 0x0 : '0x' + toshard
	const fromShard = !fromshard ? 0x0 : '0x' + fromshard
	console.log(to, value)
	
	//prevent accidental re-entry if transaction is in flight
	if (transfers[to]) return
	transfers[to] = true
	//prepare transaction
	const tx = hmy.transactions.newTx({
        to,
        value: new hmy.utils.Unit(value).asEther().toWei(),
        gasLimit: '1000000',
        shardID: fromShard,
        toShardID: toShard,
        gasPrice: new hmy.utils.Unit('1').asGwei().toWei(),
    });
    const signedTX = await hmy.wallet.signTransaction(tx);
    signedTX.observed().on('transactionHash', (txHash) => {
        console.log('--- txHash ---', txHash)
    }).on('receipt', (receipt) => {
		console.log('--- receipt ---', receipt)
		transfers[to] = false //can send again
    }).on('error', (error) => {
		console.error(error)
	})
    const [sentTX, txHash] = await signedTX.sendTransaction()
    return sentTX.confirm(txHash)
}

exports.transfer = transfer

/********************************
Utilities
********************************/

exports.toHexAddress = (hmy, address) => hmy.crypto.getAddress(address).basicHex
exports.toWocAddress = (hmy, address) => hmy.crypto.getAddress(address).bech32