/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox")
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();


const dk = process.env.DEPLOYMENT_KEY;

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        "*": {
          "*": ["metadata", "evm.bytecode", "evm.deployedBytecode", "abi"],
          "": ["ast"],
        },
      },
    },
  },
  gasReporter: {
    enabled: true,
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 44444,
      forking: {
        /*url: 'https://mainnet.base.org',
        blockNumber: 26032968
        */
       //url: 'https://arb1.arbitrum.io/rpc',
       url: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
       blockNumber: 304012219
      },
    },
    base_sepolia: {
      chainId: 84532,
      url: 'https://sepolia.base.org',
      accounts: dk ? [dk]: undefined
    },

    /*base: {
      chainId: 8453,
      url: 'https://mainnet.base.org',
      accounts: dk ? [dk]: undefined
    }*/
  },
  
};
