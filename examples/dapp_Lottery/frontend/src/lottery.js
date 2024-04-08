const { Woop, WoopExtension } = require('@woop-js/core');
const { ChainID, ChainType } = require('@woop-js/utils');

const url = 'http://localhost:9500';
const wiki = new Woop(url, {
  chainType: ChainType.Woop,
  chainId: ChainID.WikiLocal
});

const address = '0x7F0DF8b56683FD21cF9c4A0be8DD492cdF40Fdf6';
const abi = [
  {
    "constant": true,
    "inputs": [],
    "name": "manager",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "players",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "enter",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "pickWinner",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getPlayers",
    "outputs": [
      {
        "name": "",
        "type": "address[]"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

export const waitForInjected = () => new Promise((resolve) => {
  const check = () => {
      if (!window.woop) setTimeout(check, 250);
      else resolve(window.woop);
  }
  check();
});

let woopEx, extLottery;
export const initExtension = async() => {
  woopEx = await new WoopExtension(window.woop);

  extLottery = woopEx.contracts.createContract(abi, address);
  return extLottery;
};

export { wiki };