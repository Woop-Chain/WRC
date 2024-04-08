var WoopERC20 = artifacts.require("WoopERC20");
const { toHex, toBech32 } = require("./wiki-utils")

//mint amount address

let testAccount = "woc18t4yj4fuutj83uwqckkvxp9gfa0568uc48ggj7";
// myAddress = "0xea877e7412c313cd177959600e655f8ba8c28b40";

//test account address, keys under
//https://github.com/woop-chain/woop/blob/master/.wiki/keystore/woc103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7.key
const myAddress = "woc103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7";

const transferAmount = 2000000;

module.exports = function() {
    async function getWoopERC20Information() {
        let instance = await WoopERC20.deployed();
        let name = await instance.name();
        let total = await instance.totalSupply();
        let decimals = await instance.decimals();
        let mybalance = await instance.balanceOf(toHex(myAddress));
        let testAccBalance = await instance.balanceOf(toHex(testAccount));

        console.log("WoopERC20 is deployed at address " + toBech32(instance.address));
        console.log("Woop ERC20 Information: Name    : " + name);
        console.log("Woop ERC20 Information: Decimals: " + decimals);
        console.log("Woop ERC20 Information: Total   : " + total.toString());
        console.log("my address : " + myAddress);
        console.log("test account address : " + testAccount);
        console.log("my minted    H2O balance is: " + mybalance.toString());
        console.log("test account H2O balance is: " + testAccBalance.toString());

    }
    getWoopERC20Information();
};