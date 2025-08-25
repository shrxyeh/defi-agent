export interface AgentWallet {
  address: string;
  privateKey: string;
  balance: string;
}

export interface LPPosition {
  tokenId: string;
  liquidity: string;
  token0: string;
  token1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  stable: boolean;
  poolAddress: string;
  gaugeAddress: string;
}

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amount: string;
  slippageTolerance: number;
  stable: boolean;
}

export interface DepositRequest {
  amount: string;
  slippageTolerance?: number;
  enableMulticall?: boolean;
  gasOptimization?: boolean;
}

export interface WithdrawRequest {
  percentage: number;
  slippageTolerance?: number;
  enableMulticall?: boolean;
  gasOptimization?: boolean;
}

export interface TransactionResult {
  hash: string;
  success: boolean;
  gasUsed?: string;
  error?: string;
  operation?: string;
  step?: string;
  timestamp?: number;
}

export interface PoolInfo {
  address: string;
  token0: string;
  token1: string;
  stable: boolean;
  gaugeAddress: string;
  reserves: {
    reserve0: string;
    reserve1: string;
    totalSupply: string;
  };
}

export interface MulticallCall {
  target: string;
  callData: string;
}

export interface MulticallResult {
  success: boolean;
  returnData: string;
  error?: string;
}

export interface RecoveryAction {
  type: 'refund' | 'retry' | 'rollback' | 'manual' | 'recovery';
  description: string;
  execute: () => Promise<TransactionResult>;
}

export interface ErrorContext {
  operation: string;
  step: string;
  userAmount?: string;
  expectedTokens?: string[];
  actualTokens?: string[];
  error: Error;
  timestamp: number;
}

export interface GasEstimate {
  estimated: bigint;
  withBuffer: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

export interface PositionReceipt {
  positionId: string;
  userAddress: string;
  depositAmount: string;
  lpTokens: string;
  stakedAmount: string;
  poolAddress: string;
  gaugeAddress: string;
  timestamp: number;
  transactions: TransactionResult[];
}

export interface WithdrawalReceipt {
  withdrawalId: string;
  userAddress: string;
  withdrawnAmount: string;
  returnedUSDC: string;
  timestamp: number;
  transactions: TransactionResult[];
}

export interface AgentStatus {
  isInitialized: boolean;
  poolDiscovered: boolean;
  poolInfo?: PoolInfo;
  lastOperation?: string;
  lastOperationTime?: number;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  recoveryStats: {
    totalErrors: number;
    recoveredErrors: number;
    manualInterventions: number;
  };
}