export const AERODROME_POOL_ABI = [
  // Pool state
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function stable() external view returns (bool)",
  "function factory() external view returns (address)",
  
  // Reserves and supply
  "function getReserves() external view returns (uint256 reserve0, uint256 reserve1, uint256 blockTimestampLast)",
  "function totalSupply() external view returns (uint256)",
  
  // Pool operations
  "function mint(address to) external returns (uint256 liquidity)",
  "function burn(address to) external returns (uint256 amount0, uint256 amount1)",
  "function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external",
  "function skim(address to) external",
  "function sync() external",
  
  // Price and fees
  "function price0CumulativeLast() external view returns (uint256)",
  "function price1CumulativeLast() external view returns (uint256)",
  "function kLast() external view returns (uint256)",
  
  // Metadata
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  
  // Events
  "event Mint(address indexed sender, uint256 amount0, uint256 amount1)",
  "event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to)",
  "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)",
  "event Sync(uint256 reserve0, uint256 reserve1)"
] as const;

export interface PoolReserves {
  reserve0: string;
  reserve1: string;
  blockTimestampLast: number;
}

export interface PoolInfo {
  token0: string;
  token1: string;
  stable: boolean;
  factory: string;
  totalSupply: string;
  reserves: PoolReserves;
}