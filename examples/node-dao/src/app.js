const express = require('express')
// import or require Woop class
const { Woop } = require('@woop-js/core')
// import or require settings
const { ChainType } = require('@woop-js/utils')
// import or require settings
const { isHex } = require('@woop-js/utils')
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
const { ENV, url, net, port, privateKey, privateKey2 } = config
/********************************
Contract Imports
********************************/
const DAO = require('../build/contracts/DAO.json')
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
// testnet: woc1w7lu05adqfhv8slx0aq8lgzglk5vrnwvf5f740
const alice = wiki.wallet.addByPrivateKey(privateKey)
const leo = wiki.wallet.addByPrivateKey(privateKey2)
//woc1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65
const bob = wiki.wallet.addByMnemonic('surge welcome lion goose gate consider taste injury health march debris kick')
console.log('alice', alice.bech32Address)
console.log('leo', leo.bech32Address)
console.log('bob', bob.bech32Address)
/********************************
Express
********************************/
const app = express()

/**
 * Should be called to get ascii from it's hex representation
 *
 * @method hexToAscii
 * @param {String} hex
 * @returns {String} ascii string representation of hex value
 */
var hexToAscii = function(hex) {
    if (!isHex(hex))
        throw new Error('The parameter must be a valid HEX string.');

    var str = "";
    var i = 0, l = hex.length;
    if (hex.substring(0, 2) === '0x') {
        i = 2;
    }
    for (; i < l; i+=2) {
        var code = parseInt(hex.substr(i, 2), 16);
        if (code == 0) {
           break
        }
        str += String.fromCharCode(code);
    }

    return str;
};

/********************************
Contract methods
********************************/
/********************************
giveRightToVote
********************************/
//example: localhost:4000/giveRightToVote?voter=woc103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7
app.get('/giveRightToVote', async (req, res) => {
   let {voter} = req.query
	//prepare args
	console.log("voter", voter)
   voter = wocToHexAddress(wiki, voter)
	//get instance
   const dao = getContractInstance(wiki, DAO)
	//call method
	const { hash, receipt, error} = await txContractMethod(dao, 'giveRightToVote', voter)
	res.send({
		success: !error,
		hash,
		receipt,
	})
})

/********************************
vote
********************************/
//example: localhost:4000/vote?voter=woc1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&proposal=1
app.get('/vote', async (req, res) => {
   let {voter, proposal} = req.query
	//prepare args
	console.log("voter", voter)
	console.log("proposal", proposal)
   voter = wocToHexAddress(wiki, voter)
	//get instance
   const dao = getContractInstance(wiki, DAO)
   wiki.wallet.setSigner(wiki.crypto.getAddress(voter).basicHex)
	//call method
	const { hash, receipt, error} = await txContractMethod(dao, 'vote', proposal)
	res.send({
		success: !error,
		hash,
		receipt,
	})
})

/********************************
winnerName
********************************/
//example: localhost:4000/winnerName
app.get('/winnerName', async (req, res) => {
	//get instance
   const dao = getContractInstance(wiki, DAO)
	//call method
	let winner = await callContractMethod(dao, 'winnerName')
	if (winner === null) {
		res.send({
			success: false,
			message: 'winner is null',
		})
		return
	}
	winner = hexToAscii(winner)
	res.send({
		success: true,
		winner,
	})
})

/********************************
winningProposal
********************************/
//example: localhost:4000/winningProposal
app.get('/winningProposal', async (req, res) => {
	//get instance
   const dao = getContractInstance(wiki, DAO)
	//call method
	let proposal = await callContractMethod(dao, 'winningProposal')
	if (proposal === null) {
		res.send({
			success: false,
			message: 'winning Proposal is null',
		})
		return
	}
	res.send({
		success: true,
		proposal,
	})
})

/********************************
Get Examples
********************************/
app.get('/', (req, res) => {
	res.send({
		success: true,
		message: 'Woop JS SDK NodeJS API Demo',
		examples: [
			'localhost:4000/giveRightToVote?voter=woc1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65',
			'localhost:4000/vote?voter=woc1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&proposal=2',
			'localhost:4000/winnerName',
			'localhost:4000/winningProposal',
		]
	})
})

app.listen(port, () => console.log(`App listening on port ${port}!`))
