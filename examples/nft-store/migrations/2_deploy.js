var WRC20 = artifacts.require("WRC20");
var WRC721 = artifacts.require("WRC721");
var WRC721Crowdsale = artifacts.require("WRC721Crowdsale");

module.exports = function (deployer, network, accounts) {

	const owner = accounts[0]

	const wrc20Name = "WoopWRC20"
	const wrc20Symbol = "WRC20"
	const wrc20Decimals = 18
	const wrc20MinterSupply = web3.utils.toWei('1000000', 'ether')

	const name = "WoopWRC721"
	const symbol = "WRC721"
	const price = '1000000000000000000';

	const urls = []
	for (let i = 0; i < 10; i++) {
		urls.push('https://placedog.net/' + (500 + 10 * i) + '/500')
	}
	urls.unshift('https://media.giphy.com/media/eYilisUwipOEM/giphy.gif')
	urls.unshift('https://media.giphy.com/media/69FmYZBku9m81vhGH3/giphy.gif')

	deployer.then(function () {
		return deployer.deploy(WRC20, wrc20Name, wrc20Symbol, wrc20Decimals, wrc20MinterSupply).then(function (wrc20) {
			return deployer.deploy(WRC721, name, symbol).then(function (wrc721) {
				return deployer.deploy(WRC721Crowdsale, owner, wrc20.address, wrc721.address).then(async function (sale) {
					// for (let i = 0; i < 2; i++) {
					// 	console.log(urls[i])
					// 	await sale.addItem(10, price, urls[i])
					// }
					return wrc721.addMinter(sale.address)
				})
			})
		})
	})
}