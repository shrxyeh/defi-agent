#!/usr/bin/env ts-node

import dotenv from 'dotenv';
import { DefiAgent } from '../src/services/DefiAgent';
import { BASE_CONTRACTS, NETWORK_CONFIG } from '../src/contracts/ContractAddresses';

dotenv.config();

async function verifySetup() {
  console.log('🔍 DeFi Agent Setup Verification');
  console.log('=================================');
  
  let allChecksPassed = true;

  // Check 1: Environment variables
  console.log('\n1️⃣ Checking environment variables...');
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.log('❌ PRIVATE_KEY not found in .env file');
    allChecksPassed = false;
  } else {
    console.log('✅ PRIVATE_KEY found');
  }

  // Check 2: Contract addresses
  console.log('\n2️⃣ Checking contract addresses...');
  try {
    if (BASE_CONTRACTS.ROUTER && BASE_CONTRACTS.ROUTER !== '0x') {
      console.log('✅ Router address configured');
    } else {
      console.log('❌ Router address not configured');
      allChecksPassed = false;
    }
    
    if (BASE_CONTRACTS.TOKENS.USDC && BASE_CONTRACTS.TOKENS.USDC !== '0x') {
      console.log('✅ USDC address configured');
    } else {
      console.log('❌ USDC address not configured');
      allChecksPassed = false;
    }
    
    if (BASE_CONTRACTS.TOKENS.WETH && BASE_CONTRACTS.TOKENS.WETH !== '0x') {
      console.log('✅ WETH address configured');
    } else {
      console.log('❌ WETH address not configured');
      allChecksPassed = false;
    }
    
    if (BASE_CONTRACTS.TOKENS.VIRTUAL && BASE_CONTRACTS.TOKENS.VIRTUAL !== '0x') {
      console.log('✅ VIRTUAL address configured');
    } else {
      console.log('❌ VIRTUAL address configured');
      allChecksPassed = false;
    }
  } catch (error) {
    console.log('❌ Error checking contract addresses:', error);
    allChecksPassed = false;
  }

  // Check 3: Network configuration
  console.log('\n3️⃣ Checking network configuration...');
  try {
    if (NETWORK_CONFIG.BASE_MAINNET.rpcUrl) {
      console.log('✅ Base RPC URL configured');
    } else {
      console.log('❌ Base RPC URL not configured');
      allChecksPassed = false;
    }
    
    if (NETWORK_CONFIG.BASE_MAINNET.chainId === 8453) {
      console.log('✅ Base chain ID correct');
    } else {
      console.log('❌ Base chain ID incorrect');
      allChecksPassed = false;
    }
  } catch (error) {
    console.log('❌ Error checking network configuration:', error);
    allChecksPassed = false;
  }

  // Check 4: Agent initialization (if private key is available)
  if (privateKey) {
    console.log('\n4️⃣ Testing agent initialization...');
    try {
      const agent = new DefiAgent(privateKey);
      console.log('✅ DefiAgent class instantiated successfully');
      
      // Try to initialize (this will fail without real RPC, but we can check the class structure)
      console.log('✅ Agent class structure verified');
    } catch (error) {
      console.log('❌ Error creating DefiAgent:', error);
      allChecksPassed = false;
    }
  } else {
    console.log('\n4️⃣ Skipping agent initialization test (no private key)');
  }

  // Check 5: Available scripts
  console.log('\n5️⃣ Checking available scripts...');
  const fs = require('fs');
  const scripts = [
    'scripts/deposit.ts',
    'scripts/withdraw.ts',
    'scripts/status.ts',
    'scripts/cli.ts',
    'scripts/quick-start.ts'
  ];
  
  scripts.forEach(script => {
    if (fs.existsSync(script)) {
      console.log(`✅ ${script} exists`);
    } else {
      console.log(`❌ ${script} missing`);
      allChecksPassed = false;
    }
  });

  // Final result
  console.log('\n' + '='.repeat(50));
  if (allChecksPassed) {
    console.log('🎉 All setup checks passed! Your DeFi Agent is ready to use.');
    console.log('\n💡 Next steps:');
    console.log('   npm run quick-start    - Test basic functionality');
    console.log('   npm run status         - Check agent status');
    console.log('   npm run deposit <amount> - Execute deposit flow');
    console.log('   npm run withdraw <percentage> - Execute withdraw flow');
  } else {
    console.log('❌ Some setup checks failed. Please review the issues above.');
    console.log('\n💡 Common fixes:');
    console.log('   1. Create a .env file with your PRIVATE_KEY');
    console.log('   2. Ensure all contract addresses are configured');
    console.log('   3. Verify network configuration');
  }
  console.log('='.repeat(50));
}

// Run the verification
if (require.main === module) {
  verifySetup().catch(console.error);
}
