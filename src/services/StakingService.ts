import { ethers } from 'ethers';
import { WalletService } from './WalletService';
import { AERODROME_ADDRESSES, GAS_LIMITS, WETH_VIRTUAL_POOL } from '../config/constants';
import { AERODROME_GAUGE_ABI } from '../config/abis';
import { TransactionResult } from '../types';

export class StakingService {
  private walletService: WalletService;
  private gaugeContract: ethers.Contract;
  private gaugeAddress: string;

  constructor(walletService: WalletService, gaugeAddress?: string) {
    this.walletService = walletService;
    // In a real implementation, you'd get the gauge address from the pool
    this.gaugeAddress = gaugeAddress || "0x35968D8d2B80F7fe4476B3D5dC5C72D86b4a9F7c";
    this.gaugeContract = new ethers.Contract(
      this.gaugeAddress,
      AERODROME_GAUGE_ABI,
      walletService.getWallet()
    );
  }

  async stakeLPTokens(amount: string): Promise<TransactionResult> {
    try {
      console.log(`Staking ${amount} LP tokens...`);

      // Approve LP tokens for staking
      await this.walletService.ensureTokenApproval(
        WETH_VIRTUAL_POOL.address,
        this.gaugeAddress,
        amount
      );

      const stakeAmount = ethers.parseEther(amount);

      const tx = await this.gaugeContract.deposit!(stakeAmount, {
        gasLimit: GAS_LIMITS.STAKE
      });

      const receipt = await tx.wait();
      
      console.log(`LP tokens staked successfully: ${tx.hash}`);
      return {
        hash: tx.hash,
        success: true,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error: any) {
      console.error('Staking failed:', error);
      return {
        hash: '',
        success: false,
        error: error.message
      };
    }
  }

  async unstakeLPTokens(amount: string): Promise<TransactionResult> {
    try {
      console.log(`Unstaking ${amount} LP tokens...`);

      const unstakeAmount = ethers.parseEther(amount);

      const tx = await this.gaugeContract.withdraw!(unstakeAmount, {
        gasLimit: GAS_LIMITS.UNSTAKE
      });

      const receipt = await tx.wait();
      
      console.log(`LP tokens unstaked successfully: ${tx.hash}`);
      return {
        hash: tx.hash,
        success: true,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error: any) {
      console.error('Unstaking failed:', error);
      return {
        hash: '',
        success: false,
        error: error.message
      };
    }
  }

  async getStakedBalance(): Promise<string> {
    try {
      const balance = await this.gaugeContract.balanceOf!(this.walletService.getWallet().address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get staked balance:', error);
      return '0';
    }
  }

  async claimRewards(): Promise<TransactionResult> {
    try {
      console.log('Claiming staking rewards...');

      const tx = await this.gaugeContract.getReward!({
        gasLimit: GAS_LIMITS.UNSTAKE
      });

      const receipt = await tx.wait();
      
      console.log(`Rewards claimed successfully: ${tx.hash}`);
      return {
        hash: tx.hash,
        success: true,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error: any) {
      console.error('Claim rewards failed:', error);
      return {
        hash: '',
        success: false,
        error: error.message
      };
    }
  }
}