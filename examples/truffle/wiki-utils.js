const { Woop } = require("@woop-js/core")
const { ChainType, ChainID } = require("@woop-js/utils")
const wiki = new Woop('http://localhost:9500/', {chainType: ChainType.Woop, chainId: ChainID.WikiLocal})

//helper function to convert bech32 addresses to Hexadecimal
exports.toHex = (bech32Addr) => wiki.crypto.getAddress(bech32Addr).basicHex;
exports.toBech32 = (HexAddr) => wiki.crypto.getAddress(HexAddr).bech32;