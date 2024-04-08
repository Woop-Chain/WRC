require('dotenv').config()

let network, net, privateKey, url
let WRC721Auction, WRC721

const ENV = process.env.ENV
const gasLimit = process.env.GAS_LIMIT
const gasPrice = process.env.GAS_PRICE

switch(ENV) {
    case 'local': {
        network = 0;
        net = 2;
        privateKey = process.env.LOCAL_PRIVATE_KEY
        url = process.env.LOCAL_0_URL;
        break;
    }
    case 'testnet': {
        network = 1;
        net = 2;
        url = process.env.TESTNET_0_URL
        WRC721Auction = process.env.TESTNET_WRC721Auction
        WRC721 = process.env.TESTNET_WRC721
        break;
    }
    case 'mainnet': {
        network = 2;
        net = 1;
        url = process.env.MAINNET_0_URL
        WRC721Auction = process.env.MAINNET_WRC721Auction
        WRC721 = process.env.MAINNET_WRC721
        break;
    }
}


export default {
    ENV: ENV,
    gasLimit: gasLimit,
    gasPrice: gasPrice,
    network: network, // 0 local, 1 testnet, 2 mainnet
    net: net, //TODO: change name
    url: url,
    privateKey: privateKey,
    port: 3000,
    filterMyAddress: true,
    //use these if not deploying contract or targeting a different deployment on (same or ) different network
    WRC721Auction,
    WRC721
}

