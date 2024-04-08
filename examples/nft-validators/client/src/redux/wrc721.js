
import { getReducer, getState } from '../util/redux-util-v2'
import WRC721 from '../build/contracts/WRC721.json'
import { getContract } from '../util/wiki-util'

//state
const defaultState = {
    tokenContract: null,
    market: [],
    balances: {}
}
//reducer
const type = 'wrc721Reducer'
export const wrc721Reducer = getReducer(type, defaultState)
export const wrc721State = getState(type)


export const getTokens = (account) => async (dispatch, getState) => {
    // const { wiki } = getState().woopReducer
    let { balances } = getState().wrc721Reducer
    
    // const wrc721 = await getContractInstance(wiki, WRC721)

    dispatch({type, balances: {} })

    const { wiki, contract: wrc721, active } = await getContract(getState().woopReducer, WRC721)
    if (!wiki) {
        return
    }
    let tokens = await wrc721.methods.balanceOf(account.address).call({
        gasLimit: '5000000',
        gasPrice: new wiki.utils.Unit('1').asGwei().toWei(),
    })
    tokens = tokens ? tokens.toNumber() : 0


    const balance = {}
    for (let i = 0; i < tokens; i++) {
        const tokenId = (await wrc721.methods.tokenOfOwnerByIndex(account.address, i).call({
            gasLimit: '210000',
            gasPrice: '100000',
        })).toNumber()
        const itemIndex = (await wrc721.methods.getItemIndex(tokenId).call({
            gasLimit: '210000',
            gasPrice: new wiki.utils.Unit('1').asGwei().toWei(),
        })).toNumber()
        let salePrice = (await wrc721.methods.getSalePrice(tokenId).call({
            gasLimit: '210000',
            gasPrice: new wiki.utils.Unit('1').asGwei().toWei(),
        })).toString()
        salePrice = new wiki.utils.Unit(salePrice).asWei().toEther().toString()

        if (balance[itemIndex] !== undefined) {
            balance[itemIndex].push({tokenId, salePrice})
        } else {
            balance[itemIndex] = [{tokenId, salePrice}]
        }
    }
    balances = { ...balances, [account.address]: balance }
    dispatch({type, balances })
}



/********************************
Not used in this app
********************************/


// export const getMarket = (account) => async(dispatch, getState) => {

//     const { wiki, contract: wrc721, active } = await getContract(getState().woopReducer, WRC721)
//     const { contract: wrc721Crowdsale } = await getContract(getState().woopReducer, WRC721Crowdsale)
//     if (!wiki) {
//         return
//     }

//     const args = {
//         gasLimit: '5000000',
//         gasPrice: new wiki.utils.Unit('1').asGwei().toWei(),
//     }

//     const market = []
//     let tokens = await wrc721.methods.totalSupply().call(args)
//     tokens = tokens ? tokens.toNumber() : 0

//     for (let i = 0; i < tokens; i++) {
//         const tokenId = i+1
//         let price = (await wrc721.methods.getSalePrice(tokenId).call({...args})).toString()
//         if (price !== '0') {
//             price = new wiki.utils.Unit(price).asWei().toEther().toString()
//             const url = (await wrc721Crowdsale.methods.getTokenData(tokenId).call({...args}))
//             market.push({ price, url, tokenId })
//         }
//     }
//     // console.log(market)
//     dispatch({type, market })
// }


// export const setSell = ({ tokenId, amount }) => async (dispatch, getState) => {
//     dispatch(updateProcessing(true))
//     dispatch(updateDialogState({ open: false }))
//     const { wiki, contract, active } = await getContract(getState().woopReducer, WRC721)
//     const { contract: crowdsale } = await getContract(getState().woopReducer, WRC721Crowdsale)
//     // clean args
//     amount = new wiki.utils.Unit(amount).asEther().toWei()
//     const tx = contract.methods.setSale(tokenId, amount, crowdsale.address).send({
//         from: active.address,
//         gasLimit: '5000000',
//         gasPrice: new wiki.utils.Unit('1').asGwei().toWei(),
//     }).on('transactionHash', function (hash) {
//         console.log('hash', hash)
//     }).on('receipt', function (receipt) {
//         console.log('receipt', receipt)
//     }).on('confirmation', async (confirmationNumber, receipt) => {
//         console.log('confirmationNumber', confirmationNumber, receipt)
//         dispatch(getBalances())
//         dispatch(updateProcessing(false))
//     }).on('error', console.error)
// }