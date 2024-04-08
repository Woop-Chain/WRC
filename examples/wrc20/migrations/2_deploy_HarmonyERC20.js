var WoopERC20 = artifacts.require("WoopMintable");
var WRC20Crowdsale = artifacts.require("WRC20Crowdsale");

module.exports = function (deployer, network, accounts) {

	const name = "WoopWRC20"
	const symbol = "WRC20"
	const decimals = 18
	const rate = 1000
	const saleAmount = web3.utils.toWei('1000000', 'ether')
	const minterTokens = web3.utils.toWei('0', 'ether')

	deployer.then(function () {
		return deployer.deploy(WoopERC20, name, symbol, decimals, minterTokens).then(function (token) {
			return deployer.deploy(WRC20Crowdsale, rate, accounts[0], token.address, saleAmount).then(function (sale) {
				return token.addMinter(sale.address).then((res) => {
					console.log(res.logs)
					return res
				})
			})
		});
	});
};