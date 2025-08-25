import dotenv from 'dotenv';
import { DefiAgent } from './services/DefiAgent';

dotenv.config();

async function main() {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    const gaugeAddress = process.env.GAUGE_ADDRESS;

    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable is required');
    }

    console.log('🚀 Initializing Enhanced DeFi Agent for Aerodrome WETH-VIRTUAL LP Automation');
    
    const agent = new DefiAgent(privateKey, gaugeAddress);

    // Initialize the agent (discover pool, setup services)
    console.log('\n🔍 Initializing agent and discovering pool...');
    const initialized = await agent.initialize();
    
    if (!initialized) {
      throw new Error('Failed to initialize DeFi Agent');
    }

    // Display agent status
    const status = agent.getAgentStatus();
    console.log('\n📊 Agent Status:');
    console.log(`Initialized: ${status.isInitialized}`);
    console.log(`Pool Discovered: ${status.poolDiscovered}`);
    if (status.poolInfo) {
      console.log(`Pool Address: ${status.poolInfo.address}`);
      console.log(`Pool Type: ${status.poolInfo.stable ? 'Stable' : 'Volatile (Concentrated)'}`);
    }

    // Display account summary
    await agent.getAccountSummary();

    // Example: Execute deposit flow with 100 USDC and multicall optimization
    console.log('\n📈 Starting enhanced deposit flow with multicall optimization...');
    const depositResult = await agent.executeDepositFlow({
      amount: '100',
      slippageTolerance: 0.5,
      enableMulticall: true,
      gasOptimization: true
    });

    if (depositResult.success) {
      console.log('✅ Enhanced deposit flow completed successfully!');
      console.log('Transaction hashes:');
      depositResult.transactions.forEach((tx, i) => {
        if (tx.success) {
          console.log(`  ${i + 1}. ${tx.hash}`);
        }
      });
      
      if (depositResult.positionReceipt) {
        console.log('\n📋 Position Receipt:');
        console.log(`Position ID: ${depositResult.positionReceipt.positionId}`);
        console.log(`LP Tokens: ${depositResult.positionReceipt.lpTokens}`);
        console.log(`Staked Amount: ${depositResult.positionReceipt.stakedAmount}`);
      }
    } else {
      console.log('❌ Enhanced deposit flow failed:', depositResult.error);
    }

    // Example: Execute withdraw flow (50% of position)
    console.log('\n📉 Starting enhanced withdraw flow (50% of position)...');
    const withdrawResult = await agent.executeWithdrawFlow({
      percentage: 50,
      slippageTolerance: 0.5,
      enableMulticall: true,
      gasOptimization: true
    });

    if (withdrawResult.success) {
      console.log('✅ Enhanced withdraw flow completed successfully!');
      console.log('Transaction hashes:');
      withdrawResult.transactions.forEach((tx, i) => {
        if (tx.success) {
          console.log(`  ${i + 1}. ${tx.hash}`);
        }
      });
      
      if (withdrawResult.withdrawalReceipt) {
        console.log('\n📋 Withdrawal Receipt:');
        console.log(`Withdrawal ID: ${withdrawResult.withdrawalReceipt.withdrawalId}`);
        console.log(`Withdrawn Amount: ${withdrawResult.withdrawalReceipt.withdrawnAmount}`);
        console.log(`Returned USDC: ${withdrawResult.withdrawalReceipt.returnedUSDC}`);
      }
    } else {
      console.log('❌ Enhanced withdraw flow failed:', withdrawResult.error);
    }

    // Display updated account summary
    console.log('\n📊 Updated account summary:');
    await agent.getAccountSummary();

    // Display final agent status
    const finalStatus = agent.getAgentStatus();
    console.log('\n📈 Final Agent Status:');
    console.log(`Total Operations: ${finalStatus.totalOperations}`);
    console.log(`Successful: ${finalStatus.successfulOperations}`);
    console.log(`Failed: ${finalStatus.failedOperations}`);
    console.log(`Error Recovery Stats:`, finalStatus.recoveryStats);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the agent
if (require.main === module) {
  main().catch(console.error);
}

export { DefiAgent };