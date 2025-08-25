#!/usr/bin/env ts-node

import dotenv from 'dotenv';
import { DefiAgent } from '../src/services/DefiAgent';
import { TOKENS } from '../src/config/constants';

dotenv.config();

async function main() {
  try {
    // Validate environment variables
    const privateKey = process.env.PRIVATE_KEY;
    const gaugeAddress = process.env.GAUGE_ADDRESS;
    const amount = process.argv[2];

    if (!privateKey) {
      console.error('❌ PRIVATE_KEY environment variable is required');
      console.log('💡 Please create a .env file with your private key');
      process.exit(1);
    }

    if (!amount) {
      console.error('❌ Amount argument is required');
      console.log('💡 Usage: npm run deposit <amount_in_usdc>');
      console.log('💡 Example: npm run deposit 100');
      process.exit(1);
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      console.error('❌ Invalid amount. Please provide a positive number');
      process.exit(1);
    }

    console.log('🚀 DeFi Agent - Deposit Flow');
    console.log('=============================');
    console.log(`💰 Amount: ${amount} USDC`);
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

    // Execute deposit flow
    console.log(`\n📈 Starting deposit flow for ${amount} USDC...`);
    const depositResult = await agent.executeDepositFlow({
      amount,
      slippageTolerance: 0.5,
      enableMulticall: true,
      gasOptimization: true
    });

    if (depositResult.success) {
      console.log('\n✅ Deposit flow completed successfully!');
      console.log('\n📋 Transaction Details:');
      
      depositResult.transactions.forEach((tx, i) => {
        if (tx.success) {
          console.log(`  ${i + 1}. ${tx.operation}: ${tx.hash}`);
          console.log(`     Gas Used: ${tx.gasUsed || 'N/A'}`);
          console.log(`     Status: ${tx.success ? '✅ Success' : '❌ Failed'}`);
        }
      });

      if (depositResult.positionReceipt) {
        console.log('\n📋 Position Receipt:');
        console.log(`Position ID: ${depositResult.positionReceipt.positionId}`);
        console.log(`LP Tokens: ${depositResult.positionReceipt.lpTokens}`);
        console.log(`Staked Amount: ${depositResult.positionReceipt.stakedAmount}`);
        console.log(`Pool Address: ${depositResult.positionReceipt.poolAddress}`);
        console.log(`Gauge Address: ${depositResult.positionReceipt.gaugeAddress}`);
        console.log(`Timestamp: ${new Date(depositResult.positionReceipt.timestamp).toISOString()}`);
      }

      // Get updated account summary
      console.log('\n📊 Updated Account Summary:');
      await agent.getAccountSummary();

      console.log('\n🎉 Deposit completed successfully!');
      console.log('💡 You can now check your position on BaseScan or Aerodrome');
      
    } else {
      console.error('\n❌ Deposit flow failed:', depositResult.error);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Fatal error during deposit flow:', error);
    process.exit(1);
  }
}

// Run the deposit flow
if (require.main === module) {
  main().catch(console.error);
}

