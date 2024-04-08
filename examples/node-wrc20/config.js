require('dotenv').config()

let network, net, url, privateKey
let WRC20Crowdsale, WRC20, Migrations 

switch(process.env.ENV){
    case 'local': {
        network = 0;
        net = 2;
        url = process.env.LOCAL_0_URL
        privateKey = process.env.LOCAL_PRIVATE_KEY
        break;
    }
    case 'testnet': {
        network = 1;
        net = 2;
        url = process.env.TESTNET_0_URL
        privateKey = process.env.TESTNET_PRIVATE_KEY
        WRC20Crowdsale = process.env.TESTNET_WRC20CROWDSALE
        WRC20 = process.env.TESTNET_WRC20
        Migrations = process.env.TESTNET_MIGRATIONS
        break;
    }
    case 'mainnet': {
        network = 2;
        net = 1;
        url = process.env.MAINNET_0_URL
        privateKey = process.env.MAINNET_PRIVATE_KEY
        WRC20Crowdsale = process.env.MAINNET_WRC20CROWDSALE
        WRC20 = process.env.MAINNET_WRC20
        Migrations = process.env.MAINNET_MIGRATIONS
        break;
    }
}

module.exports = {
    port: 4000,
    privateKey,
    ENV: process.env.ENV,
    network, // 0 local, 1 testnet, 2 mainnet
    net, //TODO: change name
    url,   
    //use these if not deploying contract or targeting a different deployment on (same or ) different network
    WRC20Crowdsale: WRC20Crowdsale,
    WRC20: WRC20,
    Migrations: Migrations,
}