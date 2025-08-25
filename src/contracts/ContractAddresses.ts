// Base Chain Contract Addresses
export const BASE_CONTRACTS = {
  // Core Aerodrome Contracts
  ROUTER: "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43",
  FACTORY: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
  VOTER: "0x16613524e02ad97eDfeF371bC883F2F5d6C480A5",
  GAUGE_FACTORY: "0x35968D8d2B80F7fe4476B3D5dC5C72D86b4a9F7c",
  
  // Token Addresses
  TOKENS: {
    USDC: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    WETH: "0x4200000000000000000000000000000000000006",
    VIRTUAL: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
    AERO: "0x940181a94A35A4569E4529A3CDfB74e38FD98631"
  },
  
  // Pool Addresses (these need to be fetched dynamically or updated)
  POOLS: {
    WETH_VIRTUAL: "0x", // Will be determined at runtime
    USDC_WETH: "0x",   // Will be determined at runtime
    USDC_VIRTUAL: "0x" // Will be determined at runtime
  }
} as const;

// Network Configuration
export const NETWORK_CONFIG = {
  BASE_MAINNET: {
    chainId: 8453,
    name: "Base Mainnet",
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18
    }
  }
} as const;

// Contract deployment blocks for event filtering
export const DEPLOYMENT_BLOCKS = {
  ROUTER: 2500000,
  FACTORY: 2500000,
  VOTER: 2500000
} as const;