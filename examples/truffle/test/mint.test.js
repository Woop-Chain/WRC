var WoopERC20 = artifacts.require("WoopERC20");

const gasLimit = process.env.GAS_LIMIT
const gasPrice = process.env.GAS_PRICE

contract("WRC20", (accounts) => {
    let wrc20
	const alice = accounts[0], bob = accounts[1]
	it("should be deployed", async () => {
        wrc20 = await WoopERC20.deployed();
        assert.ok(wrc20)
    })
    
    it("should transfer some tokens", async () => {
        const tx = await wrc20.transfer(bob, 1000, {
            from: alice
        });
        let balance = await wrc20.balanceOf(bob);
        assert.equal(balance.toString(), '1000')
    })
});