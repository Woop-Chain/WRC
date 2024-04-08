
const config = require('../config')
const { ENV, url, net, port, privateKey } = config
const gasLimit = '1000000'
const gasPrice = '1000000000'

exports.wocToHexAddress = (wiki, address) => wiki.crypto.getAddress(address).basicHex
exports.getContractInstance = (wiki, artifact) => {
    const contract = wiki.contracts.createContract(
        artifact.abi, artifact.networks[net] ? artifact.networks[net].address : config[artifact.contractName]
    )
    return contract
}

exports.callContractMethod = (contract, method, ...args) => contract.methods[method](...args).call({ gasLimit, gasPrice })

exports.txContractMethod = (contract, method, ...args) => new Promise((resolve, reject) => {
    let hash, receipt, error //assigned in listener
    const done = () => resolve({
        hash, receipt, error
    })
    console.log('getContractMethod args', ...args)
    const tx = contract.methods[method](...args)
    .send({
        gasLimit,
        gasPrice
    })
    .on('transactionHash', (_hash) => {
        hash = _hash
        console.log('hash', hash)
    }).on('receipt', (_receipt) => {
        receipt = _receipt
        console.log('receipt', receipt)
    }).on('confirmation', (confirmationNumber, receipt) => {
        done()
    }).on('error', (_error) => {
        error = _error
        done()
    })
    console.log(tx)
})
