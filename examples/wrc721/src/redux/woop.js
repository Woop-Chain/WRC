import { UPDATE, reducer } from '../util/redux-util'
import { waitForInjected, getExtAccount } from '../util/hmy-util'
import { Woop, WoopExtension } from '@woop-js/core'
import { ChainID, ChainType } from '@woop-js/utils'
import { getTokens, getMarket } from './wrc721'
import { crowdsaleInit, getRaised } from './crowdsale'

import config from '../../config'
const { ENV, network, net, url } = config

//state
const defaultState = {
    woop: null,
    hmy: null,
    hmyExt: null,
    active: null,
    minter: null,
    account: null,
    bech32Addresses: [],
    addresses: [],
    //app ui state, should be in app.js reducer (TBD)
    processing: false,
    dialogState: {
        open: false,
        title: '',
        content: null,
    },
}
const woopKeys = Object.keys(defaultState)
export const woopState = ({ woopReducer: { ...keys } }) => {
    Object.keys(keys).forEach((k) => {
        if (!woopKeys.includes(k)) delete keys[k]
    })
    return keys
}
/********************************
Functions / Actions
********************************/

export const updateDialogState = (dialogState) => async (dispatch) => {
    dispatch({ type: UPDATE, dialogState })
}
export const updateProcessing = (processing) => async (dispatch) => {
    dispatch({ type: UPDATE, processing })
}

/********************************
This is only enabled for localnet hmy e.g. Alice's account
********************************/

export const transferWOC = ({ amount, address }) => async (dispatch, getState) => {
    dispatch(updateProcessing(true))
    const { hmy, hmyExt, active } = getState().woopReducer
    if (!hmy) {
        console.log('call loadContracts first')
        return
    }
    console.log(new hmy.utils.Unit(amount).asEther().toWei(),address)
    const woop = active.isExt ? hmyExt : hmy
    const tx = woop.transactions.newTx({
        to: address,
        value: new hmy.utils.Unit(amount).asEther().toWei(),
        gasLimit: '210000',
        shardID: 0,
        toShardID: 0,
        gasPrice: new hmy.utils.Unit('1').asGwei().toWei(),
    });
    console.log(woop)
    const signedTX = await woop.wallet.signTransaction(tx);
    signedTX.observed().on('transactionHash', (txHash) => {
        console.log('--- txHash ---', txHash);
    })
    .on('receipt', (receipt) => {
        console.log('--- receipt ---', receipt);
        const { active } = getState().woopReducer
        dispatch(getBalances(active))
        dispatch(updateProcessing(false))
    }).on('error', console.error)
    const [sentTX, txHash] = await signedTX.sendTransaction();
    const confirmedTX = await sentTX.confirm(txHash);
    console.log(confirmedTX)
}

export const setActive = (which) => async (dispatch, getState) => {
    const state = getState().woopReducer
    const active = state[which]
    if (!active) return
    const { hmy } = state
    if (!hmy) {
        console.log('call loadContracts first')
        return
    }
    if (!active.isExt) {
        hmy.wallet.setSigner(active.address)
    }
    dispatch({ type: UPDATE, active })
    dispatch(getBalances(active))
}
export const getBalanceWOC = (account) => async (dispatch, getState) => {
    const { hmy, hmyExt } = getState().woopReducer
    if (!hmy) {
        console.log('call loadContracts first')
        return
    }
    let result
    if (account.isExt) {
        result = (await hmyExt.blockchain.getBalance({ address: account.address }).catch((err) => {
            console.log(err);
        })).result
    } else {
        result = (await hmy.blockchain.getBalance({ address: account.address }).catch((err) => {
            console.log(err);
        })).result
    }
    account.balanceWOC = new hmy.utils.Unit(result).asWei().toEther()

    dispatch({ type: UPDATE, [account.name]: account })
}
export const getBalances = (account) => async (dispatch, getState) => {
    const { active } = getState().woopReducer
    dispatch(getBalanceWOC(account || active))
    dispatch(getTokens(account || active))
    dispatch(getRaised(account || active))
}

export const woopInit = () => async (dispatch) => {
    console.log(url)
    const hmy = new Woop(url, {
        chainType: ChainType.Woop,
        chainId: net,
    })
    dispatch({ type: UPDATE, hmy })

    const woop = await waitForInjected(1)
    let hmyExt
    if (woop) {
        hmyExt = new WoopExtension(woop, {
            chainId: net
        });
        dispatch({ type: UPDATE, hmyExt })
    }

    // 0x7c41e0668b551f4f902cfaec05b5bdca68b124ce
    const minter = hmy.wallet.addByPrivateKey('45e497bd45a9049bcb649016594489ac67b9f052a6cdf5cb74ee2427a60bf25e')
    minter.name = 'Alice'
    // 0xea877e7412c313cd177959600e655f8ba8c28b40
    let account
    if (!hmyExt) {
        account = hmy.wallet.addByMnemonic('surge welcome lion goose gate consider taste injury health march debris kick')
        account.name = 'Bob'
    } else {
        account = await getExtAccount(hmyExt)
        account.name = 'My Account'
    }

    const bech32Addresses = [account.bech32Address, minter.bech32Address]

    if (ENV !== 'local') {
        bech32Addresses.pop()
    }
    dispatch({ type: UPDATE,
        minter, account,
        bech32Addresses
    })

    dispatch(setActive('account'))
    if (ENV === 'local') {
        console.log("setting minter")
        dispatch(setActive('minter'))
    }

    dispatch(crowdsaleInit())

}

//reducer
export const woopReducer = (state = {
    ...defaultState
}, action) => reducer(state, action)
