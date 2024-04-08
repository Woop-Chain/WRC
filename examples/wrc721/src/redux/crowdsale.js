import { UPDATE, reducer } from '../util/redux-util'
import { getContract } from '../util/wiki-util'
import WRC721Crowdsale from '../build/contracts/WRC721Crowdsale.json'
import { updateProcessing, getBalances } from './woop'

//state
const defaultState = {
    totalItems: 0,
    items: [],
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


/********************************
Hooks
********************************/
export const addItem = ({ Limit, Price, Link }) => async (dispatch, getState) => {

    console.log(Limit, Price, Link)

     dispatch(updateProcessing(true))
    
    //const { wiki, wikiExt, active } = getState().woopReducer
    const { wiki, contract, active } = await getContract(getState().woopReducer, WRC721Crowdsale)
    //console.log(wiki, wikiExt, WRC20Crowdsale, contract)
    
    Limit = parseInt(Limit)
    Limit = Limit > 0 ? Limit : 1
    Price = parseInt(Price)
    Price = Price > 0 ? Price : 0
    Price = new wiki.utils.Unit(Price).asEther().toWei()

    const tx = contract.methods.addItem(Limit, Price, Link).send({
        from: active.address,
        gasLimit: '5000000',
        gasPrice: new wiki.utils.Unit('1').asGwei().toWei(),
    }).on('transactionHash', function (hash) {
        console.log('hash', hash)
    }).on('receipt', function (receipt) {
        console.log('receipt', receipt)
    }).on('confirmation', async (confirmationNumber, receipt) => {
        console.log('confirmationNumber', confirmationNumber, receipt)
        dispatch(getInventory())
        dispatch(updateProcessing(false))
    }).on('error', console.error)

    /********************************
    You won't see an update unless you refresh or call dispatch(getInventory())
    ********************************/
}


export const purchase = ({ index, price }) => async (dispatch, getState) => {
    dispatch(updateProcessing(true))
    
    const { items } = getState().crowdsaleReducer
    //const { wiki, wikiExt, active } = getState().woopReducer
    const { wiki, contract, active } = await getContract(getState().woopReducer, WRC721Crowdsale)
    //console.log(wiki, wikiExt, WRC20Crowdsale, contract)
    console.log(index)
    const tx = contract.methods.purchase(active.address, index).send({
        from: active.address,
        value: new wiki.utils.Unit(price).asEther().toWei(),
        gasLimit: '5000000',
        gasPrice: new wiki.utils.Unit('1').asGwei().toWei(),
    }).on('transactionHash', function (hash) {
        console.log('hash', hash)
    }).on('receipt', function (receipt) {
        console.log('receipt', receipt)
    }).on('confirmation', async (confirmationNumber, receipt) => {
        console.log('confirmationNumber', confirmationNumber, receipt)
        dispatch(getInventory())
        dispatch(updateProcessing(false))
    }).on('error', console.error)
}

export const getRaised = () => async (dispatch, getState) => {
    // const { wiki } = getState().woopReducer
    // const contract = await getContractInstance(wiki, WRC721Crowdsale)
    // const raised = await contract.methods.weiRaised().call({
    //     gasLimit: '210000',
    //     gasPrice: '100000',
    // })
    // const woc = new wiki.utils.Unit(raised).asWei().toEther()
    // dispatch({ type: UPDATE, raised: woc, minted: woc * 1000 })
}

export const getInventory = () => async (dispatch, getState) => {

    //const { wiki, wikiExt, active } = getState().woopReducer
    const { wiki, contract, active } = await getContract(getState().woopReducer, WRC721Crowdsale)
    //console.log(wiki, wikiExt, WRC20Crowdsale, contract)
    const args = {
        gasLimit: '5000000',
        gasPrice: new wiki.utils.Unit('1').asGwei().toWei(),
    }
    let totalItems = await contract.methods.totalItems().call(args)
    totalItems = totalItems ? parseInt(totalItems.toNumber()) : 0
    console.log(totalItems)
    const items = []
    for (let i = 0; i < totalItems; i++) {
        const limit = parseInt(await contract.methods.getLimit(i).call(args), 16)
        const minted = parseInt(await contract.methods.getMinted(i).call(args), 16)
        let price = (await contract.methods.getPrice(i).call(args)).toString()
        price = new wiki.utils.Unit(price).asWei().toEther().toString()
        const url = await contract.methods.getUrl(i).call(args)

        items.push({
            index: i, limit, minted, price, url, isSoldOut: minted == limit
        })
    }
    dispatch({type: UPDATE, items})
}

export const crowdsaleInit = () => async (dispatch, getState) => {
    // const { wiki } = getState().woopReducer
    // const crowdsale = await getContractInstance(wiki, WRC721Crowdsale)
    dispatch(getInventory())
    
    //args TokensPurchased event
    // const args = {
    //     fromBlock: '0x0',
    //     toBlock: 'latest',
    //     address: contract.options.address,
    //     topics: [Object.keys(contract.events)[1]]
    // }

    // // contract.events.TokensPurchased(args)
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
