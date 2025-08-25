import { DefiAgent } from '../src/services/DefiAgent';
import { PoolDiscoveryService } from '../src/services/PoolDiscoveryService';
import { WalletService } from '../src/services/WalletService';

async function deployTest() {
  console.log('🧪 Running Enhanced DeFi Agent Deployment Test...');
  
  // Use a test private key (this would be your actual key in production)
  const testPrivateKey = process.env.PRIVATE_KEY;
  
  if (!testPrivateKey) {
    console.error('❌ PRIVATE_KEY not set in environment');
    console.log('💡 Please create a .env file with your private key');
    console.log('💡 Example: cp .env.example .env && nano .env');
    return;
  }

  try {
    console.log('🚀 Creating DeFi Agent instance...');
    const agent = new DefiAgent(testPrivateKey);
    console.log('✅ Agent created successfully');
    
    // Test agent status before initialization
    console.log('\n📊 Initial Agent Status:');
    const initialStatus = agent.getAgentStatus();
    console.log(`  Initialized: ${initialStatus.isInitialized}`);
    console.log(`  Pool Discovered: ${initialStatus.poolDiscovered}`);
    console.log(`  Total Operations: ${initialStatus.totalOperations}`);
    
    // Test pool discovery service separately
    console.log('\n🔍 Testing Pool Discovery Service...');
    const walletService = new WalletService(testPrivateKey);
    const poolDiscoveryService = new PoolDiscoveryService(walletService);
    
    try {
      console.log('  Attempting to discover WETH-VIRTUAL pool...');
      const poolInfo = await poolDiscoveryService.discoverWETHVIRTUALPool();
      console.log('  ✅ Pool discovery successful!');
      console.log(`  Pool Address: ${poolInfo.address}`);
      console.log(`  Pool Type: ${poolInfo.stable ? 'Stable' : 'Volatile (Concentrated)'}`);
      console.log(`  Gauge Address: ${poolInfo.gaugeAddress}`);
      console.log(`  Reserves: ${poolInfo.reserves.reserve0} / ${poolInfo.reserves.reserve1}`);
    } catch (error: any) {
      console.log('  ⚠️ Pool discovery failed (expected in test environment):', error.message);
      console.log('  This is normal when testing without mainnet access');
    }
    
    // Test agent initialization
    console.log('\n🔧 Testing Agent Initialization...');
    try {
      const initialized = await agent.initialize();
      if (initialized) {
        console.log('✅ Agent initialization successful');
        
        // Test account summary
        console.log('\n📈 Testing Account Summary...');
        const summary = await agent.getAccountSummary();
        if (summary) {
          console.log('✅ Account summary retrieved successfully');
          console.log(`  Wallet Address: ${summary.wallet.address}`);
          console.log(`  ETH Balance: ${summary.wallet.balance}`);
          console.log(`  USDC Balance: ${summary.balances.usdc}`);
        } else {
          console.log('❌ Failed to get account summary');
        }
        
        // Test agent status after initialization
        console.log('\n📊 Updated Agent Status:');
        const updatedStatus = agent.getAgentStatus();
        console.log(`  Initialized: ${updatedStatus.isInitialized}`);
        console.log(`  Pool Discovered: ${updatedStatus.poolDiscovered}`);
        if (updatedStatus.poolInfo) {
          console.log(`  Pool Address: ${updatedStatus.poolInfo.address}`);
          console.log(`  Pool Type: ${updatedStatus.poolInfo.stable ? 'Stable' : 'Volatile'}`);
        }
        
      } else {
        console.log('❌ Agent initialization failed');
      }
    } catch (error: any) {
      console.log('⚠️ Agent initialization failed (expected in test environment):', error.message);
      console.log('This is normal when testing without mainnet access or sufficient funds');
    }
    
    // Test configuration validation
    console.log('\n🔧 Testing Configuration Validation...');
    try {
      const { BASE_CONTRACTS, NETWORK_CONFIG } = require('../src/contracts/ContractAddresses');
      const { GAS_LIMITS, DEFAULT_SLIPPAGE } = require('../src/config/constants');
      
      console.log('✅ Contract addresses loaded successfully');
      console.log(`  Router: ${BASE_CONTRACTS.ROUTER}`);
      console.log(`  Factory: ${BASE_CONTRACTS.FACTORY}`);
      console.log(`  Voter: ${BASE_CONTRACTS.VOTER}`);
      
      console.log('✅ Network configuration loaded successfully');
      console.log(`  Chain ID: ${NETWORK_CONFIG.BASE_MAINNET.chainId}`);
      console.log(`  RPC URL: ${NETWORK_CONFIG.BASE_MAINNET.rpcUrl}`);
      
      console.log('✅ Gas limits loaded successfully');
      console.log(`  Swap: ${GAS_LIMITS.SWAP}`);
      console.log(`  Add Liquidity: ${GAS_LIMITS.ADD_LIQUIDITY}`);
      console.log(`  Default Slippage: ${DEFAULT_SLIPPAGE}%`);
      
    } catch (error: any) {
      console.log('❌ Configuration validation failed:', error.message);
    }
    
    // Test type definitions
    console.log('\n📝 Testing Type Definitions...');
    try {
      const types = require('../src/types');
      console.log('✅ Type definitions loaded successfully');
      console.log('  Available types:', Object.keys(types).join(', '));
    } catch (error: any) {
      console.log('❌ Type definitions failed:', error.message);
    }
    
    console.log('\n🎉 Enhanced DeFi Agent Deployment Test Completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Ensure you have sufficient USDC and ETH in your wallet');
    console.log('2. Run the agent: npm start');
    console.log('3. Test deposit flow with small amounts first');
    console.log('4. Monitor transactions on BaseScan');
    
  } catch (error) {
    console.error('❌ Enhanced deployment test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file configuration');
    console.log('2. Verify you have sufficient funds');
    console.log('3. Check Base chain connectivity');
    console.log('4. Review error logs above');
  }
}

deployTest().catch(console.error);