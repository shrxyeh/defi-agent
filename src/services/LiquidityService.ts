import { ethers } from 'ethers';
import { WalletService } from './WalletService';
import { AERODROME_ADDRESSES, TOKENS, GAS_LIMITS } from '../config/constants';
import { AERODROME_ROUTER_ABI } from '../config/abis';
import { TransactionResult, PoolInfo } from '../types';

export class LiquidityService {
  private walletService: WalletService;
  private routerContract: ethers.Contract;
  private poolInfo?: PoolInfo;

  constructor(walletService: WalletService) {
    this.walletService = walletService;
    this.routerContract = new ethers.Contract(
      AERODROME_ADDRESSES.ROUTER,
      AERODROME_ROUTER_ABI,
      walletService.getWallet()
    );
  }

  /**
   * Update pool information (called by DefiAgent after pool discovery)
   */
  updatePoolInfo(poolInfo: PoolInfo): void {
    this.poolInfo = poolInfo;
    console.log(`🔄 LiquidityService updated with pool: ${poolInfo.address}`);
  }

  /**
   * Get current pool information
   */
  getPoolInfo(): PoolInfo | undefined {
    return this.poolInfo;
  }

  /**
   * Validate that pool information is available
   */
  private validatePoolInfo(): void {
    if (!this.poolInfo) {
      throw new Error('Pool information not available. Call updatePoolInfo() first.');
    }
  }

  async addLiquidity(
    wethAmount: string,
    virtualAmount: string,
    slippage: number = 0.5
  ): Promise<TransactionResult> {
    try {
      this.validatePoolInfo();
      console.log(`Adding liquidity: ${wethAmount} WETH + ${virtualAmount} VIRTUAL`);

      // Approve both tokens
      await this.walletService.ensureTokenApproval(
        TOKENS.WETH,
        AERODROME_ADDRESSES.ROUTER,
        wethAmount
      );
      
      await this.walletService.ensureTokenApproval(
        TOKENS.VIRTUAL,
        AERODROME_ADDRESSES.ROUTER,
        virtualAmount
      );

      const amountADesired = ethers.parseEther(wethAmount);
      const amountBDesired = ethers.parseEther(virtualAmount);
      
      // Calculate minimum amounts with slippage protection
      const amountAMin = amountADesired * BigInt(Math.floor((100 - slippage) * 100)) / 10000n;
      const amountBMin = amountBDesired * BigInt(Math.floor((100 - slippage) * 100)) / 10000n;

      const deadline = Math.floor(Date.now() / 1000) + 1800;

      const tx = await this.routerContract.addLiquidity!(
        TOKENS.WETH,
        TOKENS.VIRTUAL,
        this.poolInfo!.stable, // Use discovered pool stability
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        this.walletService.getWallet().address,
        deadline,
        { gasLimit: GAS_LIMITS.ADD_LIQUIDITY }
      );

      const receipt = await tx.wait();
      
      console.log(`Liquidity added successfully: ${tx.hash}`);
      return {
        hash: tx.hash,
        success: true,
        gasUsed: receipt.gasUsed.toString(),
        operation: 'add_liquidity',
        step: 'liquidity_provision',
        timestamp: Date.now()
      };

    } catch (error: any) {
      console.error('Add liquidity failed:', error);
      return {
        hash: '',
        success: false,
        error: error.message,
        operation: 'add_liquidity',
        step: 'liquidity_provision',
        timestamp: Date.now()
      };
    }
  }

  async removeLiquidity(
    liquidityAmount: string,
    slippage: number = 0.5
  ): Promise<TransactionResult> {
    try {
      this.validatePoolInfo();
      console.log(`Removing ${liquidityAmount} LP tokens...`);

      // Approve LP token spending
      await this.walletService.ensureTokenApproval(
        this.poolInfo!.address,
        AERODROME_ADDRESSES.ROUTER,
        liquidityAmount
      );

      const liquidity = ethers.parseEther(liquidityAmount);
      
      // For simplicity, set minimum amounts to 0 with slippage protection
      // In production, you'd calculate expected amounts first
      const amountAMin = 0n;
      const amountBMin = 0n;

      const deadline = Math.floor(Date.now() / 1000) + 1800;

      const tx = await this.routerContract.removeLiquidity!(
        TOKENS.WETH,
        TOKENS.VIRTUAL,
        this.poolInfo!.stable, // Use discovered pool stability
        liquidity,
        amountAMin,
        amountBMin,
        this.walletService.getWallet().address,
        deadline,
        { gasLimit: GAS_LIMITS.REMOVE_LIQUIDITY }
      );

      const receipt = await tx.wait();
      
      console.log(`Liquidity removed successfully: ${tx.hash}`);
      return {
        hash: tx.hash,
        success: true,
        gasUsed: receipt.gasUsed.toString(),
        operation: 'remove_liquidity',
        step: 'liquidity_removal',
        timestamp: Date.now()
      };

    } catch (error: any) {
      console.error('Remove liquidity failed:', error);
      return {
        hash: '',
        success: false,
        error: error.message,
        operation: 'remove_liquidity',
        step: 'liquidity_removal',
        timestamp: Date.now()
      };
    }
  }

  async getLPTokenBalance(): Promise<string> {
    try {
      this.validatePoolInfo();
      return await this.walletService.getTokenBalance(this.poolInfo!.address);
    } catch (error) {
      console.error('Failed to get LP token balance:', error);
      return '0';
    }
  }

  /**
   * Get pool reserves and calculate optimal liquidity amounts
   */
  async calculateOptimalLiquidity(usdcAmount: string): Promise<{
    wethAmount: string;
    virtualAmount: string;
    expectedLP: string;
  }> {
    try {
      this.validatePoolInfo();
      
      // Get current pool reserves
      const poolContract = new ethers.Contract(
        this.poolInfo!.address,
        ['function getReserves() external view returns (uint256 reserve0, uint256 reserve1, uint256 blockTimestampLast)'],
        this.walletService.getProvider()
      );
      
      const reserves = await poolContract.getReserves!();
      const [reserve0, reserve1] = reserves;
      
      // Determine which token is which based on pool order
      const isWETHFirst = this.poolInfo!.token0.toLowerCase() === TOKENS.WETH.toLowerCase();
      const wethReserve = isWETHFirst ? reserve0 : reserve1;
      const virtualReserve = isWETHFirst ? reserve1 : reserve0;
      
      // Calculate optimal amounts based on current reserves
      const usdcAmountBN = ethers.parseUnits(usdcAmount, 6);
      const halfUsdc = usdcAmountBN / 2n;
      
      // Calculate expected WETH and VIRTUAL amounts
      const expectedWETH = (halfUsdc * wethReserve) / (ethers.parseUnits('1', 6));
      const expectedVirtual = (halfUsdc * virtualReserve) / (ethers.parseUnits('1', 6));
      
      // Calculate expected LP tokens
      const totalSupply = await this.getPoolTotalSupply();
      const expectedLP = (expectedWETH * totalSupply) / wethReserve;
      
      return {
        wethAmount: ethers.formatEther(expectedWETH),
        virtualAmount: ethers.formatEther(expectedVirtual),
        expectedLP: ethers.formatEther(expectedLP)
      };
      
    } catch (error: any) {
      console.error('Failed to calculate optimal liquidity:', error);
      throw new Error(`Liquidity calculation failed: ${error.message}`);
    }
  }

  /**
   * Get pool total supply
   */
  private async getPoolTotalSupply(): Promise<bigint> {
    try {
      const poolContract = new ethers.Contract(
        this.poolInfo!.address,
        ['function totalSupply() external view returns (uint256)'],
        this.walletService.getProvider()
      );
      
      return await poolContract.totalSupply!();
    } catch (error: any) {
      console.error('Failed to get pool total supply:', error);
      return 0n;
    }
  }

  /**
   * Get pool price information
   */
  async getPoolPrice(): Promise<{
    wethPrice: string;
    virtualPrice: string;
    priceImpact: string;
  }> {
    try {
      this.validatePoolInfo();
      
      // Get current reserves
      const poolContract = new ethers.Contract(
        this.poolInfo!.address,
        ['function getReserves() external view returns (uint256 reserve0, uint256 reserve1, uint256 blockTimestampLast)'],
        this.walletService.getProvider()
      );
      
      const reserves = await poolContract.getReserves!();
      const [reserve0, reserve1] = reserves;
      
      // Determine which token is which
      const isWETHFirst = this.poolInfo!.token0.toLowerCase() === TOKENS.WETH.toLowerCase();
      const wethReserve = isWETHFirst ? reserve0 : reserve1;
      const virtualReserve = isWETHFirst ? reserve1 : reserve0;
      
      // Calculate prices (assuming USDC as base)
      const wethPrice = (ethers.parseUnits('1', 6) * wethReserve) / virtualReserve;
      const virtualPrice = (ethers.parseUnits('1', 6) * virtualReserve) / wethReserve;
      
      return {
        wethPrice: ethers.formatUnits(wethPrice, 6),
        virtualPrice: ethers.formatUnits(virtualPrice, 6),
        priceImpact: '0.01' // Placeholder - would calculate based on trade size
      };
      
    } catch (error: any) {
      console.error('Failed to get pool price:', error);
      return {
        wethPrice: '0',
        virtualPrice: '0',
        priceImpact: '0'
      };
    }
  }
}