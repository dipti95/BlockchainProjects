var HDWalletProvider = require("truffle-hdwallet-provider")
var mnemonic =
  "puppy reduce damage hub pact any winner team never define trick uncover"

//var NonceTrackerSubprovider = require("web3-provider-engine/subproviders/nonce-tracker")
module.exports = {
  networks: {
    development: {
      provider: function () {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/", 0, 50)
      },
      network_id: "*",
      gas: 4500000,
    },
  },
  compilers: {
    solc: {
      version: "^0.4.24",
    },
  },
}
