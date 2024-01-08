import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000,
      },
    },
  },
  networks: {
    'hardhat': {
      allowUnlimitedContractSize: true,
      chainId:9090,
    },
    'arbitrum-goerli': {
      url: 'https://arb-goerli.g.alchemy.com/v2/hegn8vBG_khxu0tXv8jXP_NUmRCUvJUb',
      accounts: [
        // JUST FOR TESTING, DO NOT USE IN PRODUCTION
        '75031d1d758f6b4000d7a15f67bc2197fa0eefdddeabf3679505fa87cde7be7d',
        '7093e4c110c56ec578ff6b3247d5975f1e5819397c42a745ef01bda903cebe61',
      ],
      allowUnlimitedContractSize: true,
      chainId: 421613,
    },
    'sepolia':{
      url: 'https://sepolia.infura.io/v3/3a6f21032e0246b8a4da29f6d6cb69e6',
      accounts: [
        // JUST FOR TESTING, DO NOT USE IN PRODUCTION
        '75031d1d758f6b4000d7a15f67bc2197fa0eefdddeabf3679505fa87cde7be7d',
        '7093e4c110c56ec578ff6b3247d5975f1e5819397c42a745ef01bda903cebe61',
      ],
      allowUnlimitedContractSize: true,
      chainId: 11155111,
    }
  },
};

export default config;
