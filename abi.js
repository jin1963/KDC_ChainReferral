// abi.js
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "usdtAmount",
        "type": "uint256"
      }
    ],
    "name": "buyWithReferral",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_referrer",
        "type": "address"
      }
    ],
    "name": "registerReferrer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
