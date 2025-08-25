import { ethers } from 'ethers';
import { BASE_RPC_URL, BASE_CHAIN_ID } from '../config/constants';
import { AgentWallet } from '../types';

export class WalletService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor(privateKey: string) {
    this.provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  async getWalletInfo(): Promise<AgentWallet> {
    const balance = await this.provider.getBalance(this.wallet.address);
    
    return {
      address: this.wallet.address,
      privateKey: this.wallet.privateKey,
      balance: ethers.formatEther(balance)
    };
  }

  async getTokenBalance(tokenAddress: string): Promise<string> {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"],
      this.provider
    );

    if (!tokenContract) {
      throw new Error('Failed to create token contract instance');
    }

    try {
      const [balance, decimals] = await Promise.all([
        (tokenContract.balanceOf as (address: string) => Promise<ethers.BigNumberish>)(this.wallet.address),
        (tokenContract.decimals as () => Promise<number>)()
      ]);

      if (balance === undefined || decimals === undefined) {
        throw new Error('Failed to fetch token balance or decimals');
      }

      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      throw new Error(`Error getting token balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async ensureTokenApproval(tokenAddress: string, spenderAddress: string, amount: string): Promise<void> {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ["function approve(address,uint256) returns (bool)", "function allowance(address,address) view returns (uint256)"],
      this.wallet
    );

    if (!tokenContract) {
      throw new Error('Failed to create token contract instance');
    }

    try {
      if (typeof tokenContract.allowance !== 'function') {
        throw new Error('allowance function is not available on token contract');
      }
      const currentAllowance = await tokenContract.allowance(this.wallet.address, spenderAddress);
      
      if (currentAllowance === undefined) {
        throw new Error('Failed to fetch current allowance');
      }

      const amountBN = ethers.parseUnits(amount, 18);

      if (currentAllowance < amountBN) {
        console.log(`Approving ${amount} tokens for ${spenderAddress}...`);
        
        if (typeof tokenContract.approve !== 'function') {
          throw new Error('approve function is not available on token contract');
        }
        const tx = await tokenContract.approve(spenderAddress, amountBN);
        
        if (!tx) {
          throw new Error('Failed to create approval transaction');
        }

        await tx.wait();
        console.log(`Approval confirmed: ${tx.hash}`);
      } else {
        console.log(`Sufficient allowance already exists: ${ethers.formatUnits(currentAllowance, 18)}`);
      }
    } catch (error) {
      throw new Error(`Error ensuring token approval: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getWallet(): ethers.Wallet {
    return this.wallet;
  }

  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  // Additional helper method to validate token contract
  private async validateTokenContract(tokenAddress: string): Promise<boolean> {
    try {
      const code = await this.provider.getCode(tokenAddress);
      return code !== '0x';
    } catch (error) {
      console.warn(`Failed to validate token contract at ${tokenAddress}:`, error);
      return false;
    }
  }

  // Enhanced method to get token balance with validation
  async getTokenBalanceWithValidation(tokenAddress: string): Promise<string> {
    // Validate that the address contains a contract
    const isValidContract = await this.validateTokenContract(tokenAddress);
    if (!isValidContract) {
      throw new Error(`No contract found at address: ${tokenAddress}`);
    }

    return this.getTokenBalance(tokenAddress);
  }

  // Enhanced method to ensure token approval with validation
  async ensureTokenApprovalWithValidation(tokenAddress: string, spenderAddress: string, amount: string): Promise<void> {
    // Validate that the token address contains a contract
    const isValidContract = await this.validateTokenContract(tokenAddress);
    if (!isValidContract) {
      throw new Error(`No contract found at token address: ${tokenAddress}`);
    }

    // Validate that the spender address contains a contract (if it's supposed to be a contract)
    const spenderIsContract = await this.validateTokenContract(spenderAddress);
    if (!spenderIsContract) {
      console.warn(`Spender address ${spenderAddress} does not appear to be a contract`);
    }

    return this.ensureTokenApproval(tokenAddress, spenderAddress, amount);
  }
}