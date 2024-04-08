import { UPDATE, reducer } from '../util/redux-util'
import { getContract } from '../util/wiki-util'
import WRC20Crowdsale from '../build/contracts/WRC20Crowdsale.json'
import { updateProcessing, getBalances } from './woop'
import { ChainID, ChainType } from '@woop-js/utils'

//state
const defaultState = {
    raised: 0,
    minted: 0,
    tokenContract: null,
    events: [],
}
const crowdsaleKeys = Object.keys(defaultState)
export const crowdsaleState = ({ crowdsaleReducer: { ...keys } }) => {
    Object.keys(keys).forEach((k) => {
        if (!crowdsaleKeys.includes(k)) delete keys[k]
    })
    return keys
}
export const purchaseWRC = ({ amount }) => async (dispatch, getState) => {
    dispatch(updateProcessing(true))
    dispatch({ type: UPDATE })
    //const { wiki, wikiExt, active } = getState().woopReducer
    const { wiki, contract, active } = await getContract(getState().woopReducer, WRC20Crowdsale)
    //console.log(wiki, wikiExt, WRC20Crowdsale, contract)

    const tx = contract.methods.buyTokens(active.address).send({
        from: active.address,
        value: new wiki.utils.Unit(amount).asEther().toWei(),
        gasLimit: '1000000',
        gasPrice: new wiki.utils.Unit('1').asGwei().toWei(),
    }).on('transactionHash', function (hash) {
        console.log('hash', hash)
    }).on('receipt', function (receipt) {
        console.log('receipt', receipt)
    }).on('confirmation', async (confirmationNumber, receipt) => {
        console.log('confirmationNumber', confirmationNumber, receipt)
        dispatch(getBalances(active))
        dispatch(updateProcessing(false))
    }).on('error', console.error)
}

export const getRaised = () => async (dispatch, getState) => {
    const { wiki, contract } = await getContract(getState().woopReducer, WRC20Crowdsale)
    const raised = await contract.methods.weiRaised().call({
        gasLimit: '210000',
        gasPrice: '100000',
    })
    const woc = new wiki.utils.Unit(raised || '0').asWei().toEther()
    dispatch({ type: UPDATE, raised: woc, minted: woc * 1000 })

}

export const crowdsaleInit = () => async (dispatch, getState) => {
    const { wiki, contract } = await getContract(getState().woopReducer, WRC20Crowdsale)
    //args TokensPurchased event
    const args = {
        fromBlock: '0x0',
        toBlock: 'latest',
        address: contract.options.address,
        topics: [Object.keys(contract.events)[1]]
    }

    // contract.events.TokensPurchased(args)
    // wiki.blockchain.logs(args, wiki.blockchain.messenger, wiki.blockchain.messenger.currentShard)
    //     .on('data', (logs) => {
    //         // console.log(logs)
    //         if (!logs) return
    //         if (logs.params && logs.params.result) logs = logs.params.result
    //         if (!logs.data) return
    //         const args = contract.abiCoder.decodeParameters(['uint256', 'uint256'], logs.data)
    //         const topics = logs.topics.map((topic, i) => {
    //             if (i === 0) return
    //             return contract.abiCoder.decodeParameters(['address'], topic)[0]
    //         }).filter((a) => !!a)
    //         // console.log(topics)
    //         const values = Object.keys(args).map((k) => new wiki.utils.Unit(args[k]).asWei().toEther())
    //         // console.log(values)
    //         const event = {
    //             woc: values[0],
    //             wrc: values[1],
    //             purchaser: topics[0],
    //             beneficiary: topics[1],
    //         }
    //         const events = getState().crowdsaleReducer.events.slice()
    //         events.push(event)
    //         dispatch({type: UPDATE, events})
    //     })
}

//reducer
export const crowdsaleReducer = ((state) = {
    ...defaultState
}, action) => reducer(state, action)
