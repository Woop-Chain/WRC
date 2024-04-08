import config from '../../config'
const { net, url } = config

//TODO: naming
export const getContract = (state, artifact) => {
    const { wiki, wikiExt, active } = state
    if (!wiki) {
        console.trace('call loadContracts first')
        return {}
    }
    const woop = active && active.isExt ? wikiExt : wiki
    // console.log(woop)
    const contract = getContractInstance(woop, artifact)
    // console.log(contract)
    return { wiki, contract, active }
}
export const getContractInstance = (wiki, artifact) => {
    
    // console.log(wiki, artifact)

    const contract = wiki.contracts.createContract(
        artifact.abi, artifact.networks[net] ? artifact.networks[net].address : config[artifact.contractName]
    )
    return contract
}
export const wocToHexAddress = (wiki, address) => wiki.crypto.getAddress(address).basicHex

export const getExtAccount = async (wikiExt) => {
    if (!wikiExt) return {}
    console.log(url)
    wikiExt.setProvider(url)
    let account = {}
    account = await wikiExt.wallet.getAccount().catch((err) => {
        account.locked = true
        console.log(err)
    })
    if (!account || account.locked) return { locked: true }
    account.isExt = true
    account.bech32Address = account.address
    account.address = wikiExt.crypto.getAddress(account.address).basicHex
    return account
}
export const waitForInjected = (sec) => new Promise((resolve) => {
    const max = sec * 1000 / 250
    let tries = 0
    const check = () => {
        tries++
        if (tries >= max) {
            resolve(false)
            return
        }
        if (!window.woop) setTimeout(check, 250)
        else resolve(window.woop)
    }
    check()
})