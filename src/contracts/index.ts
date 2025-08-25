// Export all contract interfaces and ABIs
export * from './IAerodromeRouter';
export * from './IAerodromeGauge';
export * from './IAerodromePool';
export * from './IAerodromeFactory';
export * from './IAerodromeVoter';
export * from './IERC20';
export * from './ContractAddresses';

// Type definitions for contract interactions
export interface ContractCall {
  target: string;
  callData: string;
  value?: string;
}

export interface MultiCallResult {
  success: boolean;
  returnData: string;
}

export interface TransactionConfig {
  gasLimit?: number;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: number;
  value?: string;
}