import { DefiAgent } from '../src/services/DefiAgent';

/**
 * Basic Usage Example for DeFi Agent
 * 
 * This example demonstrates how to:
 * 1. Initialize the agent
 * 2. Execute a deposit flow
 * 3. Execute a withdraw flow
 * 4. Monitor agent status
 */

async function basicUsageExample() {
  console.log('🚀 DeFi Agent Basic Usage Example');
  console.log('==================================');

  // Your private key (keep secure!)
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY environment variable is required');
    return;
  }

  try {
    // 1. Create and initialize the agent
    console.log('\n1️⃣ Creating DeFi Agent...');
    const agent = new DefiAgent(privateKey);
    
    console.log('2️⃣ Initializing agent and discovering pool...');
    const initialized = await agent.initialize();
    
    if (!initialized) {
      throw new Error('Failed to initialize DeFi Agent');
    }
    
    console.log('✅ Agent initialized successfully');

    // 2. Get initial account summary
    console.log('\n3️⃣ Getting account summary...');
    const initialSummary = await agent.getAccountSummary();
    if (initialSummary) {
      console.log(`Initial USDC Balance: ${initialSummary.balances.usdc}`);
      console.log(`Initial ETH Balance: ${initialSummary.wallet.balance}`);
    }

    // 3. Execute deposit flow (small amount for testing)
    console.log('\n4️⃣ Executing deposit flow with 10 USDC...');
    const depositResult = await agent.executeDepositFlow({
      amount: '10',
      slippageTolerance: 0.5,
      enableMulticall: true,
      gasOptimization: true
    });

    if (depositResult.success) {
      console.log('✅ Deposit flow completed successfully!');
      console.log('Transaction hashes:');
      depositResult.transactions.forEach((tx, i) => {
        if (tx.success) {
          console.log(`  ${i + 1}. ${tx.hash}`);
        }
      });
      
      if (depositResult.positionReceipt) {
        console.log('\n📋 Position Created:');
        console.log(`Position ID: ${depositResult.positionReceipt.positionId}`);
        console.log(`LP Tokens: ${depositResult.positionReceipt.lpTokens}`);
        console.log(`Staked Amount: ${depositResult.positionReceipt.stakedAmount}`);
      }
    } else {
      console.log('❌ Deposit flow failed:', depositResult.error);
      return;
    }

    // 4. Wait a bit for transactions to settle
    console.log('\n⏳ Waiting for transactions to settle...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 5. Get updated account summary
    console.log('\n5️⃣ Getting updated account summary...');
    const updatedSummary = await agent.getAccountSummary();
    if (updatedSummary) {
      console.log(`Updated USDC Balance: ${updatedSummary.balances.usdc}`);
      console.log(`LP Token Balance: ${updatedSummary.balances.lp}`);
      console.log(`Staked LP Balance: ${updatedSummary.balances.staked}`);
    }

    // 6. Execute withdraw flow (50% of position)
    console.log('\n6️⃣ Executing withdraw flow (50% of position)...');
    const withdrawResult = await agent.executeWithdrawFlow({
      percentage: 50,
      slippageTolerance: 0.5,
      enableMulticall: true,
      gasOptimization: true
    });

    if (withdrawResult.success) {
      console.log('✅ Withdraw flow completed successfully!');
      console.log('Transaction hashes:');
      withdrawResult.transactions.forEach((tx, i) => {
        if (tx.success) {
          console.log(`  ${i + 1}. ${tx.hash}`);
        }
      });
      
      if (withdrawResult.withdrawalReceipt) {
        console.log('\n📋 Withdrawal Completed:');
        console.log(`Withdrawal ID: ${withdrawResult.withdrawalReceipt.withdrawalId}`);
        console.log(`Withdrawn Amount: ${withdrawResult.withdrawalReceipt.withdrawnAmount}`);
        console.log(`Returned USDC: ${withdrawResult.withdrawalReceipt.returnedUSDC}`);
      }
    } else {
      console.log('❌ Withdraw flow failed:', withdrawResult.error);
    }

    // 7. Final account summary and agent status
    console.log('\n7️⃣ Getting final account summary...');
    const finalSummary = await agent.getAccountSummary();
    if (finalSummary) {
      console.log(`Final USDC Balance: ${finalSummary.balances.usdc}`);
      console.log(`Final LP Token Balance: ${finalSummary.balances.lp}`);
      console.log(`Final Staked LP Balance: ${finalSummary.balances.staked}`);
    }

    console.log('\n8️⃣ Getting final agent status...');
    const finalStatus = agent.getAgentStatus();
    console.log(`Total Operations: ${finalStatus.totalOperations}`);
    console.log(`Successful: ${finalStatus.successfulOperations}`);
    console.log(`Failed: ${finalStatus.failedOperations}`);
    console.log(`Success Rate: ${((finalStatus.successfulOperations / finalStatus.totalOperations) * 100).toFixed(2)}%`);

    console.log('\n🎉 Basic usage example completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Monitor your positions on BaseScan');
    console.log('2. Check Aerodrome dashboard for staking rewards');
    console.log('3. Consider implementing automated rebalancing');
    console.log('4. Monitor gas prices for optimal execution timing');

  } catch (error) {
    console.error('❌ Example execution failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure you have sufficient USDC and ETH');
    console.log('2. Check Base chain connectivity');
    console.log('3. Verify contract addresses are correct');
    console.log('4. Review error logs above');
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  basicUsageExample().catch(console.error);
}

export { basicUsageExample };
