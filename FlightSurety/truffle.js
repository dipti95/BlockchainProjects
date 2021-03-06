var HDWalletProvider = require("truffle-hdwallet-provider")
var mnemonic =
  "early horror insect adult old answer hamster fabric copy public apology wide"

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
