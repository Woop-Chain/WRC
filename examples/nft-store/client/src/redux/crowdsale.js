import { UPDATE, reducer } from '../util/redux-util'
import { getContract } from '../util/wiki-util'
import WRC721Crowdsale from '../build/contracts/WRC721Crowdsale.json'
import { approveWRC20 } from './wrc20'
import { getMarket } from './wrc721'
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

export const buyTokenOnSale = ({ price, tokenId }) => async (dispatch, getState) => {
    dispatch(updateProcessing(true))
    const { wiki, contract, active } = await getContract(getState().woopReducer, WRC721Crowdsale)
    const amount = new wiki.utils.Unit(price).asEther().toWei()
    console.log('approving transfer of', amount, 'USD tokens')
    dispatch(approveWRC20({
        address: contract.address,
        amount,
        callback: () => {
            console.log('purchasing item tokenId', tokenId, 'for', amount, 'USD tokens')
            const tx = contract.methods.buyTokenOnSale(tokenId, amount).send({
                from: active.address,
                gasLimit: '5000000',
                gasPrice: new wiki.utils.Unit('1').asGwei().toWei(),
            }).on('transactionHash', function (hash) {
                console.log('hash', hash)
            }).on('receipt', function (receipt) {
                console.log('receipt', receipt)
            }).on('confirmation', async (confirmation) => {
                console.log('confirmation', confirmation)
                await dispatch(getMarket())
                await dispatch(getBalances())
                await dispatch(updateProcessing(false))
            }).on('error', console.error)
        }
    }))
}



export const purchase = ({ index, price }) => async (dispatch, getState) => {
    dispatch(updateProcessing(true))
    const { wiki, contract, active } = await getContract(getState().woopReducer, WRC721Crowdsale)
    const amount = new wiki.utils.Unit(price).asEther().toWei()
    console.log('approving transfer of', amount, 'USD tokens')
    dispatch(approveWRC20({
        address: contract.address,
        amount,
        callback: () => {
            console.log('purchasing item', index, 'for', amount, 'USD tokens')
            const tx = contract.methods.purchaseWithWRC20(amount, index).send({
                from: active.address,
                gasLimit: '5000000',
                gasPrice: new wiki.utils.Unit('1').asGwei().toWei(),
            }).on('transactionHash', function (hash) {
                console.log('hash', hash)
            }).on('receipt', function (receipt) {
                console.log('receipt', receipt)
            }).on('confirmation', async (confirmation) => {
                console.log('confirmation', confirmation)
                await dispatch(getInventory())
                await dispatch(getBalances())
                await dispatch(updateProcessing(false))
            }).on('error', console.error)
        }
    }))
}



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
        dispatch(getBalances())
        dispatch(updateProcessing(false))
    }).on('error', console.error)

    /********************************
    You won't see an update unless you refresh or call dispatch(getInventory())
    ********************************/
}


export const getInventory = () => async (dispatch, getState) => {

    //const { wiki, wikiExt, active } = getState().woopReducer
    const { wiki, contract, active } = await getContract(getState().woopReducer, WRC721Crowdsale)
    // console.log(WRC721Crowdsale)
    // console.log(contract)
    // console.log(wiki)
    //console.log(wiki, wikiExt, WRC20Crowdsale, contract)
    const args = {
        gasLimit: '4000000',
        gasPrice: new wiki.utils.Unit('1').asGwei().toWei(),
    }
    let totalItems = await contract.methods.totalItems().call(args)
    totalItems = totalItems ? parseInt(totalItems.toNumber()) : 0
    // console.log(totalItems)
    const items = []
    for (let i = 0; i < totalItems; i++) {
        const limit = parseInt(await contract.methods.getLimit(i).call(args), 10)
        const minted = parseInt(await contract.methods.getMinted(i).call(args), 10)
        let price = (await contract.methods.getPrice(i).call(args)).toString()
        price = new wiki.utils.Unit(price).asWei().toEther().toString()
        const url = await contract.methods.getUrl(i).call(args)

        items.push({
            index: i, limit, minted, price, url, isSoldOut: minted == limit
        })
    }
    // console.log(items)
    dispatch({type: UPDATE, items})
}

export const crowdsaleInit = () => async (dispatch, getState) => {
    // const { wiki } = getState().woopReducer
    // const crowdsale = await getContractInstance(wiki, WRC721Crowdsale)
    dispatch(getInventory())
    
}

//reducer
export const crowdsaleReducer = ((state) = {
    ...defaultState
}, action) => reducer(state, action)
