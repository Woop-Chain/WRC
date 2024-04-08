import web3 from 'web3'

import { getReducer, getState } from '../util/redux-util'

//woop imports
import { getContract, waitForInjected, getExtAccount } from '../util/wiki-util'
import { Woop, WoopExtension } from '@woop-js/core'
import { ChainID, ChainType } from '@woop-js/utils'

//import contract ABI
import NameService from '../build/contracts/NameService.json'

//from config.js
import config from '../../config'
const { net, url } = config


//default state
const defaultState = {
	wiki: null,
	account: null,
	initialized: false,
	nameFromChain: '',
}
const type = 'woopReducer'
export const woopReducer = getReducer(type, defaultState)
export const woopState = getState(type)
//functions
const weiToWoc = (wiki, v) => Math.floor(new wiki.utils.Unit(v).asWei().toEther() * 10000) / 10000

export const init = () => async (dispatch, getState) => {
	

	// console.log(url)
    const wiki = new Woop(url, {
        chainType: ChainType.Woop,
        chainId: net,
    })
	dispatch({ type, wiki })

    // 0x7c41e0668b551f4f902cfaec05b5bdca68b124ce
    const account = wiki.wallet.addByPrivateKey('45e497bd45a9049bcb649016594489ac67b9f052a6cdf5cb74ee2427a60bf25e')
    account.name = 'Alice'
    

	let balance = (await wiki.blockchain.getBalance({ address: account.address, shardID: 0 }).catch((err) => {
		console.log(err);
	}))
    account.balanceWOC = weiToWoc(wiki, balance ? balance.result : 0)


	dispatch({ type, account, wiki, initialized: true })
}


export const setAddressName = (name) => async (dispatch, getState) => {
	const { wiki, account } = getState().woopReducer
	const { contract } = getContract({ wiki }, NameService)

	name = web3.utils.asciiToHex(name).padEnd(66, '0')

	const tx = contract.methods.setName(name).send({
        from: account.address,
        gasLimit: '2000000',
        gasPrice: new wiki.utils.Unit('1').asGwei().toWei(),
    }).on('transactionHash', function (hash) {
        console.log('hash', hash)
    }).on('receipt', function (receipt) {
        console.log('receipt', receipt)
    }).on('confirmation', async (confirmation) => {
        console.log('confirmation', confirmation)
    }).on('error', console.error)
}


export const getNameByAddress = (address) => async (dispatch, getState) => {
	const { wiki, account } = getState().woopReducer
	const { contract } = getContract({ wiki }, NameService)

	const name = await contract.methods.getName(address).call({
        from: account.address,
        gasLimit: '2000000',
        gasPrice: new wiki.utils.Unit('1').asGwei().toWei(),
	})
	const nameFromChain = web3.utils.hexToAscii(name)
	dispatch({ type, nameFromChain })
}