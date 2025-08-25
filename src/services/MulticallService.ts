import { ethers } from 'ethers';
import { WalletService } from './WalletService';
import { MULTICALL_ABI } from '../config/abis';

export interface MulticallCall {
  target: string;
  callData: string;
}

export interface MulticallResult {
  success: boolean;
  returnData: string;
  error?: string;
}

export class MulticallService {
  private walletService: WalletService;
  private multicallAddress: string;

  constructor(walletService: WalletService) {
    this.walletService = walletService;
    // Base chain multicall address
    this.multicallAddress = '0xca11bde05977b3631167028862be2a173976ca11';
  }

  /**
   * Execute multiple calls in a single transaction
   */
  async executeMulticall(calls: MulticallCall[]): Promise<MulticallResult[]> {
    try {
      console.log(`🚀 Executing multicall with ${calls.length} calls...`);

      const multicallContract = new ethers.Contract(
        this.multicallAddress,
        MULTICALL_ABI,
        this.walletService.getWallet()
      );

      // Use tryAggregate to continue even if some calls fail
      const tx = await multicallContract.tryAggregate!(false, calls);
      const receipt = await tx.wait();

      console.log(`✅ Multicall executed successfully: ${tx.hash}`);
      console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);

      return tx.map((result: any, index: number) => ({
        success: result.success,
        returnData: result.returnData,
        error: result.success ? undefined : `Call ${index} failed`
      }));

    } catch (error: any) {
      console.error('Multicall execution failed:', error);
      throw new Error(`Multicall failed: ${error.message}`);
    }
  }

  /**
   * Execute multiple calls and require all to succeed
   */
  async executeMulticallStrict(calls: MulticallCall[]): Promise<MulticallResult[]> {
    try {
      console.log(`🚀 Executing strict multicall with ${calls.length} calls...`);

      const multicallContract = new ethers.Contract(
        this.multicallAddress,
        MULTICALL_ABI,
        this.walletService.getWallet()
      );

      // Use aggregate to require all calls to succeed
      const tx = await multicallContract.aggregate!(calls);
      const [blockNumber, returnData] = await tx.wait();

      console.log(`✅ Strict multicall executed successfully: ${tx.hash}`);
      console.log(`⛽ Gas used: ${tx.gasUsed?.toString() || 'Unknown'}`);

      return returnData.map((data: string, index: number) => ({
        success: true,
        returnData: data
      }));

    } catch (error: any) {
      console.error('Strict multicall execution failed:', error);
      throw new Error(`Strict multicall failed: ${error.message}`);
    }
  }

  /**
   * Create approval calls for multiple tokens
   */
  createApprovalCalls(
    tokens: Array<{ address: string; spender: string; amount: string }>
  ): MulticallCall[] {
    return tokens.map(({ address, spender, amount }) => {
      const iface = new ethers.Interface([
        'function approve(address spender, uint256 amount) returns (bool)'
      ]);
      
      return {
        target: address,
        callData: iface.encodeFunctionData('approve', [spender, amount])
      };
    });
  }

  /**
   * Create swap calls for multiple token pairs
   */
  createSwapCalls(
    swaps: Array<{
      router: string;
      amountIn: string;
      amountOutMin: string;
      routes: Array<{ from: string; to: string; stable: boolean }>;
      to: string;
      deadline: number;
    }>
  ): MulticallCall[] {
    return swaps.map((swap) => {
      const iface = new ethers.Interface([
        'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, tuple(address from, address to, bool stable)[] routes, address to, uint256 deadline) external returns (uint256[] amounts)'
      ]);
      
      return {
        target: swap.router,
        callData: iface.encodeFunctionData('swapExactTokensForTokens', [
          swap.amountIn,
          swap.amountOutMin,
          swap.routes,
          swap.to,
          swap.deadline
        ])
      };
    });
  }

  /**
   * Create liquidity management calls
   */
  createLiquidityCalls(
    operations: Array<{
      router: string;
      operation: 'add' | 'remove';
      tokenA: string;
      tokenB: string;
      stable: boolean;
      amountADesired?: string;
      amountBDesired?: string;
      amountAMin?: string;
      amountBMin?: string;
      liquidity?: string;
      to: string;
      deadline: number;
    }>
  ): MulticallCall[] {
    return operations.map((op) => {
      const iface = new ethers.Interface([
        'function addLiquidity(address tokenA, address tokenB, bool stable, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) external returns (uint256 amountA, uint256 amountB, uint256 liquidity)',
        'function removeLiquidity(address tokenA, address tokenB, bool stable, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) external returns (uint256 amountA, uint256 amountB)'
      ]);
      
      if (op.operation === 'add') {
        return {
          target: op.router,
          callData: iface.encodeFunctionData('addLiquidity', [
            op.tokenA,
            op.tokenB,
            op.stable,
            op.amountADesired!,
            op.amountBDesired!,
            op.amountAMin!,
            op.amountBMin!,
            op.to,
            op.deadline
          ])
        };
      } else {
        return {
          target: op.router,
          callData: iface.encodeFunctionData('removeLiquidity', [
            op.tokenA,
            op.tokenB,
            op.stable,
            op.liquidity!,
            op.amountAMin!,
            op.amountBMin!,
            op.to,
            op.deadline
          ])
        };
      }
    });
  }

  /**
   * Create staking calls
   */
  createStakingCalls(
    operations: Array<{
      gauge: string;
      operation: 'stake' | 'unstake';
      amount: string;
    }>
  ): MulticallCall[] {
    return operations.map((op) => {
      const iface = new ethers.Interface([
        'function deposit(uint256 amount) external',
        'function withdraw(uint256 amount) external'
      ]);
      
      if (op.operation === 'stake') {
        return {
          target: op.gauge,
          callData: iface.encodeFunctionData('deposit', [op.amount])
        };
      } else {
        return {
          target: op.gauge,
          callData: iface.encodeFunctionData('withdraw', [op.amount])
        };
      }
    });
  }

  /**
   * Estimate gas for multicall
   */
  async estimateMulticallGas(calls: MulticallCall[]): Promise<bigint> {
    try {
      const multicallContract = new ethers.Contract(
        this.multicallAddress,
        MULTICALL_ABI,
        this.walletService.getProvider()
      );

      const gasEstimate = await multicallContract.tryAggregate!.estimateGas(false, calls);
      return gasEstimate;
    } catch (error: any) {
      console.warn('Failed to estimate multicall gas:', error);
      // Return a conservative estimate
      return BigInt(calls.length * 100000); // 100k gas per call
    }
  }

  /**
   * Validate multicall address
   */
  async validateMulticallAddress(): Promise<boolean> {
    try {
      const code = await this.walletService.getProvider().getCode(this.multicallAddress);
      return code !== '0x';
    } catch (error) {
      console.warn('Failed to validate multicall address:', error);
      return false;
    }
  }
}
