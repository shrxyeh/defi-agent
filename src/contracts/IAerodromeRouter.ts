export const AERODROME_ROUTER_ADDRESS = "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43";

export interface Route {
  from: string;
  to: string;
  stable: boolean;
}

export const AERODROME_ROUTER_ABI = [
  // Swap functions
  "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, tuple(address from, address to, bool stable)[] routes, address to, uint256 deadline) external returns (uint256[] amounts)",
  "function swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, tuple(address from, address to, bool stable)[] routes, address to, uint256 deadline) external returns (uint256[] amounts)",
  
  // Liquidity functions
  "function addLiquidity(address tokenA, address tokenB, bool stable, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) external returns (uint256 amountA, uint256 amountB, uint256 liquidity)",
  "function removeLiquidity(address tokenA, address tokenB, bool stable, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) external returns (uint256 amountA, uint256 amountB)",
  
  // Quote functions
  "function getAmountsOut(uint256 amountIn, tuple(address from, address to, bool stable)[] routes) external view returns (uint256[] amounts)",
  "function getAmountsIn(uint256 amountOut, tuple(address from, address to, bool stable)[] routes) external view returns (uint256[] amounts)",
  "function quoteAddLiquidity(address tokenA, address tokenB, bool stable, uint256 amountADesired, uint256 amountBDesired) external view returns (uint256 amountA, uint256 amountB, uint256 liquidity)",
  "function quoteRemoveLiquidity(address tokenA, address tokenB, bool stable, uint256 liquidity) external view returns (uint256 amountA, uint256 amountB)",
  
  // Factory functions
  "function factory() external view returns (address)",
  "function WETH() external view returns (address)"
] as const;

export interface SwapParams {
  amountIn: string;
  amountOutMin: string;
  routes: Route[];
  to: string;
  deadline: number;
}

export interface LiquidityParams {
  tokenA: string;
  tokenB: string;
  stable: boolean;
  amountADesired: string;
  amountBDesired: string;
  amountAMin: string;
  amountBMin: string;
  to: string;
  deadline: number;
}