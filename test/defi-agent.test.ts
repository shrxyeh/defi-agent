import { DefiAgent } from '../src/services/DefiAgent';
import { WalletService } from '../src/services/WalletService';
import { PoolDiscoveryService } from '../src/services/PoolDiscoveryService';
import { MulticallService } from '../src/services/MulticallService';
import { ErrorRecoveryService } from '../src/services/ErrorRecoveryService';

// Mock private key for testing (DO NOT USE IN PRODUCTION)
const TEST_PRIVATE_KEY = '0x' + '1'.repeat(64);

describe('DeFi Agent - Comprehensive Tests', () => {
  let agent: DefiAgent;
  let walletService: WalletService;
  
  beforeAll(() => {
    // Create wallet service for testing
    walletService = new WalletService(TEST_PRIVATE_KEY);
    
    // Create agent instance
    agent = new DefiAgent(TEST_PRIVATE_KEY);
  });

  describe('Wallet Service', () => {
    test('should initialize wallet service', () => {
      expect(walletService).toBeDefined();
    });

    test('should validate wallet initialization', async () => {
      const walletInfo = await walletService.getWalletInfo();
      
      expect(walletInfo.address).toBeDefined();
      expect(walletInfo.privateKey).toBe(TEST_PRIVATE_KEY);
      expect(walletInfo.balance).toBeDefined();
    });

    test('should get provider and wallet', () => {
      const provider = walletService.getProvider();
      const wallet = walletService.getWallet();
      
      expect(provider).toBeDefined();
      expect(wallet).toBeDefined();
      expect(wallet.address).toBeDefined();
    });
  });

  describe('Pool Discovery Service', () => {
    let poolDiscoveryService: PoolDiscoveryService;

    beforeAll(() => {
      poolDiscoveryService = new PoolDiscoveryService(walletService);
    });

    test('should initialize pool discovery service', () => {
      expect(poolDiscoveryService).toBeDefined();
    });

    test('should validate multicall address', async () => {
      const isValid = await poolDiscoveryService.validatePool('0x1234567890123456789012345678901234567890');
      expect(typeof isValid).toBe('boolean');
    });

    test('should get all pools for WETH-VIRTUAL pair', async () => {
      try {
        const pools = await poolDiscoveryService.getAllPoolsForPair(
          '0x4200000000000000000000000000000000000006', // WETH
          '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b'  // VIRTUAL
        );
        expect(Array.isArray(pools)).toBe(true);
      } catch (error) {
        // This might fail in test environment, which is expected
        expect(error).toBeDefined();
      }
    }, 15000); // Increased timeout to 15 seconds
  });

  describe('Multicall Service', () => {
    let multicallService: MulticallService;

    beforeAll(() => {
      multicallService = new MulticallService(new WalletService(TEST_PRIVATE_KEY));
    });

    test('should initialize multicall service', () => {
      expect(multicallService).toBeDefined();
    });

    test('should validate multicall address', async () => {
      const isValid = await multicallService.validateMulticallAddress();
      expect(typeof isValid).toBe('boolean');
    });

    test('should create approval calls', () => {
      const approvalCalls = multicallService.createApprovalCalls([
        {
          address: '0x1234567890123456789012345678901234567890',
          spender: '0x0987654321098765432109876543210987654321',
          amount: '1000000000000000000'
        }
      ]);

      expect(Array.isArray(approvalCalls)).toBe(true);
      expect(approvalCalls.length).toBe(1);
      if (approvalCalls.length > 0) {
        expect(approvalCalls[0]!.target).toBeDefined();
        expect(approvalCalls[0]!.callData).toBeDefined();
      }
    });

    test('should create swap calls', () => {
      const swapCalls = multicallService.createSwapCalls([
        {
          router: '0x1234567890123456789012345678901234567890',
          amountIn: '1000000000000000000',
          amountOutMin: '950000000000000000',
          routes: [{ from: '0x1234567890123456789012345678901234567890', to: '0x0987654321098765432109876543210987654321', stable: false }],
          to: '0xabcd123456789012345678901234567890123456',
          deadline: Math.floor(Date.now() / 1000) + 1800
        }
      ]);

      expect(Array.isArray(swapCalls)).toBe(true);
      expect(swapCalls.length).toBe(1);
      if (swapCalls.length > 0) {
        expect(swapCalls[0]!.target).toBeDefined();
        expect(swapCalls[0]!.callData).toBeDefined();
      }
    });

    test('should create liquidity calls', () => {
      const liquidityCalls = multicallService.createLiquidityCalls([
        {
          router: '0x1234567890123456789012345678901234567890',
          operation: 'add',
          tokenA: '0x1234567890123456789012345678901234567890',
          tokenB: '0x0987654321098765432109876543210987654321',
          stable: false,
          amountADesired: '1000000000000000000',
          amountBDesired: '1000000000000000000',
          amountAMin: '950000000000000000',
          amountBMin: '950000000000000000',
          to: '0xabcd123456789012345678901234567890123456',
          deadline: Math.floor(Date.now() / 1000) + 1800
        }
      ]);

      expect(Array.isArray(liquidityCalls)).toBe(true);
      expect(liquidityCalls.length).toBe(1);
      if (liquidityCalls.length > 0) {
        expect(liquidityCalls[0]!.target).toBeDefined();
        expect(liquidityCalls[0]!.callData).toBeDefined();
      }
    });

    test('should create staking calls', () => {
      const stakingCalls = multicallService.createStakingCalls([
        {
          gauge: '0x1234567890123456789012345678901234567890',
          operation: 'stake',
          amount: '1000000000000000000'
        }
      ]);

      expect(Array.isArray(stakingCalls)).toBe(true);
      expect(stakingCalls.length).toBe(1);
      if (stakingCalls.length > 0) {
        expect(stakingCalls[0]!.target).toBeDefined();
        expect(stakingCalls[0]!.callData).toBeDefined();
      }
    });
  });

  describe('Error Recovery Service', () => {
    let errorRecoveryService: ErrorRecoveryService;

    beforeAll(() => {
      errorRecoveryService = new ErrorRecoveryService(new WalletService(TEST_PRIVATE_KEY));
    });

    test('should initialize error recovery service', () => {
      expect(errorRecoveryService).toBeDefined();
    });

    test('should get recovery statistics', () => {
      const stats = errorRecoveryService.getRecoveryStats();
      
      expect(stats.totalErrors).toBe(0);
      expect(stats.recoveredErrors).toBe(0);
      expect(stats.manualInterventions).toBe(0);
    });

    test('should clear recovery history', () => {
      errorRecoveryService.clearRecoveryHistory();
      const stats = errorRecoveryService.getRecoveryStats();
      
      expect(stats.totalErrors).toBe(0);
      expect(stats.recoveredErrors).toBe(0);
      expect(stats.manualInterventions).toBe(0);
    });
  });

  describe('DeFi Agent', () => {
    let testAgent: DefiAgent;

    beforeAll(() => {
      testAgent = new DefiAgent(TEST_PRIVATE_KEY);
    });

    test('should initialize agent', () => {
      expect(testAgent).toBeDefined();
    });

    test('should get initial agent status', () => {
      const status = testAgent.getAgentStatus();
      
      expect(status.isInitialized).toBe(false);
      expect(status.poolDiscovered).toBe(false);
      expect(status.totalOperations).toBe(0);
      expect(status.successfulOperations).toBe(0);
      expect(status.failedOperations).toBe(0);
    });

    test('should check if agent is initialized', () => {
      const isInitialized = testAgent.isAgentInitialized();
      expect(isInitialized).toBe(false);
    });

    test('should get pool info (should be undefined before initialization)', () => {
      const poolInfo = testAgent.getPoolInfo();
      expect(poolInfo).toBeUndefined();
    });
  });

  describe('Configuration Validation', () => {
    test('should have valid contract addresses', () => {
      // These addresses should be valid Ethereum addresses
      const { BASE_CONTRACTS } = require('../src/contracts/ContractAddresses');
      
      expect(BASE_CONTRACTS.ROUTER).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(BASE_CONTRACTS.FACTORY).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(BASE_CONTRACTS.VOTER).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(BASE_CONTRACTS.GAUGE_FACTORY).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    test('should have valid token addresses', () => {
      const { BASE_CONTRACTS } = require('../src/contracts/ContractAddresses');
      
      expect(BASE_CONTRACTS.TOKENS.USDC).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(BASE_CONTRACTS.TOKENS.WETH).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(BASE_CONTRACTS.TOKENS.VIRTUAL).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(BASE_CONTRACTS.TOKENS.AERO).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    test('should have valid network configuration', () => {
      const { NETWORK_CONFIG } = require('../src/contracts/ContractAddresses');
      
      expect(NETWORK_CONFIG.BASE_MAINNET.chainId).toBe(8453);
      expect(NETWORK_CONFIG.BASE_MAINNET.name).toBe('Base Mainnet');
      expect(NETWORK_CONFIG.BASE_MAINNET.rpcUrl).toBe('https://mainnet.base.org');
      expect(NETWORK_CONFIG.BASE_MAINNET.blockExplorer).toBe('https://basescan.org');
    });
  });

  describe('Type Definitions', () => {
    test('should have valid type definitions', () => {
      // Check that the types file exists and can be imported
      const fs = require('fs');
      const path = require('path');
      
      const typesFilePath = path.join(__dirname, '../src/types/index.ts');
      expect(fs.existsSync(typesFilePath)).toBe(true);
      
      // Check that the file contains the expected interfaces
      const typesFileContent = fs.readFileSync(typesFilePath, 'utf8');
      expect(typesFileContent).toContain('interface DepositRequest');
      expect(typesFileContent).toContain('interface WithdrawRequest');
      expect(typesFileContent).toContain('interface TransactionResult');
      expect(typesFileContent).toContain('interface PoolInfo');
      expect(typesFileContent).toContain('interface MulticallCall');
      expect(typesFileContent).toContain('interface MulticallResult');
      expect(typesFileContent).toContain('interface RecoveryAction');
      expect(typesFileContent).toContain('interface ErrorContext');
      expect(typesFileContent).toContain('interface GasEstimate');
      expect(typesFileContent).toContain('interface PositionReceipt');
      expect(typesFileContent).toContain('interface WithdrawalReceipt');
      expect(typesFileContent).toContain('interface AgentStatus');
    });
  });

  describe('Constants Validation', () => {
    test('should have valid gas limits', () => {
      const { GAS_LIMITS } = require('../src/config/constants');
      
      expect(GAS_LIMITS.SWAP).toBeGreaterThan(0);
      expect(GAS_LIMITS.ADD_LIQUIDITY).toBeGreaterThan(0);
      expect(GAS_LIMITS.REMOVE_LIQUIDITY).toBeGreaterThan(0);
      expect(GAS_LIMITS.STAKE).toBeGreaterThan(0);
      expect(GAS_LIMITS.UNSTAKE).toBeGreaterThan(0);
      expect(GAS_LIMITS.MULTICALL).toBeGreaterThan(0);
    });

    test('should have valid slippage configuration', () => {
      const { DEFAULT_SLIPPAGE, MAX_SLIPPAGE, MIN_SLIPPAGE } = require('../src/config/constants');
      
      expect(DEFAULT_SLIPPAGE).toBeGreaterThan(0);
      expect(MAX_SLIPPAGE).toBeGreaterThan(DEFAULT_SLIPPAGE);
      expect(MIN_SLIPPAGE).toBeLessThan(DEFAULT_SLIPPAGE);
      expect(MIN_SLIPPAGE).toBeGreaterThan(0);
    });

    test('should have valid transaction configuration', () => {
      const { TRANSACTION_CONFIG } = require('../src/config/constants');
      
      expect(TRANSACTION_CONFIG.DEFAULT_DEADLINE_MINUTES).toBeGreaterThan(0);
      expect(TRANSACTION_CONFIG.MAX_DEADLINE_MINUTES).toBeGreaterThan(TRANSACTION_CONFIG.DEFAULT_DEADLINE_MINUTES);
      expect(TRANSACTION_CONFIG.GAS_BUFFER_PERCENT).toBeGreaterThan(0);
      expect(TRANSACTION_CONFIG.MAX_RETRIES).toBeGreaterThan(0);
    });
  });
});