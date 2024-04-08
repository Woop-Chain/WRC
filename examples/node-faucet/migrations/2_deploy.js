var Faucet = artifacts.require("Faucet");

module.exports = function (deployer, network, accounts) {

	const WOC = 10000000000000000 //Deploy with a balance of 0.01 WOC

	deployer.then(function () {
		return deployer.deploy(Faucet, {
			value: WOC,
		}).then(function (faucet) {
			// console.log(faucet)
		});
	});
};