#!/usr/bin/env ts-node

import readline from 'readline';
import { DefiAgent } from '../src/services/DefiAgent';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class DeFiAgentCLI {
  private agent: DefiAgent;
  private isInitialized = false;

  constructor() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.error('❌ PRIVATE_KEY environment variable is required');
      console.log('💡 Please create a .env file with your private key');
      process.exit(1);
    }

    this.agent = new DefiAgent(privateKey);
  }

  async start() {
    console.log('🚀 DeFi Agent CLI - Aerodrome WETH-VIRTUAL LP Automation');
    console.log('==========================================================');
    
    try {
      // Initialize the agent
      console.log('\n🔍 Initializing agent and discovering pool...');
      this.isInitialized = await this.agent.initialize();
      
      if (this.isInitialized) {
        console.log('✅ Agent initialized successfully');
        await this.showMainMenu();
      } else {
        console.log('❌ Failed to initialize agent');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ CLI startup failed:', error);
      process.exit(1);
    }
  }

  private async showMainMenu() {
    while (true) {
      console.log('\n📋 Main Menu:');
      console.log('1. View Account Summary');
      console.log('2. Execute Deposit Flow');
      console.log('3. Execute Withdraw Flow');
      console.log('4. View Agent Status');
      console.log('5. View Pool Information');
      console.log('6. Exit');

      const choice = await this.question('Select an option (1-6): ');

      switch (choice) {
        case '1':
          await this.showAccountSummary();
          break;
        case '2':
          await this.executeDepositFlow();
          break;
        case '3':
          await this.executeWithdrawFlow();
          break;
        case '4':
          await this.showAgentStatus();
          break;
        case '5':
          await this.showPoolInformation();
          break;
        case '6':
          console.log('👋 Goodbye!');
          process.exit(0);
        default:
          console.log('❌ Invalid option. Please select 1-6.');
      }
    }
  }

  private async showAccountSummary() {
    console.log('\n📊 Account Summary:');
    console.log('==================');
    
    try {
      const summary = await this.agent.getAccountSummary();
      if (summary) {
        console.log(`Wallet Address: ${summary.wallet.address}`);
        console.log(`ETH Balance: ${summary.wallet.balance}`);
        console.log(`USDC Balance: ${summary.balances.usdc}`);
        console.log(`WETH Balance: ${summary.balances.weth}`);
        console.log(`VIRTUAL Balance: ${summary.balances.virtual}`);
        console.log(`LP Token Balance: ${summary.balances.lp}`);
        console.log(`Staked LP Balance: ${summary.balances.staked}`);
      }
    } catch (error) {
      console.error('❌ Failed to get account summary:', error);
    }
  }

  private async executeDepositFlow() {
    console.log('\n📈 Deposit Flow:');
    console.log('================');
    
    try {
      const amount = await this.question('Enter USDC amount to deposit: ');
      const slippage = await this.question('Enter slippage tolerance (0.1-5.0, default 0.5): ');
      const enableMulticall = await this.question('Enable multicall optimization? (y/n, default y): ');
      const gasOptimization = await this.question('Enable gas optimization? (y/n, default y): ');

      const slippageNum = parseFloat(slippage) || 0.5;
      const multicall = enableMulticall.toLowerCase() !== 'n';
      const gasOpt = gasOptimization.toLowerCase() !== 'n';

      console.log(`\n🚀 Executing deposit flow with ${amount} USDC...`);
      console.log(`Slippage: ${slippageNum}%`);
      console.log(`Multicall: ${multicall ? 'Enabled' : 'Disabled'}`);
      console.log(`Gas Optimization: ${gasOpt ? 'Enabled' : 'Disabled'}`);

      const result = await this.agent.executeDepositFlow({
        amount,
        slippageTolerance: slippageNum,
        enableMulticall: multicall,
        gasOptimization: gasOpt
      });

      if (result.success) {
        console.log('✅ Deposit flow completed successfully!');
        console.log('Transaction hashes:');
        result.transactions.forEach((tx, i) => {
          if (tx.success) {
            console.log(`  ${i + 1}. ${tx.hash}`);
          }
        });
        
        if (result.positionReceipt) {
          console.log('\n📋 Position Receipt:');
          console.log(`Position ID: ${result.positionReceipt.positionId}`);
          console.log(`LP Tokens: ${result.positionReceipt.lpTokens}`);
          console.log(`Staked Amount: ${result.positionReceipt.stakedAmount}`);
        }
      } else {
        console.log('❌ Deposit flow failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Deposit flow error:', error);
    }
  }

  private async executeWithdrawFlow() {
    console.log('\n📉 Withdraw Flow:');
    console.log('==================');
    
    try {
      const percentage = await this.question('Enter percentage to withdraw (1-100): ');
      const slippage = await this.question('Enter slippage tolerance (0.1-5.0, default 0.5): ');
      const enableMulticall = await this.question('Enable multicall optimization? (y/n, default y): ');
      const gasOptimization = await this.question('Enable gas optimization? (y/n, default y): ');

      const percentageNum = parseFloat(percentage) || 50;
      const slippageNum = parseFloat(slippage) || 0.5;
      const multicall = enableMulticall.toLowerCase() !== 'n';
      const gasOpt = gasOptimization.toLowerCase() !== 'n';

      console.log(`\n🚀 Executing withdraw flow for ${percentageNum}% of position...`);
      console.log(`Slippage: ${slippageNum}%`);
      console.log(`Multicall: ${multicall ? 'Enabled' : 'Disabled'}`);
      console.log(`Gas Optimization: ${gasOpt ? 'Enabled' : 'Disabled'}`);

      const result = await this.agent.executeWithdrawFlow({
        percentage: percentageNum,
        slippageTolerance: slippageNum,
        enableMulticall: multicall,
        gasOptimization: gasOpt
      });

      if (result.success) {
        console.log('✅ Withdraw flow completed successfully!');
        console.log('Transaction hashes:');
        result.transactions.forEach((tx, i) => {
          if (tx.success) {
            console.log(`  ${i + 1}. ${tx.hash}`);
          }
        });
        
        if (result.withdrawalReceipt) {
          console.log('\n📋 Withdrawal Receipt:');
          console.log(`Withdrawal ID: ${result.withdrawalReceipt.withdrawalId}`);
          console.log(`Withdrawn Amount: ${result.withdrawalReceipt.withdrawnAmount}`);
          console.log(`Returned USDC: ${result.withdrawalReceipt.returnedUSDC}`);
        }
      } else {
        console.log('❌ Withdraw flow failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Withdraw flow error:', error);
    }
  }

  private async showAgentStatus() {
    console.log('\n📊 Agent Status:');
    console.log('================');
    
    try {
      const status = this.agent.getAgentStatus();
      console.log(`Initialized: ${status.isInitialized}`);
      console.log(`Pool Discovered: ${status.poolDiscovered}`);
      console.log(`Total Operations: ${status.totalOperations}`);
      console.log(`Successful Operations: ${status.successfulOperations}`);
      console.log(`Failed Operations: ${status.failedOperations}`);
      
      if (status.poolInfo) {
        console.log(`\nPool Information:`);
        console.log(`Pool Address: ${status.poolInfo.address}`);
        console.log(`Pool Type: ${status.poolInfo.stable ? 'Stable' : 'Volatile (Concentrated)'}`);
        console.log(`Gauge Address: ${status.poolInfo.gaugeAddress}`);
      }
      
      console.log(`\nError Recovery Statistics:`);
      console.log(`Total Errors: ${status.recoveryStats.totalErrors}`);
      console.log(`Recovered Errors: ${status.recoveryStats.recoveredErrors}`);
      console.log(`Manual Interventions: ${status.recoveryStats.manualInterventions}`);
    } catch (error) {
      console.error('❌ Failed to get agent status:', error);
    }
  }

  private async showPoolInformation() {
    console.log('\n🏊 Pool Information:');
    console.log('====================');
    
    try {
      const poolInfo = this.agent.getPoolInfo();
      if (poolInfo) {
        console.log(`Pool Address: ${poolInfo.address}`);
        console.log(`Token 0: ${poolInfo.token0}`);
        console.log(`Token 1: ${poolInfo.token1}`);
        console.log(`Pool Type: ${poolInfo.stable ? 'Stable' : 'Volatile (Concentrated)'}`);
        console.log(`Gauge Address: ${poolInfo.gaugeAddress}`);
        console.log(`\nReserves:`);
        console.log(`  Reserve 0: ${poolInfo.reserves.reserve0}`);
        console.log(`  Reserve 1: ${poolInfo.reserves.reserve1}`);
        console.log(`  Total Supply: ${poolInfo.reserves.totalSupply}`);
      } else {
        console.log('❌ No pool information available');
      }
    } catch (error) {
      console.error('❌ Failed to get pool information:', error);
    }
  }

  private question(query: string): Promise<string> {
    return new Promise((resolve) => {
      rl.question(query, resolve);
    });
  }
}

// Start the CLI
const cli = new DeFiAgentCLI();
cli.start().catch(console.error);
