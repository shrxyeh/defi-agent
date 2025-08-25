import { ethers } from 'ethers';
import { WalletService } from './WalletService';
import { SwapService } from './SwapService';
import { LiquidityService } from './LiquidityService';
import { StakingService } from './StakingService';
import { PoolDiscoveryService } from './PoolDiscoveryService';
import { MulticallService } from './MulticallService';
import { ErrorRecoveryService } from './ErrorRecoveryService';
import { TOKENS, DEFAULT_SLIPPAGE, ERROR_RECOVERY_CONFIG } from '../config/constants';
import { 
  DepositRequest, 
  WithdrawRequest, 
  TransactionResult, 
  PoolInfo, 
  PositionReceipt, 
  WithdrawalReceipt, 
  AgentStatus,
  ErrorContext 
} from '../types';

export class DefiAgent {
  private walletService: WalletService;
  private swapService: SwapService;
  private liquidityService: LiquidityService;
  private stakingService: StakingService;
  private poolDiscoveryService: PoolDiscoveryService;
  private multicallService: MulticallService;
  private errorRecoveryService: ErrorRecoveryService;
  
  private poolInfo?: PoolInfo;
  private isInitialized = false;
  private operationStats = {
    total: 0,
    successful: 0,
    failed: 0
  };

  constructor(privateKey: string, gaugeAddress?: string) {
    this.walletService = new WalletService(privateKey);
    this.swapService = new SwapService(this.walletService);
    this.liquidityService = new LiquidityService(this.walletService);
    this.stakingService = new StakingService(this.walletService, gaugeAddress);
    this.poolDiscoveryService = new PoolDiscoveryService(this.walletService);
    this.multicallService = new MulticallService(this.walletService);
    this.errorRecoveryService = new ErrorRecoveryService(this.walletService);
  }

  /**
   * Initialize the agent by discovering the pool
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Initializing DeFi Agent...');
      
      // Discover the WETH-VIRTUAL pool
      this.poolInfo = await this.poolDiscoveryService.discoverWETHVIRTUALPool();
      
      // Update services with discovered pool info
      await this.updateServicesWithPoolInfo();
      
      this.isInitialized = true;
      console.log('✅ DeFi Agent initialized successfully');
      
      return true;
    } catch (error: any) {
      console.error('❌ Failed to initialize DeFi Agent:', error.message);
      return false;
    }
  }

  /**
   * Update all services with discovered pool information
   */
  private async updateServicesWithPoolInfo(): Promise<void> {
    if (!this.poolInfo) {
      throw new Error('Pool info not available');
    }

    // Update staking service with correct gauge address
    this.stakingService = new StakingService(this.walletService, this.poolInfo.gaugeAddress);
    
    // Update liquidity service with pool address
    this.liquidityService.updatePoolInfo(this.poolInfo);
    
    console.log('🔄 Services updated with pool information');
  }

  /**
   * Execute the complete deposit flow with enhanced error handling
   */
  async executeDepositFlow(request: DepositRequest): Promise<{
    success: boolean;
    transactions: TransactionResult[];
    positionReceipt?: PositionReceipt;
    error?: string;
  }> {
    const transactions: TransactionResult[] = [];
    const slippage = request.slippageTolerance || DEFAULT_SLIPPAGE;
    const startTime = Date.now();

    try {
      // Ensure agent is initialized
      if (!this.isInitialized) {
        await this.initialize();
      }

      this.operationStats.total++;
      console.log(`\n=== Starting Enhanced Deposit Flow for ${request.amount} USDC ===`);

      // Step 1: Check USDC balance
      const usdcBalance = await this.walletService.getTokenBalance(TOKENS.USDC);
      console.log(`Current USDC balance: ${usdcBalance}`);

      if (parseFloat(usdcBalance) < parseFloat(request.amount)) {
        throw new Error(`Insufficient USDC balance. Required: ${request.amount}, Available: ${usdcBalance}`);
      }

      // Step 2: Execute swaps and liquidity operations
      if (request.enableMulticall && request.gasOptimization) {
        // Use multicall for gas optimization
        const result = await this.executeDepositFlowMulticall(request.amount, slippage);
        transactions.push(...result.transactions);
        
        if (!result.success) {
          throw new Error(`Multicall deposit flow failed: ${result.error}`);
        }
      } else {
        // Execute operations sequentially
        const result = await this.executeDepositFlowSequential(request.amount, slippage);
        transactions.push(...result.transactions);
        
        if (!result.success) {
          throw new Error(`Sequential deposit flow failed: ${result.error}`);
        }
      }

      // Create position receipt
      const lpBalance = await this.liquidityService.getLPTokenBalance();
      const stakedBalance = await this.stakingService.getStakedBalance();
      
      const positionReceipt: PositionReceipt = {
        positionId: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userAddress: this.walletService.getWallet().address,
        depositAmount: request.amount,
        lpTokens: lpBalance,
        stakedAmount: stakedBalance,
        poolAddress: this.poolInfo!.address,
        gaugeAddress: this.poolInfo!.gaugeAddress,
        timestamp: startTime,
        transactions
      };

      this.operationStats.successful++;
      console.log(`\n=== Enhanced Deposit Flow Completed Successfully ===`);
      console.log(`📋 Position Receipt: ${positionReceipt.positionId}`);
      
      return {
        success: true,
        transactions,
        positionReceipt
      };

    } catch (error: any) {
      this.operationStats.failed++;
      console.error(`\n=== Enhanced Deposit Flow Failed ===`);
      console.error(`Error: ${error.message}`);

      // Attempt error recovery
      if (ERROR_RECOVERY_CONFIG.ENABLE_AUTO_RECOVERY) {
        const errorContext: ErrorContext = {
          operation: 'deposit',
          step: 'deposit_flow',
          userAmount: request.amount,
          expectedTokens: [TOKENS.USDC],
          error: error,
          timestamp: Date.now()
        };

        const recoveryResult = await this.errorRecoveryService.handleError(errorContext);
        
        if (recoveryResult.recovered) {
          console.log('✅ Error recovery successful');
        } else {
          console.log('❌ Error recovery failed, manual intervention may be required');
        }
      }

      return {
        success: false,
        transactions,
        error: error.message
      };
    }
  }

  /**
   * Execute deposit flow using multicall for gas optimization
   */
  private async executeDepositFlowMulticall(amount: string, slippage: number): Promise<{
    success: boolean;
    transactions: TransactionResult[];
    error?: string;
  }> {
    try {
      console.log('🚀 Executing deposit flow with multicall optimization...');
      
      const halfAmount = (parseFloat(amount) / 2).toString();
      const deadline = Math.floor(Date.now() / 1000) + 1800;

      // Create multicall for approvals
      const approvalCalls = this.multicallService.createApprovalCalls([
        { address: TOKENS.USDC, spender: this.swapService.getRouterAddress(), amount },
        { address: TOKENS.WETH, spender: this.swapService.getRouterAddress(), amount },
        { address: TOKENS.VIRTUAL, spender: this.swapService.getRouterAddress(), amount }
      ]);

      // Execute approvals
      const approvalResults = await this.multicallService.executeMulticall(approvalCalls);
      
      // Create swap calls
      const swapCalls = this.multicallService.createSwapCalls([
        {
          router: this.swapService.getRouterAddress(),
          amountIn: ethers.parseUnits(halfAmount, 6).toString(),
          amountOutMin: '0', // Will be calculated with slippage
          routes: [{ from: TOKENS.USDC, to: TOKENS.WETH, stable: false }],
          to: this.walletService.getWallet().address,
          deadline
        },
        {
          router: this.swapService.getRouterAddress(),
          amountIn: ethers.parseUnits(halfAmount, 6).toString(),
          amountOutMin: '0', // Will be calculated with slippage
          routes: [{ from: TOKENS.USDC, to: TOKENS.VIRTUAL, stable: false }],
          to: this.walletService.getWallet().address,
          deadline
        }
      ]);

      // Execute swaps
      const swapResults = await this.multicallService.executeMulticall(swapCalls);

      // Add liquidity and stake (these need to be done sequentially due to dependencies)
      const wethBalance = await this.walletService.getTokenBalance(TOKENS.WETH);
      const virtualBalance = await this.walletService.getTokenBalance(TOKENS.VIRTUAL);
      
      const liquidityResult = await this.liquidityService.addLiquidity(
        wethBalance,
        virtualBalance,
        slippage
      );

      const lpBalance = await this.liquidityService.getLPTokenBalance();
      const stakingResult = await this.stakingService.stakeLPTokens(lpBalance);

      return {
        success: liquidityResult.success && stakingResult.success,
        transactions: [liquidityResult, stakingResult],
        error: !liquidityResult.success ? liquidityResult.error : 
               !stakingResult.success ? stakingResult.error : undefined
      };

    } catch (error: any) {
      return {
        success: false,
        transactions: [],
        error: error.message
      };
    }
  }

  /**
   * Execute deposit flow sequentially
   */
  private async executeDepositFlowSequential(amount: string, slippage: number): Promise<{
    success: boolean;
    transactions: TransactionResult[];
    error?: string;
  }> {
    const transactions: TransactionResult[] = [];

    try {
      // Step 2: Swap 50% USDC → WETH
      const halfAmount = (parseFloat(amount) / 2).toString();
      console.log(`\nStep 2: Swapping ${halfAmount} USDC → WETH`);
      const wethSwapResult = await this.swapService.swapUSDCToWETH(halfAmount, slippage);
      transactions.push(wethSwapResult);

      if (!wethSwapResult.success) {
        throw new Error(`WETH swap failed: ${wethSwapResult.error}`);
      }

      // Step 3: Swap 50% USDC → VIRTUAL
      console.log(`\nStep 3: Swapping ${halfAmount} USDC → VIRTUAL`);
      const virtualSwapResult = await this.swapService.swapUSDCToVIRTUAL(halfAmount, slippage);
      transactions.push(virtualSwapResult);

      if (!virtualSwapResult.success) {
        throw new Error(`VIRTUAL swap failed: ${virtualSwapResult.error}`);
      }

      // Step 4: Add liquidity to WETH-VIRTUAL pool
      const wethBalance = await this.walletService.getTokenBalance(TOKENS.WETH);
      const virtualBalance = await this.walletService.getTokenBalance(TOKENS.VIRTUAL);
      
      console.log(`\nStep 4: Adding liquidity - WETH: ${wethBalance}, VIRTUAL: ${virtualBalance}`);
      const liquidityResult = await this.liquidityService.addLiquidity(
        wethBalance,
        virtualBalance,
        slippage
      );
      transactions.push(liquidityResult);

      if (!liquidityResult.success) {
        throw new Error(`Add liquidity failed: ${liquidityResult.error}`);
      }

      // Step 5: Stake LP tokens in Aerodrome gauge
      const lpBalance = await this.liquidityService.getLPTokenBalance();
      console.log(`\nStep 5: Staking ${lpBalance} LP tokens`);
      const stakingResult = await this.stakingService.stakeLPTokens(lpBalance);
      transactions.push(stakingResult);

      if (!stakingResult.success) {
        throw new Error(`Staking failed: ${stakingResult.error}`);
      }

      return {
        success: true,
        transactions
      };

    } catch (error: any) {
      return {
        success: false,
        transactions,
        error: error.message
      };
    }
  }

  /**
   * Execute the complete withdraw flow with enhanced error handling
   */
  async executeWithdrawFlow(request: WithdrawRequest): Promise<{
    success: boolean;
    transactions: TransactionResult[];
    withdrawalReceipt?: WithdrawalReceipt;
    error?: string;
  }> {
    const transactions: TransactionResult[] = [];
    const startTime = Date.now();

    try {
      // Ensure agent is initialized
      if (!this.isInitialized) {
        await this.initialize();
      }

      this.operationStats.total++;
      console.log(`\n=== Starting Enhanced Withdraw Flow ===`);

      // Step 1: Check staked balance
      const stakedBalance = await this.stakingService.getStakedBalance();
      console.log(`Current staked LP balance: ${stakedBalance}`);

      if (parseFloat(stakedBalance) === 0) {
        throw new Error('No staked LP tokens found');
      }

      // Calculate amount to unstake
      const unstakeAmount = (parseFloat(stakedBalance) * request.percentage / 100).toString();
      console.log(`\nStep 1: Unstaking ${unstakeAmount} LP tokens (${request.percentage}%)`);
      
      const unstakeResult = await this.stakingService.unstakeLPTokens(unstakeAmount);
      transactions.push(unstakeResult);

      if (!unstakeResult.success) {
        throw new Error(`Unstaking failed: ${unstakeResult.error}`);
      }

      // Step 2: Remove liquidity from WETH-VIRTUAL pool
      console.log(`\nStep 2: Removing liquidity`);
      const removeLiquidityResult = await this.liquidityService.removeLiquidity(unstakeAmount);
      transactions.push(removeLiquidityResult);

      if (!removeLiquidityResult.success) {
        throw new Error(`Remove liquidity failed: ${removeLiquidityResult.error}`);
      }

      // Step 3: Swap WETH → USDC
      const wethBalance = await this.walletService.getTokenBalance(TOKENS.WETH);
      console.log(`\nStep 3: Swapping ${wethBalance} WETH → USDC`);
      
      if (parseFloat(wethBalance) > 0) {
        const wethSwapResult = await this.swapService.swapWETHToUSDC(wethBalance);
        transactions.push(wethSwapResult);

        if (!wethSwapResult.success) {
          throw new Error(`WETH to USDC swap failed: ${wethSwapResult.error}`);
        }
      }

      // Step 4: Swap VIRTUAL → USDC
      const virtualBalance = await this.walletService.getTokenBalance(TOKENS.VIRTUAL);
      console.log(`\nStep 4: Swapping ${virtualBalance} VIRTUAL → USDC`);
      
      if (parseFloat(virtualBalance) > 0) {
        const virtualSwapResult = await this.swapService.swapVIRTUALToUSDC(virtualBalance);
        transactions.push(virtualSwapResult);

        if (!virtualSwapResult.success) {
          throw new Error(`VIRTUAL to USDC swap failed: ${virtualSwapResult.error}`);
        }
      }

      // Step 5: Return final USDC balance
      const finalUsdcBalance = await this.walletService.getTokenBalance(TOKENS.USDC);
      console.log(`\nStep 5: Final USDC balance: ${finalUsdcBalance}`);

      // Create withdrawal receipt
      const withdrawalReceipt: WithdrawalReceipt = {
        withdrawalId: `wd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userAddress: this.walletService.getWallet().address,
        withdrawnAmount: unstakeAmount,
        returnedUSDC: finalUsdcBalance,
        timestamp: startTime,
        transactions
      };

      this.operationStats.successful++;
      console.log(`\n=== Enhanced Withdraw Flow Completed Successfully ===`);
      console.log(`📋 Withdrawal Receipt: ${withdrawalReceipt.withdrawalId}`);
      
      return {
        success: true,
        transactions,
        withdrawalReceipt
      };

    } catch (error: any) {
      this.operationStats.failed++;
      console.error(`\n=== Enhanced Withdraw Flow Failed ===`);
      console.error(`Error: ${error.message}`);

      // Attempt error recovery
      if (ERROR_RECOVERY_CONFIG.ENABLE_AUTO_RECOVERY) {
        const errorContext: ErrorContext = {
          operation: 'withdraw',
          step: 'withdraw_flow',
          error: error,
          timestamp: Date.now()
        };

        const recoveryResult = await this.errorRecoveryService.handleError(errorContext);
        
        if (recoveryResult.recovered) {
          console.log('✅ Error recovery successful');
        } else {
          console.log('❌ Error recovery failed, manual intervention may be required');
        }
      }

      return {
        success: false,
        transactions,
        error: error.message
      };
    }
  }

  /**
   * Get comprehensive account summary
   */
  async getAccountSummary() {
    try {
      console.log(`\n=== Enhanced Account Summary ===`);
      
      const walletInfo = await this.walletService.getWalletInfo();
      console.log(`Wallet Address: ${walletInfo.address}`);
      console.log(`ETH Balance: ${walletInfo.balance}`);

      const usdcBalance = await this.walletService.getTokenBalance(TOKENS.USDC);
      const wethBalance = await this.walletService.getTokenBalance(TOKENS.WETH);
      const virtualBalance = await this.walletService.getTokenBalance(TOKENS.VIRTUAL);
      const lpBalance = await this.liquidityService.getLPTokenBalance();
      const stakedBalance = await this.stakingService.getStakedBalance();

      console.log(`USDC Balance: ${usdcBalance}`);
      console.log(`WETH Balance: ${wethBalance}`);
      console.log(`VIRTUAL Balance: ${virtualBalance}`);
      console.log(`LP Token Balance: ${lpBalance}`);
      console.log(`Staked LP Balance: ${stakedBalance}`);

      // Display pool information if available
      if (this.poolInfo) {
        console.log(`\nPool Information:`);
        console.log(`Pool Address: ${this.poolInfo.address}`);
        console.log(`Pool Type: ${this.poolInfo.stable ? 'Stable' : 'Volatile (Concentrated)'}`);
        console.log(`Gauge Address: ${this.poolInfo.gaugeAddress}`);
        console.log(`Pool Reserves: ${this.poolInfo.reserves.reserve0} / ${this.poolInfo.reserves.reserve1}`);
      }

      // Display operation statistics
      console.log(`\nOperation Statistics:`);
      console.log(`Total Operations: ${this.operationStats.total}`);
      console.log(`Successful: ${this.operationStats.successful}`);
      console.log(`Failed: ${this.operationStats.failed}`);

      // Display error recovery statistics
      const recoveryStats = this.errorRecoveryService.getRecoveryStats();
      console.log(`\nError Recovery Statistics:`);
      console.log(`Total Errors: ${recoveryStats.totalErrors}`);
      console.log(`Recovered: ${recoveryStats.recoveredErrors}`);
      console.log(`Manual Interventions: ${recoveryStats.manualInterventions}`);

      return {
        wallet: walletInfo,
        balances: {
          usdc: usdcBalance,
          weth: wethBalance,
          virtual: virtualBalance,
          lp: lpBalance,
          staked: stakedBalance
        },
        poolInfo: this.poolInfo,
        operationStats: this.operationStats,
        recoveryStats
      };
    } catch (error) {
      console.error('Failed to get account summary:', error);
      return null;
    }
  }

  /**
   * Get agent status
   */
  getAgentStatus(): AgentStatus {
    const recoveryStats = this.errorRecoveryService.getRecoveryStats();
    
    return {
      isInitialized: this.isInitialized,
      poolDiscovered: !!this.poolInfo,
      poolInfo: this.poolInfo,
      lastOperation: this.operationStats.total > 0 ? 'deposit' : undefined,
      lastOperationTime: this.operationStats.total > 0 ? Date.now() : undefined,
      totalOperations: this.operationStats.total,
      successfulOperations: this.operationStats.successful,
      failedOperations: this.operationStats.failed,
      recoveryStats
    };
  }

  /**
   * Get pool information
   */
  getPoolInfo(): PoolInfo | undefined {
    return this.poolInfo;
  }

  /**
   * Check if agent is initialized
   */
  isAgentInitialized(): boolean {
    return this.isInitialized;
  }
}