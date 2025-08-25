import { ethers } from 'ethers';
import { WalletService } from './WalletService';
import { AERODROME_ADDRESSES, TOKENS, GAS_LIMITS } from '../config/constants';
import { AERODROME_ROUTER_ABI } from '../config/abis';
import { SwapParams, TransactionResult } from '../types';

export class SwapService {
  private walletService: WalletService;
  private routerContract: ethers.Contract;

  constructor(walletService: WalletService) {
    this.walletService = walletService;
    this.routerContract = new ethers.Contract(
      AERODROME_ADDRESSES.ROUTER,
      AERODROME_ROUTER_ABI,
      walletService.getWallet()
    );

    // Validate router contract creation
    if (!this.routerContract) {
      throw new Error('Failed to create router contract instance');
    }
  }

  private validateRouterContract(): void {
    if (!this.routerContract) {
      throw new Error('Router contract is not initialized');
    }
  }

  private getRouterContract(): ethers.Contract {
    this.validateRouterContract();
    return this.routerContract;
  }

  async swapUSDCToWETH(amount: string, slippage: number = 0.5): Promise<TransactionResult> {
    try {
      console.log(`Swapping ${amount} USDC to WETH...`);
      
      const routerContract = this.getRouterContract();
      
      // Approve USDC spending
      await this.walletService.ensureTokenApproval(
        TOKENS.USDC,
        AERODROME_ADDRESSES.ROUTER,
        amount
      );

      const amountIn = ethers.parseUnits(amount, 6); // USDC has 6 decimals
      const routes = [{
        from: TOKENS.USDC,
        to: TOKENS.WETH,
        stable: false
      }];

      // Get expected output amount with validation
      const amountsOut = await routerContract.getAmountsOut!(amountIn, routes);
      
      if (!amountsOut || amountsOut.length < 2) {
        throw new Error('Failed to get expected output amounts');
      }

      const amountOutMin = amountsOut[1] * BigInt(Math.floor((100 - slippage) * 100)) / 10000n;
      const deadline = Math.floor(Date.now() / 1000) + 1800; // 30 minutes

      const tx = await routerContract.swapExactTokensForTokens!(
        amountIn,
        amountOutMin,
        routes,
        this.walletService.getWallet().address,
        deadline,
        { gasLimit: GAS_LIMITS.SWAP }
      );

      if (!tx) {
        throw new Error('Failed to create swap transaction');
      }

      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error('Transaction receipt is null');
      }
      
      console.log(`USDC to WETH swap completed: ${tx.hash}`);
      return {
        hash: tx.hash,
        success: true,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error: any) {
      console.error('USDC to WETH swap failed:', error);
      return {
        hash: '',
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  async swapUSDCToVIRTUAL(amount: string, slippage: number = 0.5): Promise<TransactionResult> {
    try {
      console.log(`Swapping ${amount} USDC to VIRTUAL...`);
      
      const routerContract = this.getRouterContract();
      
      await this.walletService.ensureTokenApproval(
        TOKENS.USDC,
        AERODROME_ADDRESSES.ROUTER,
        amount
      );

      const amountIn = ethers.parseUnits(amount, 6);
      const routes = [{
        from: TOKENS.USDC,
        to: TOKENS.VIRTUAL,
        stable: false
      }];

      const amountsOut = await routerContract.getAmountsOut!(amountIn, routes);
      
      if (!amountsOut || amountsOut.length < 2) {
        throw new Error('Failed to get expected output amounts');
      }

      const amountOutMin = amountsOut[1] * BigInt(Math.floor((100 - slippage) * 100)) / 10000n;
      const deadline = Math.floor(Date.now() / 1000) + 1800;

      const tx = await routerContract.swapExactTokensForTokens!(
        amountIn,
        amountOutMin,
        routes,
        this.walletService.getWallet().address,
        deadline,
        { gasLimit: GAS_LIMITS.SWAP }
      );

      if (!tx) {
        throw new Error('Failed to create swap transaction');
      }

      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error('Transaction receipt is null');
      }
      
      console.log(`USDC to VIRTUAL swap completed: ${tx.hash}`);
      return {
        hash: tx.hash,
        success: true,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error: any) {
      console.error('USDC to VIRTUAL swap failed:', error);
      return {
        hash: '',
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  async swapWETHToUSDC(amount: string, slippage: number = 0.5): Promise<TransactionResult> {
    try {
      console.log(`Swapping ${amount} WETH to USDC...`);
      
      const routerContract = this.getRouterContract();
      
      await this.walletService.ensureTokenApproval(
        TOKENS.WETH,
        AERODROME_ADDRESSES.ROUTER,
        amount
      );

      const amountIn = ethers.parseEther(amount);
      const routes = [{
        from: TOKENS.WETH,
        to: TOKENS.USDC,
        stable: false
      }];

      const amountsOut = await routerContract.getAmountsOut!(amountIn, routes);
      
      if (!amountsOut || amountsOut.length < 2) {
        throw new Error('Failed to get expected output amounts');
      }

      const amountOutMin = amountsOut[1] * BigInt(Math.floor((100 - slippage) * 100)) / 10000n;
      const deadline = Math.floor(Date.now() / 1000) + 1800;

      const tx = await routerContract.swapExactTokensForTokens!(
        amountIn,
        amountOutMin,
        routes,
        this.walletService.getWallet().address,
        deadline,
        { gasLimit: GAS_LIMITS.SWAP }
      );

      if (!tx) {
        throw new Error('Failed to create swap transaction');
      }

      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error('Transaction receipt is null');
      }
      
      console.log(`WETH to USDC swap completed: ${tx.hash}`);
      return {
        hash: tx.hash,
        success: true,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error: any) {
      console.error('WETH to USDC swap failed:', error);
      return {
        hash: '',
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  async swapVIRTUALToUSDC(amount: string, slippage: number = 0.5): Promise<TransactionResult> {
    try {
      console.log(`Swapping ${amount} VIRTUAL to USDC...`);
      
      const routerContract = this.getRouterContract();
      
      await this.walletService.ensureTokenApproval(
        TOKENS.VIRTUAL,
        AERODROME_ADDRESSES.ROUTER,
        amount
      );

      const amountIn = ethers.parseEther(amount);
      const routes = [{
        from: TOKENS.VIRTUAL,
        to: TOKENS.USDC,
        stable: false
      }];

      const amountsOut = await routerContract.getAmountsOut!(amountIn, routes);
      
      if (!amountsOut || amountsOut.length < 2) {
        throw new Error('Failed to get expected output amounts');
      }

      const amountOutMin = amountsOut[1] * BigInt(Math.floor((100 - slippage) * 100)) / 10000n;
      const deadline = Math.floor(Date.now() / 1000) + 1800;

      const tx = await routerContract.swapExactTokensForTokens!(
        amountIn,
        amountOutMin,
        routes,
        this.walletService.getWallet().address,
        deadline,
        { gasLimit: GAS_LIMITS.SWAP }
      );

      if (!tx) {
        throw new Error('Failed to create swap transaction');
      }

      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error('Transaction receipt is null');
      }
      
      console.log(`VIRTUAL to USDC swap completed: ${tx.hash}`);
      return {
        hash: tx.hash,
        success: true,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error: any) {
      console.error('VIRTUAL to USDC swap failed:', error);
      return {
        hash: '',
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  // Additional utility methods

  async getQuote(fromToken: string, toToken: string, amount: string, stable: boolean = false): Promise<string | null> {
    try {
      const routerContract = this.getRouterContract();

      const amountIn = ethers.parseEther(amount);
      const routes = [{
        from: fromToken,
        to: toToken,
        stable: stable
      }];

      const amountsOut = await routerContract.getAmountsOut!(amountIn, routes);
      
      if (!amountsOut || amountsOut.length < 2) {
        throw new Error('Failed to get quote');
      }

      return ethers.formatEther(amountsOut[1]);

    } catch (error: any) {
      console.error('Failed to get quote:', error);
      return null;
    }
  }

  async validateRouterAddress(): Promise<boolean> {
    try {
      const code = await this.walletService.getProvider().getCode(AERODROME_ADDRESSES.ROUTER);
      return code !== '0x';
    } catch (error) {
      console.warn('Failed to validate router address:', error);
      return false;
    }
  }

  getRouterAddress(): string {
    return AERODROME_ADDRESSES.ROUTER;
  }
}