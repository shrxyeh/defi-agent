// Base Chain Configuration
import { BASE_CONTRACTS, NETWORK_CONFIG } from '../contracts/ContractAddresses';

// export const BASE_CHAIN_ID = 8453;
// export const BASE_RPC_URL = "https://mainnet.base.org";
export const BASE_CHAIN_ID = NETWORK_CONFIG.BASE_MAINNET.chainId;
export const BASE_RPC_URL = NETWORK_CONFIG.BASE_MAINNET.rpcUrl;

// Token Addresses on Base
// export const TOKENS = {
//   USDC: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
//   WETH: "0x4200000000000000000000000000000000000006",
//   VIRTUAL: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b" // Example address
// };
export const TOKENS = BASE_CONTRACTS.TOKENS;

// Aerodrome Protocol Addresses
// export const AERODROME_ADDRESSES = {
//   ROUTER: "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43",
//   GAUGE_FACTORY: "0x35968D8d2B80F7fe4476B3D5dC5C72D86b4a9F7c", 
//   POOL_FACTORY: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
//   VOTER: "0x16613524e02ad97eDfeF371bC883F2F5d6C480A5"
// };
export const AERODROME_ADDRESSES = {
  ROUTER: BASE_CONTRACTS.ROUTER,
  GAUGE_FACTORY: BASE_CONTRACTS.GAUGE_FACTORY,
  FACTORY: BASE_CONTRACTS.FACTORY,
  VOTER: BASE_CONTRACTS.VOTER
};

// Pool Information - Will be discovered dynamically
export const WETH_VIRTUAL_POOL = {
  address: "", // Will be discovered at runtime
  token0: TOKENS.WETH,
  token1: TOKENS.VIRTUAL,
  fee: 3000,
  tickSpacing: 60,
  stable: false // Default to volatile (concentrated liquidity)
};

// Gas Configuration
export const GAS_LIMITS = {
  SWAP: 300000,
  ADD_LIQUIDITY: 500000,
  REMOVE_LIQUIDITY: 400000,
  STAKE: 200000,
  UNSTAKE: 200000,
  MULTICALL: 1000000, // Higher limit for multicall operations
  APPROVAL: 100000
};

// Slippage Protection
export const DEFAULT_SLIPPAGE = 0.5; // 0.5%
export const MAX_SLIPPAGE = 5.0; // 5%
export const MIN_SLIPPAGE = 0.1; // 0.1%

// Transaction Configuration
export const TRANSACTION_CONFIG = {
  DEFAULT_DEADLINE_MINUTES: 30,
  MAX_DEADLINE_MINUTES: 60,
  GAS_BUFFER_PERCENT: 20, // 20% buffer for gas estimation
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000
};

// Pool Discovery Configuration
export const POOL_DISCOVERY_CONFIG = {
  PREFER_VOLATILE: true, // Prefer volatile pools for concentrated liquidity
  FALLBACK_TO_STABLE: true, // Fallback to stable pools if volatile not found
  MIN_LIQUIDITY_THRESHOLD: '1000', // Minimum liquidity threshold in USD
  MAX_POOL_SEARCH_ATTEMPTS: 3
};

// Error Recovery Configuration
export const ERROR_RECOVERY_CONFIG = {
  ENABLE_AUTO_RECOVERY: true,
  MAX_RECOVERY_ATTEMPTS: 3,
  RECOVERY_DELAY_MS: 5000,
  ENABLE_MANUAL_INTERVENTION: true
};