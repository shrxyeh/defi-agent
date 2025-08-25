export const AERODROME_VOTER_ADDRESS = "0x16613524e02ad97eDfeF371bC883F2F5d6C480A5";

export const AERODROME_VOTER_ABI = [
  // Voting functions
  "function vote(uint256 tokenId, address[] pools, uint256[] weights) external",
  "function reset(uint256 tokenId) external",
  "function poke(uint256 tokenId) external",
  
  // Gauge management
  "function createGauge(address pool, uint256 gaugeType) external returns (address gauge)",
  "function killGauge(address gauge) external",
  "function reviveGauge(address gauge) external",
  
  // View functions
  "function gauges(address pool) external view returns (address gauge)",
  "function poolForGauge(address gauge) external view returns (address pool)",
  "function isGauge(address gauge) external view returns (bool)",
  "function isAlive(address gauge) external view returns (bool)",
  "function isWhitelisted(address token) external view returns (bool)",
  
  // Pool and gauge info
  "function pools(uint256 index) external view returns (address pool)",
  "function poolsLength() external view returns (uint256)",
  "function weights(address pool) external view returns (uint256)",
  "function votes(uint256 tokenId, address pool) external view returns (uint256)",
  "function poolVote(uint256 tokenId, uint256 index) external view returns (address pool)",
  "function usedWeights(uint256 tokenId) external view returns (uint256)",
  "function lastVoted(uint256 tokenId) external view returns (uint256)",
  
  // Reward distribution
  "function distribute(address gauge) external",
  "function distributeFees(address[] gauges) external",
  "function distro() external view returns (address)",
  
  // Events
  "event GaugeCreated(address indexed poolFactory, address indexed votingRewardsFactory, address indexed gaugeFactory, address pool, address bribeVotingReward, address feeVotingReward, address gauge, address creator)",
  "event Voted(address indexed voter, uint256 indexed tokenId, uint256 weight)",
  "event Abstained(uint256 indexed tokenId, uint256 weight)"
] as const;