import { getReducer, getState } from '../util/redux-util-v2'
import { waitForInjected, getExtAccount } from '../util/hmy-util'
import { Woop, WoopExtension } from '@woop-js/core'
import { ChainID, ChainType } from '@woop-js/utils'
// import { balanceOf } from './wrc20'
import { getTokens, getMarket } from './wrc721'
import { auctionInit } from './auction'

import config from '../../config'
const { ENV, network, net, url } = config

//state
const defaultState = {
    isSignedIn: false,
    accountLocked: false,
    woop: null,
    hmy: null,
    hmyExt: null,
    active: null,
    minter: null,
    account: null,
    bech32Addresses: [],
    addresses: [],
    allowToggle: false,
    //app ui state, should be in app.js reducer (TBD)
    processing: true,
    dialogState: {
        open: false,
        title: '',
        content: null,
    },
}
//reducer
const type = 'woopReducer'
export const woopReducer = getReducer(type, defaultState)
export const woopState = getState(type)
/********************************
Functions / Actions
********************************/

export const updateDialogState = (dialogState) => async (dispatch) => {
    dispatch({ type, dialogState })
}
export const updateProcessing = (processing) => async (dispatch) => {
    dispatch({ type, processing })
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
    dispatch({ type, active })
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
        result = (await hmyExt.blockchain.getBalance({ address: account.address, shardID: 0 }).catch((err) => {
            console.log(err);
        })).result
    } else {
        result = (await hmy.blockchain.getBalance({ address: account.address, shardID: 0 }).catch((err) => {
            console.log(err);
        })).result
    }
    account.balanceWOC = weiToWoc(hmy, result)
    dispatch({ type, [account.name]: account })
}

const weiToWoc = (hmy, v) => Math.floor(new hmy.utils.Unit(v).asWei().toEther() * 10000) / 10000

export const getBalances = (account) => async (dispatch, getState) => {
    const { active } = getState().woopReducer
    dispatch(getBalanceWOC(account || active))
    // dispatch(balanceOf(account || active))
    dispatch(getTokens(account || active))
}

export const signOut = () => async (dispatch, getState) => {
    dispatch({ type, ...defaultState, processing: false })
}

export const signIn = (authedAccount) => async (dispatch, getState) => {
    let { hmy, hmyExt } = getState().woopReducer
    if (!hmy && !hmyExt) {
        await dispatch(woopInit());
        ({ hmy, hmyExt } = getState().woopReducer)
    }

    // 0x7c41e0668b551f4f902cfaec05b5bdca68b124ce
    const minter = hmy.wallet.addByPrivateKey('45e497bd45a9049bcb649016594489ac67b9f052a6cdf5cb74ee2427a60bf25e')
    minter.name = 'Alice'
    // 0xea877e7412c313cd177959600e655f8ba8c28b40
    
    // try to set up the ext account
    let account = await getExtAccount(hmyExt)
    if (account.address) {
        account.name = 'Extension'
        dispatch({ type, isSignedIn: true })
        console.log('Using Extension', account)
    } else {
        dispatch({ type, accountLocked: true })
        //set up failed, so use bob
        account = hmy.wallet.addByMnemonic('surge welcome lion goose gate consider taste injury health march debris kick')
        account.name = 'Bob'
    }

    const bech32Addresses = [account.bech32Address, minter.bech32Address]

    if (ENV !== 'local') {
        bech32Addresses.pop()
    }
    dispatch({ type,
        minter, account,
        bech32Addresses
    })

    if (authedAccount) {
        dispatch(setActive(authedAccount))
    } else {
        dispatch(setActive('account'))
        if (ENV === 'local') {
            dispatch({ type, allowToggle: true })
            console.log("setting minter")
            dispatch(setActive('minter'))
        }
    }

    dispatch(auctionInit())
}

export const woopInit = () => async (dispatch) => {
    // console.log(url)
    const hmy = new Woop(url, {
        chainType: ChainType.Woop,
        chainId: net,
    })
    dispatch({ type, hmy })

    const woop = await waitForInjected(1)
    let hmyExt
    if (woop) {
        hmyExt = new WoopExtension(woop, {
            chainId: net
        });
        dispatch({ type, hmyExt })
    }
    return { hmy, hmyExt }
}