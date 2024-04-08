var WoopERC20 = artifacts.require("WoopERC20");
const { toHex, toBech32 } = require("./wiki-utils")

//mint amount address
const myAddress = "woc103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7";

//test account address, keys under
//https://github.com/woop-chain/woop/blob/master/.wiki/keystore/woc103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7.key
let testAccount = "woc18t4yj4fuutj83uwqckkvxp9gfa0568uc48ggj7";

const transferAmount = 20000;

module.exports = function() {
    async function getWoopERC20Information() {
        let instance = await WoopERC20.deployed();
        let name = await instance.name();
        let total = await instance.totalSupply();
        let decimals = await instance.decimals();
        
        console.log('calling transfer')
        const tx = await instance.transfer(toHex(testAccount), transferAmount);
        let testAccBalance = await instance.balanceOf(toHex(testAccount));
        let myAddrBalance = await instance.balanceOf(toHex(myAddress));

        console.log("WoopERC20 is deployed at address " + toBech32(instance.address));
        console.log("Woop ERC20 Information: Name    : " + name);
        console.log("Woop ERC20 Information: Decimals: " + decimals);
        console.log("Woop ERC20 Information: Total   : " + total.toString());
        console.log("my address : " + myAddress);
        console.log("test account address : " + testAccount);
        console.log("my minted    H2O balance is: " + myAddrBalance.toString());
        console.log("test account H2O balance is: " + testAccBalance.toString());
        console.log("\ntransfered " + transferAmount.toString() + " from my address (minter) to test account");
    }
    getWoopERC20Information();
};