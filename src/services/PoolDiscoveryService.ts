import { ethers } from 'ethers';
import { WalletService } from './WalletService';
import { AERODROME_ADDRESSES, TOKENS } from '../config/constants';
import { FACTORY_ABI, VOTER_ABI, POOL_ABI } from '../config/abis';

export interface PoolInfo {
  address: string;
  token0: string;
  token1: string;
  stable: boolean;
  gaugeAddress: string;
  reserves: {
    reserve0: string;
    reserve1: string;
    totalSupply: string;
  };
}

export class PoolDiscoveryService {
  private walletService: WalletService;
  private factoryContract: ethers.Contract;
  private voterContract: ethers.Contract;

  constructor(walletService: WalletService) {
    this.walletService = walletService;
    this.factoryContract = new ethers.Contract(
      AERODROME_ADDRESSES.FACTORY,
      FACTORY_ABI,
      walletService.getProvider()
    );
    this.voterContract = new ethers.Contract(
      AERODROME_ADDRESSES.VOTER,
      VOTER_ABI,
      walletService.getProvider()
    );
  }

  /**
   * Discover the WETH-VIRTUAL pool and its associated gauge
   */
  async discoverWETHVIRTUALPool(): Promise<PoolInfo> {
    try {
      console.log('🔍 Discovering WETH-VIRTUAL pool...');

      // Try to find the pool (both stable and volatile)
      let poolAddress: string = '';
      let isStable = false;

      // First try volatile pool (concentrated liquidity)
      try {
        poolAddress = await this.factoryContract.getPool!(TOKENS.WETH, TOKENS.VIRTUAL, false);
        if (poolAddress !== ethers.ZeroAddress) {
          isStable = false;
          console.log('✅ Found volatile WETH-VIRTUAL pool');
        }
      } catch (error) {
        console.log('❌ Volatile pool not found, trying stable pool...');
      }

      // If volatile not found, try stable pool
      if (!poolAddress || poolAddress === ethers.ZeroAddress) {
        try {
          poolAddress = await this.factoryContract.getPool!(TOKENS.WETH, TOKENS.VIRTUAL, true);
          if (poolAddress !== ethers.ZeroAddress) {
            isStable = true;
            console.log('✅ Found stable WETH-VIRTUAL pool');
          }
        } catch (error) {
          console.log('❌ Stable pool not found');
        }
      }

      if (!poolAddress || poolAddress === ethers.ZeroAddress) {
        throw new Error('WETH-VIRTUAL pool not found on Aerodrome');
      }

      // Get gauge address for the pool
      const gaugeAddress = await this.voterContract.gauges!(poolAddress);
      if (gaugeAddress === ethers.ZeroAddress) {
        throw new Error(`No gauge found for pool ${poolAddress}`);
      }

      console.log(`📍 Pool Address: ${poolAddress}`);
      console.log(`📍 Gauge Address: ${gaugeAddress}`);
      console.log(`📍 Pool Type: ${isStable ? 'Stable' : 'Volatile (Concentrated)'}`);

      // Get pool details
      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, this.walletService.getProvider());
      const [token0, token1, reserves, totalSupply] = await Promise.all([
        poolContract.token0!(),
        poolContract.token1!(),
        poolContract.getReserves!(),
        poolContract.totalSupply!()
      ]);

      const poolInfo: PoolInfo = {
        address: poolAddress,
        token0,
        token1,
        stable: isStable,
        gaugeAddress,
        reserves: {
          reserve0: ethers.formatEther(reserves[0]),
          reserve1: ethers.formatEther(reserves[1]),
          totalSupply: ethers.formatEther(totalSupply)
        }
      };

      console.log(`📊 Pool Reserves: ${poolInfo.reserves.reserve0} ${await this.getTokenSymbol(token0)} / ${poolInfo.reserves.reserve1} ${await this.getTokenSymbol(token1)}`);
      console.log(`📊 Total LP Supply: ${poolInfo.reserves.totalSupply}`);

      return poolInfo;

    } catch (error: any) {
      console.error('Failed to discover WETH-VIRTUAL pool:', error);
      throw new Error(`Pool discovery failed: ${error.message}`);
    }
  }

  /**
   * Get pool information by address
   */
  async getPoolInfo(poolAddress: string): Promise<PoolInfo> {
    try {
      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, this.walletService.getProvider());
      
      const [token0, token1, reserves, totalSupply] = await Promise.all([
        poolContract.token0!(),
        poolContract.token1!(),
        poolContract.getReserves!(),
        poolContract.totalSupply!()
      ]);

      // Determine if pool is stable or volatile
      const isStable = await this.isPoolStable(poolAddress);
      
      // Get gauge address
      const gaugeAddress = await this.voterContract.gauges!(poolAddress);

      return {
        address: poolAddress,
        token0,
        token1,
        stable: isStable,
        gaugeAddress,
        reserves: {
          reserve0: ethers.formatEther(reserves[0]),
          reserve1: ethers.formatEther(reserves[1]),
          totalSupply: ethers.formatEther(totalSupply)
        }
      };

    } catch (error: any) {
      throw new Error(`Failed to get pool info: ${error.message}`);
    }
  }

  /**
   * Check if a pool is stable or volatile
   */
  private async isPoolStable(poolAddress: string): Promise<boolean> {
    try {
      // This is a simplified check - in practice, you might need to check pool metadata
      // For now, we'll assume volatile pools are more common for WETH pairs
      return false;
    } catch (error) {
      console.warn('Could not determine pool stability, assuming volatile');
      return false;
    }
  }

  /**
   * Get token symbol for display purposes
   */
  private async getTokenSymbol(tokenAddress: string): Promise<string> {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ['function symbol() view returns (string)'], this.walletService.getProvider());
      return await tokenContract.symbol!();
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Validate that a pool exists and is active
   */
  async validatePool(poolAddress: string): Promise<boolean> {
    try {
      const code = await this.walletService.getProvider().getCode(poolAddress);
      if (code === '0x') {
        return false;
      }

      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, this.walletService.getProvider());
      const totalSupply = await poolContract.totalSupply!();
      
      return totalSupply > 0n;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all pools for a token pair
   */
  async getAllPoolsForPair(tokenA: string, tokenB: string): Promise<string[]> {
    try {
      const pools: string[] = [];
      
      // Check stable pool
      try {
        const stablePool = await this.factoryContract.getPool!(tokenA, tokenB, true);
        if (stablePool !== ethers.ZeroAddress) {
          pools.push(stablePool);
        }
      } catch (error) {
        // Stable pool doesn't exist
      }

      // Check volatile pool
      try {
        const volatilePool = await this.factoryContract.getPool!(tokenA, tokenB, false);
        if (volatilePool !== ethers.ZeroAddress) {
          pools.push(volatilePool);
        }
      } catch (error) {
        // Volatile pool doesn't exist
      }

      return pools;
    } catch (error: any) {
      throw new Error(`Failed to get pools for pair: ${error.message}`);
    }
  }
}
