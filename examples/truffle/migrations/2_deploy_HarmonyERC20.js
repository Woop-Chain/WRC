var WoopERC20 = artifacts.require("WoopERC20");

module.exports = function(deployer, network, accounts) {

const name = "WoopERC20"
const symbol = "W20"
const decimals = 18
const amount = 1000000
const tokens = web3.utils.toWei(amount.toString(), 'ether')

deployer.then(function() {
  return deployer.deploy(WoopERC20, name, symbol, decimals, tokens).then(function() {
    });
  });
};