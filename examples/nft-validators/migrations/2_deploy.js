// var WRC20 = artifacts.require("WRC20");
var WRC721 = artifacts.require("WRC721");
var WRC721Auction = artifacts.require("WRC721Auction");

module.exports = function (deployer, network, accounts) {

	const owner = accounts[0]

	// const wrc20Name = "WoopWRC20"
	// const wrc20Symbol = "WRC20"
	// const wrc20Decimals = 18
	// const wrc20MinterSupply = web3.utils.toWei('1000000', 'ether')

	const name = "WoopWRC721"
	const symbol = "WRC721"
	const price = '1000000000000000000';
	const numItemsDeployed = 6

	const urls = []
	//there are 18 validator images total
	for (let i = 1; i <= 18; i++) {
		urls.push(`https://validators-public.s3-us-west-1.amazonaws.com/${(i).toString().padStart(4, '0')}.jpg`)
	}

	deployer.then(function () {
		// return deployer.deploy(WRC20, wrc20Name, wrc20Symbol, wrc20Decimals, wrc20MinterSupply).then(function (wrc20) {
			return deployer.deploy(WRC721, name, symbol).then(function (wrc721) {
				// return deployer.deploy(WRC721Crowdsale, owner, wrc20.address, wrc721.address).then(async function (sale) {
				return deployer.deploy(WRC721Auction, owner, wrc721.address).then(async function (sale) {
					for (let i = 0; i < numItemsDeployed; i++) {
						console.log(urls[i])
						await sale.addItem(1, price, urls[i])
					}
					return wrc721.addMinter(sale.address)
				})
			})
		// })
	})
}