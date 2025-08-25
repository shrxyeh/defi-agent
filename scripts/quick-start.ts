#!/usr/bin/env ts-node

import dotenv from 'dotenv';
import { DefiAgent } from '../src/services/DefiAgent';

dotenv.config();

async function quickStart() {
  try {
    console.log('🚀 DeFi Agent Quick Start Demo');
    console.log('===============================');
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.error('❌ PRIVATE_KEY environment variable is required');
      console.log('💡 Please create a .env file with your private key');
      process.exit(1);
    }

    // Initialize agent
    console.log('\n🔍 Initializing DeFi Agent...');
    const agent = new DefiAgent(privateKey);
    
    const initialized = await agent.initialize();
    if (!initialized) {
      throw new Error('Failed to initialize DeFi Agent');
    }

    // Show initial status
    console.log('\n📊 Initial Status:');
    const status = agent.getAgentStatus();
    console.log(`✅ Initialized: ${status.isInitialized}`);
    console.log(`🏊 Pool Discovered: ${status.poolDiscovered}`);

    // Show pool info
    const poolInfo = agent.getPoolInfo();
    if (poolInfo) {
      console.log(`\n🏊 Pool Information:`);
      console.log(`Address: ${poolInfo.address}`);
      console.log(`Type: ${poolInfo.stable ? 'Stable' : 'Volatile'}`);
      console.log(`Gauge: ${poolInfo.gaugeAddress}`);
    }

    // Show account summary
    console.log('\n💰 Account Summary:');
    await agent.getAccountSummary();

    console.log('\n🎉 Quick start completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   npm run deposit <amount>  - Execute deposit flow');
    console.log('   npm run withdraw <percentage> - Execute withdraw flow');
    console.log('   npm run status            - Check current status');
    console.log('   npm run cli               - Interactive CLI');

  } catch (error) {
    console.error('💥 Quick start failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  quickStart().catch(console.error);
}

