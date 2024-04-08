import { getReducer, getState, UPDATE } from '../util/redux-util'
import WRC20 from '../build/contracts/WRC20.json'
import { getContract, wocToHexAddress } from '../util/wiki-util'
import { updateProcessing, getBalances } from './woop'
//default state
const defaultState = {
	tokenContract: null,
    wrc20balances: {}
}
export const wrc20Reducer = getReducer(defaultState)
export const wrc20State = getState('wrc20Reducer', defaultState)
//functions

export const approveWRC20 = ({ address, amount, callback }) => async (dispatch, getState) => {
    dispatch(updateProcessing(true))
    const { wiki, contract, active } = await getContract(getState().woopReducer, WRC20)
    // validate and clean args
    amount = new wiki.utils.Unit(amount).asEther().toWei()
    address = wocToHexAddress(wiki, address)
    const tx = contract.methods.approve(address, amount).send({
        from: active.address,
        gasLimit: '5000000',
        gasPrice: new wiki.utils.Unit('1').asGwei().toWei(),
    }).on('transactionHash', function (hash) {
        console.log('hash', hash)
    }).on('receipt', function (receipt) {
        console.log('receipt', receipt)
    }).on('confirmation', async (confirmation, receipt) => {
        console.log('confirmation', confirmation, receipt)
        if (callback) callback()
        else {
            dispatch(updateProcessing(false))
        }
    }).on('error', console.error)
}


export const transferWRC20 = ({ amount, address }) => async (dispatch, getState) => {
    dispatch(updateProcessing(true))
    const { wiki, contract, active } = await getContract(getState().woopReducer, WRC20)
    // validate and clean args
    amount = new wiki.utils.Unit(amount).asEther().toWei()
    address = wocToHexAddress(wiki, address)
    // 
    const tx = contract.methods.transfer(address, amount).send({
        from: active.address,
        gasLimit: '5000000',
        gasPrice: new wiki.utils.Unit('1').asGwei().toWei(),
    }).on('transactionHash', function (hash) {
        console.log('hash', hash)
    }).on('receipt', function (receipt) {
        console.log('receipt', receipt)
    }).on('confirmation', async (confirmationNumber, receipt) => {
        console.log('confirmationNumber', confirmationNumber, receipt)
        dispatch(getBalances())
        dispatch(updateProcessing(false))
    }).on('error', console.error)
}


export const balanceOf = (account) => async (dispatch, getState) => {
    const { wiki, contract: wrc20, active } = await getContract(getState().woopReducer, WRC20)
    if (!wiki) {
        return
    }
    // console.log(account)
    let tokens = await wrc20.methods.balanceOf(account.address).call({
        gasLimit: '5000000',
        gasPrice: new wiki.utils.Unit('1').asGwei().toWei(),
    })
    //convert decimals
    tokens = new wiki.utils.Unit(tokens ? tokens.toString() : '0').asWei().toEther()
    const { wrc20balances } = getState().wrc20Reducer
    wrc20balances[account.name] = tokens.toString()
    dispatch({ type: UPDATE, wrc20balances })
}