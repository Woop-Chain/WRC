import { UPDATE, reducer } from '../util/redux-util'
import { getContract, wocToHexAddress } from '../util/wiki-util'
import WoopMintable from '../build/contracts/WoopMintable.json'
import {getBalances, updateProcessing} from './woop'

//state
const defaultState = {
    tokenContract: null,
}
const wrc20Keys = Object.keys(defaultState)
export const wrc20State = ({ wrc20Reducer: { ...keys } }) => {
    Object.keys(keys).forEach((k) => {
        if (!wrc20Keys.includes(k)) delete keys[k]
    })
    return keys
}
export const transferWRC = ({ amount, address }) => async (dispatch, getState) => {


    dispatch(updateProcessing(true))
    dispatch({ type: UPDATE })
    const { wiki, contract, active } = await getContract(getState().woopReducer, WoopMintable)


    console.log(address)
    address = wocToHexAddress(wiki, address)
    console.log(address)


    const tx = contract.methods.transfer(address, new wiki.utils.Unit(amount).asEther().toWei()).send({
        from: active.address,
        gasLimit: '1000000',
        gasPrice: new wiki.utils.Unit('10').asGwei().toWei(),
    }).on('transactionHash', function(hash){
        console.log(hash)
    }).on('receipt', function(receipt){
        console.log(receipt)
    }).on('confirmation', function(confirmationNumber, receipt){
        console.log(confirmationNumber, receipt)
        dispatch(getBalances(active))
        dispatch(updateProcessing(false))
    }).on('error', console.error)
}

export const getBalanceWRC = (account) => async (dispatch, getState) => {
    const { wiki, contract } = await getContract(getState().woopReducer, WoopMintable)
    const balance = await contract.methods.balanceOf(account.address).call({
        gasLimit: '2100000',
        gasPrice: '1000000000',
    })
    if (balance === null) {
        console.log('contracts not deployed, use ./deploy.sh')
        return
    }
    account.balanceWRC = new wiki.utils.Unit(balance).asWei().toEther()
    dispatch({ type: UPDATE, [account.name]: account })
}

//reducer
export const wrc20Reducer = (state = {
    ...defaultState
}, action) => reducer(state, action)
