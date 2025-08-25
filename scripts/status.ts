#!/usr/bin/env ts-node

import dotenv from 'dotenv';
import { DefiAgent } from '../src/services/DefiAgent';

dotenv.config();

async function main() {
  try {
    // Validate environment variables
    const privateKey = process.env.PRIVATE_KEY;
    const gaugeAddress = process.env.GAUGE_ADDRESS;

    if (!privateKey) {
      console.error('❌ PRIVATE_KEY environment variable is required');
      console.log('💡 Please create a .env file with your private key');
      process.exit(1);
    }

    console.log('🚀 DeFi Agent - Status Check');
    console.log('============================');
    console.log(`🔗 Network: Base Mainnet`);
    console.log(`🏊 Pool: WETH-VIRTUAL`);
    
    // Initialize the agent
    console.log('\n🔍 Initializing agent...');
    const agent = new DefiAgent(privateKey, gaugeAddress);
    
    const initialized = await agent.initialize();
    if (!initialized) {
      throw new Error('Failed to initialize DeFi Agent');
    }

    // Get agent status
    console.log('\n📊 Agent Status:');
    const status = agent.getAgentStatus();
    console.log(`Initialized: ${status.isInitialized ? '✅ Yes' : '❌ No'}`);
    console.log(`Pool Discovered: ${status.poolDiscovered ? '✅ Yes' : '❌ No'}`);
    console.log(`Total Operations: ${status.totalOperations}`);
    console.log(`Successful: ${status.successfulOperations}`);
    console.log(`Failed: ${status.failedOperations}`);

    // Get pool information
    console.log('\n🏊 Pool Information:');
    const poolInfo = agent.getPoolInfo();
    if (poolInfo) {
      console.log(`Pool Address: ${poolInfo.address}`);
      console.log(`Token 0: ${poolInfo.token0}`);
      console.log(`Token 1: ${poolInfo.token1}`);
      console.log(`Pool Type: ${poolInfo.stable ? 'Stable' : 'Volatile (Concentrated)'}`);
      console.log(`Gauge Address: ${poolInfo.gaugeAddress}`);
      if (poolInfo.reserves) {
        console.log(`\nReserves:`);
        console.log(`  Reserve 0: ${poolInfo.reserves.reserve0}`);
        console.log(`  Reserve 1: ${poolInfo.reserves.reserve1}`);
        console.log(`  Total Supply: ${poolInfo.reserves.totalSupply}`);
      }
    } else {
      console.log('❌ No pool information available');
    }

    // Get account summary
    console.log('\n📊 Account Summary:');
    await agent.getAccountSummary();

    // Get error recovery statistics
    console.log('\n🔄 Error Recovery Statistics:');
    console.log(`Total Errors: ${status.recoveryStats.totalErrors}`);
    console.log(`Recovered Errors: ${status.recoveryStats.recoveredErrors}`);
    console.log(`Manual Interventions: ${status.recoveryStats.manualInterventions}`);

    console.log('\n✅ Status check completed successfully!');

  } catch (error) {
    console.error('\n💥 Fatal error during status check:', error);
    process.exit(1);
  }
}

// Run the status check
if (require.main === module) {
  main().catch(console.error);
}

