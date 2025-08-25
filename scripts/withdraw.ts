#!/usr/bin/env ts-node

import dotenv from 'dotenv';
import { DefiAgent } from '../src/services/DefiAgent';

dotenv.config();

async function main() {
  try {
    // Validate environment variables
    const privateKey = process.env.PRIVATE_KEY;
    const gaugeAddress = process.env.GAUGE_ADDRESS;
    const percentage = process.argv[2];

    if (!privateKey) {
      console.error('❌ PRIVATE_KEY environment variable is required');
      console.log('💡 Please create a .env file with your private key');
      process.exit(1);
    }

    if (!percentage) {
      console.error('❌ Percentage argument is required');
      console.log('💡 Usage: npm run withdraw <percentage_to_withdraw>');
      console.log('💡 Example: npm run withdraw 50 (for 50%)');
      console.log('💡 Example: npm run withdraw 100 (for 100%)');
      process.exit(1);
    }

    // Validate percentage
    const percentageNum = parseFloat(percentage);
    if (isNaN(percentageNum) || percentageNum <= 0 || percentageNum > 100) {
      console.error('❌ Invalid percentage. Please provide a number between 1 and 100');
      process.exit(1);
    }

    console.log('🚀 DeFi Agent - Withdraw Flow');
    console.log('==============================');
    console.log(`📉 Percentage: ${percentage}%`);
    console.log(`🔗 Network: Base Mainnet`);
    console.log(`🏊 Pool: WETH-VIRTUAL`);
    
    // Initialize the agent
    console.log('\n🔍 Initializing agent...');
    const agent = new DefiAgent(privateKey, gaugeAddress);
    
    const initialized = await agent.initialize();
    if (!initialized) {
      throw new Error('Failed to initialize DeFi Agent');
    }

    // Get initial account summary
    console.log('\n📊 Initial Account Summary:');
    await agent.getAccountSummary();

    // Execute withdraw flow
    console.log(`\n📉 Starting withdraw flow for ${percentage}% of position...`);
    const withdrawResult = await agent.executeWithdrawFlow({
      percentage: percentageNum,
      slippageTolerance: 0.5,
      enableMulticall: true,
      gasOptimization: true
    });

    if (withdrawResult.success) {
      console.log('\n✅ Withdraw flow completed successfully!');
      console.log('\n📋 Transaction Details:');
      
      withdrawResult.transactions.forEach((tx, i) => {
        if (tx.success) {
          console.log(`  ${i + 1}. ${tx.operation}: ${tx.hash}`);
          console.log(`     Gas Used: ${tx.gasUsed || 'N/A'}`);
          console.log(`     Status: ${tx.success ? '✅ Success' : '❌ Failed'}`);
        }
      });

      if (withdrawResult.withdrawalReceipt) {
        console.log('\n📋 Withdrawal Receipt:');
        console.log(`Withdrawal ID: ${withdrawResult.withdrawalReceipt.withdrawalId}`);
        console.log(`Withdrawn Amount: ${withdrawResult.withdrawalReceipt.withdrawnAmount}`);
        console.log(`Returned USDC: ${withdrawResult.withdrawalReceipt.returnedUSDC}`);
        console.log(`Timestamp: ${new Date(withdrawResult.withdrawalReceipt.timestamp).toISOString()}`);
      }

      // Get updated account summary
      console.log('\n📊 Updated Account Summary:');
      await agent.getAccountSummary();

      console.log('\n🎉 Withdrawal completed successfully!');
      console.log('💡 USDC has been returned to your wallet');
      
    } else {
      console.error('\n❌ Withdraw flow failed:', withdrawResult.error);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Fatal error during withdraw flow:', error);
    process.exit(1);
  }
}

// Run the withdraw flow
if (require.main === module) {
  main().catch(console.error);
}

