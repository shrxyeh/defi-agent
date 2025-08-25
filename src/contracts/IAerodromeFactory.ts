export const AERODROME_FACTORY_ADDRESS = "0x420DD381b31aEf6683db6B902084cB0FFECe40Da";

export const AERODROME_FACTORY_ABI = [
  // Pool creation and management
  "function createPool(address tokenA, address tokenB, bool stable) external returns (address pool)",
  "function getPool(address tokenA, address tokenB, bool stable) external view returns (address pool)",
  "function allPools(uint256 index) external view returns (address pool)",
  "function allPoolsLength() external view returns (uint256)",
  "function isPair(address pool) external view returns (bool)",
  
  // Fee management
  "function getFee(address pool, bool stable) external view returns (uint256)",
  "function setFee(bool stable, uint256 fee) external",
  "function stableFee() external view returns (uint256)",
  "function volatileFee() external view returns (uint256)",
  
  // Pauser and admin functions
  "function pauser() external view returns (address)",
  "function setPauser(address pauser) external",
  "function acceptPauser() external",
  
  // Events
  "event PoolCreated(address indexed token0, address indexed token1, bool stable, address pool, uint256 allPoolsLength)"
] as const;

export interface PoolCreationParams {
  tokenA: string;
  tokenB: string;
  stable: boolean;
}