export const AERODROME_GAUGE_ABI = [
  // Staking functions
  "function deposit(uint256 amount) external",
  "function deposit(uint256 amount, address account) external",
  "function withdraw(uint256 amount) external",
  "function withdrawAll() external",
  
  // Reward functions
  "function getReward() external",
  "function getReward(address account) external",
  "function getReward(address account, address[] tokens) external",
  
  // View functions
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function earned(address account) external view returns (uint256)",
  "function rewardRate() external view returns (uint256)",
  "function rewardPerToken() external view returns (uint256)",
  "function lastTimeRewardApplicable() external view returns (uint256)",
  
  // Token and pool info
  "function stakingToken() external view returns (address)",
  "function rewardToken() external view returns (address)",
  "function pool() external view returns (address)",
  "function voter() external view returns (address)",
  
  // Events
  "event Deposit(address indexed user, uint256 amount)",
  "event Withdraw(address indexed user, uint256 amount)",
  "event RewardPaid(address indexed user, uint256 reward)"
] as const;

export interface GaugeInfo {
  stakingToken: string;
  rewardToken: string;
  pool: string;
  voter: string;
  totalSupply: string;
  rewardRate: string;
}

export interface UserGaugeData {
  balance: string;
  earned: string;
  rewardPerTokenPaid: string;
}