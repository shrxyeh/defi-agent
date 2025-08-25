export const AERODROME_ROUTER_ABI = [
  // Core swap functions
  "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, tuple(address from, address to, bool stable)[] routes, address to, uint256 deadline) external returns (uint256[] amounts)",
  "function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, tuple(address from, address to, bool stable)[] routes, address to, uint256 deadline) external",
  "function swapExactETHForTokens(uint256 amountOutMin, tuple(address from, address to, bool stable)[] routes, address to, uint256 deadline) external payable returns (uint256[] amounts)",
  "function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, tuple(address from, address to, bool stable)[] routes, address to, uint256 deadline) external returns (uint256[] amounts)",
  
  // Liquidity functions
  "function addLiquidity(address tokenA, address tokenB, bool stable, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) external returns (uint256 amountA, uint256 amountB, uint256 liquidity)",
  "function removeLiquidity(address tokenA, address tokenB, bool stable, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) external returns (uint256 amountA, uint256 amountB)",
  "function removeLiquidityETH(address token, bool stable, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) external returns (uint256 amountToken, uint256 amountETH)",
  
  // Quote functions
  "function getAmountsOut(uint256 amountIn, tuple(address from, address to, bool stable)[] routes) external view returns (uint256[] amounts)",
  "function getAmountsIn(uint256 amountOut, tuple(address from, address to, bool stable)[] routes) external view returns (uint256[] amounts)",
  
  // Pool information
  "function getPool(address tokenA, address tokenB, bool stable) external view returns (address pool)"
];

export const AERODROME_GAUGE_ABI = [
  // Staking functions
  "function deposit(uint256 amount) external",
  "function deposit(uint256 amount, address to) external",
  "function withdraw(uint256 amount) external",
  "function withdraw(uint256 amount, address to) external",
  
  // Balance and reward functions
  "function balanceOf(address account) external view returns (uint256)",
  "function earned(address account) external view returns (uint256)",
  "function getReward() external",
  "function getReward(address to) external",
  "function getReward(address to, bool claimExtras) external",
  
  // Pool information
  "function pool() external view returns (address)",
  "function totalSupply() external view returns (uint256)",
  "function rewardRate() external view returns (uint256)",
  "function periodFinish() external view returns (uint256)"
];

export const ERC20_ABI = [
  // Core ERC20 functions
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

export const POOL_ABI = [
  // Pool information
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function getReserves() external view returns (uint256 reserve0, uint256 reserve1, uint256 blockTimestampLast)",
  "function totalSupply() external view returns (uint256)",
  
  // Liquidity functions
  "function mint(address to) external returns (uint256 liquidity)",
  "function burn(address to) external returns (uint256 amount0, uint256 amount1)",
  
  // Price functions
  "function price0CumulativeLast() external view returns (uint256)",
  "function price1CumulativeLast() external view returns (uint256)",
  "function kLast() external view returns (uint256)"
];

export const FACTORY_ABI = [
  // Pool creation and management
  "function createPool(address tokenA, address tokenB, bool stable) external returns (address pool)",
  "function getPool(address tokenA, address tokenB, bool stable) external view returns (address pool)",
  "function allPools(uint256) external view returns (address pool)",
  "function allPoolsLength() external view returns (uint256)",
  
  // Pool validation
  "function isPool(address pool) external view returns (bool)"
];

export const VOTER_ABI = [
  // Gauge management
  "function gauges(address pool) external view returns (address)",
  "function poolForGauge(address gauge) external view returns (address)",
  "function createGauge(address pool) external returns (address)",
  
  // Voting and rewards
  "function vote(address[] tokenVote, uint256[] weights) external",
  "function reset(address[] gauge) external",
  "function whitelist(address token) external",
  "function isWhitelisted(address token) external view returns (bool)"
];

// Multicall ABI for batch transactions
export const MULTICALL_ABI = [
  "function aggregate(tuple(address target, bytes callData)[] calls) external view returns (uint256 blockNumber, bytes[] returnData)",
  "function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) external returns (tuple(bool success, bytes returnData)[] returnData)"
];