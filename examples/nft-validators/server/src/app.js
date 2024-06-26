const express = require('express')
const path = require('path');
// import or require simutlated keystore (optional)
const { importKey } = require('./simulated-keystore')
const { initWoop, balance, toWei } = require('./woop')
/********************************
Contract Helpers
********************************/
const {
	getContractInstance,
	getContractAddress,
	txContractMethod,
	callContractMethod,
	wocToHexAddress,
	hexToWocAddress
} = require('./contract')
//pulls from project root
const WRC721Crowdsale = require('../../build/contracts/WRC721Crowdsale.json')
/********************************
Config
********************************/
const config = require('./../config')
const { ENV, url, port } = config
/********************************
Express
********************************/
const app = express()
app.use(express.static('public'))
app.get('/balance', balance)
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/index.html'));
})
/********************************
Create NFT
********************************/
//Alice:  0x7c41e0668b551f4f902cfaec05b5bdca68b124ce
//Bob:  0xea877e7412c313cd177959600e655f8ba8c28b40
app.get('/create', async (req, res) => {
	const initRes = await initWoop(url)
	const { success, wiki } = initRes
	if (!success) {
		res.send(initRes)
		return
	}
	let { limit, price, media, owner } = req.query
	/********************************
	 @todo validate args
	 ********************************/
	price = toWei(wiki, price)
	if (owner.indexOf('woc') > -1) {
		owner = wocToHexAddress(wiki, owner)
	}
	console.log('owner', owner)
	/********************************
	Get store contract
	********************************/
	let store = getContractInstance(wiki, WRC721Crowdsale)
	let hash, receipt, error
	if (owner.length > 0) {
		({ hash, receipt, error} = await txContractMethod(store, 'addItemAndMint', limit, price, media, owner))
	} else {
		({ hash, receipt, error} = await txContractMethod(store, 'addItem', limit, price, media))
	}
	res.send({
		success: !error,
		hash,
		receipt,
	})
})

/********************************
Expose Contract Address
********************************/
app.get('/exposeAddress', async (req, res) => {
	const initRes = await initWoop(url)
	const { success, wiki } = initRes
	if (!success) {q
		res.send(initRes)
		return
	}
	const faucetAddress = hexToWocAddress(wiki, getContractAddress(FaucetJSON))
	res.send({
		success: faucetAddress ? "true" : "false",
		faucetAddress
	})
})


/********************************
Start dashboard server
********************************/
app.listen(port, () => console.log(`App listening on port ${port}!`))