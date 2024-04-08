
import { Woop } from '@woop-js/core'
import { ChainType } from '@woop-js/utils'

/********************************
In Memory Storage (use whatever you want, e.g. another module)
********************************/
let wiki
/********************************
Exported Methods (use these)
********************************/

/********************************
Woop
********************************/
export const initWoop = async (url, chainId) => {
    //prepare Woop instance
    wiki = createWiki(url, chainId)
    await setSharding(wiki)
}
export const setDefaultWallet = (privateKey) => {
    if (!wiki) {
        console.log('call initWoop first')
        return
    }
	const signer = wiki.wallet.addByPrivateKey(privateKey)
    wiki.wallet.setSigner(signer.address)
	console.log('default signer set to address', signer.bech32Address)
}

/********************************
Transfers WOC tokens

@param {string} to address
@param {string} from address
@param {string|number} value The value to transfer in WOC (will be converted to BigInt)
@param {number} [toShard] shard we're sending to
@param {number} [fromShard] shard we're sending from

@return {Promise<object{}>} The promise always resolves and returns the object { hash, receipt, error }
********************************/
export const transfer = async({to, from, value, toShard, fromShard}) => new Promise((resolve, reject) => {
    // clean up the sharding args
	toShard = !toshard ? 0x0 : '0x' + toshard
    fromShard = !fromshard ? 0x0 : '0x' + fromshard
    //prepare response (these get set in listeners)
    let hash, receipt, error
    const done = () => resolve({
        hash, receipt, error
    })
	//prepare transaction
	const tx = wiki.transactions.newTx({
        to,
        value: valueToWOC(value),
        gasLimit: '1000000',
        shardID: fromShard,
        toShardID: toShard,
        gasPrice: valueToGas(value),
    });
    const signedTX = await wiki.wallet.signTransaction(tx);
    signedTX.observed().on('transactionHash', (_hash) => {
        hash = _hash
        console.log('transactionHash', hash)
    }).on('receipt', (_receipt) => {
        receipt = _receipt
        console.log('receipt\n\n', receipt)
        done()
    }).on('error', (error) => {
        error = _error
        console.log(error)
        done()
	})
    const [sentTX, txHash] = await signedTX.sendTransaction()
    try {
		await sentTX.confirm(txHash)
        done()
	}
	catch (_error) {
        error = _error
        done()
    }
})

/********************************
Contracts
********************************/

/********************************
Calls a contract method (not a transaction) and returns the promise

@param {object} artifact The truffle artifact
@param {string} address The contract address
@param {string} method The contract method to call (not a transaction)
@param {array} args arguments to be passed to the contract method call

@return {Promise<object{}>} The promise is returned by the Woop JS SDK (you may have to await this and pass the value or undefined if error)
********************************/
export const callContractMethod = ({ artifact, address, method, args }) => {
    const contract = getContractInstance(artifact, address)
    if (!contract) return
    return args ?
        contract.methods[method](...args).call() :
        contract.methods[method]().call()
}

/********************************
Calls a contract method as a stateful transaction

@param {object} artifact The truffle artifact
@param {string} address The contract address
@param {string} method The contract method to call (not a transaction)
@param {array} args arguments to be passed to the contract method call

@return {Promise<object{}>} The promise always resolves and returns the object { hash, receipt, error }
********************************/
export const txContractMethod = ({ artifact, address, method, args }) => new Promise((resolve, reject) => {
    const contract = getContractInstance(artifact, address)
    if (!contract) return { error: 'no contract instance' }
    let hash, receipt, error
    const done = () => resolve({
        hash, receipt, error
    })
    // console.log('getContractMethod args', ...args)
    const tx = contract.methods[method](...args)
    .send({
        gasLimit,
        gasPrice
    })
    .on('transactionHash', (_hash) => {
        hash = _hash
        console.log('transactionHash', hash)
    }).on('receipt', (_receipt) => {
        receipt = _receipt
        console.log('receipt\n\n', receipt)
        console.log('\n\n')
    }).on('confirmation', (confirmationNumber, receipt) => {
        console.log('confirmed')
        done()
    }).on('error', (_error) => {
        error = _error
        console.log(error)
        done()
    })
})

/********************************
@WARNING
`wiki` is expected to be in this module's scope and initialized (see top)
********************************/
const getContractInstance = (artifact, address) => {
    if (!wiki) {
        console.log('call initWoop first')
        return
    }
    const contract = wiki.contracts.createContract(artifact.abi, address)
    if (!contract) console.log('error creating contract instance')
    return contract
}
const createWiki = (url, chainId) => new Woop(url, { chainType: ChainType.Woop, chainId })
const setSharding = async (wiki) => { 
	const res = await wiki.blockchain.getShardingStructure();
	wiki.shardingStructures(res.result);
}
// tiny helpers
const valueToWOC = (value) => new wiki.utils.Unit(value).asEther().toWei()
const valueToGas = (value) => new wiki.utils.Unit(value).asGwei().toWei()
const wocToHexAddress = (address) => wiki.crypto.getAddress(address).basicHex
const hexToWocAddress = (address) => wiki.crypto.toBech32(address)