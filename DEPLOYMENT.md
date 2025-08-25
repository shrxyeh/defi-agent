# DeFi Agent Deployment Guide

This guide provides step-by-step instructions for deploying and running the DeFi Agent for Aerodrome WETH-VIRTUAL LP automation on Base chain.

## 🚀 Prerequisites

### System Requirements
- **Operating System**: Linux (Ubuntu 18.04+), macOS, or Windows with WSL2
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 6.0.0 or higher
- **Git**: Latest version
- **Memory**: Minimum 4GB RAM
- **Storage**: Minimum 2GB free space

### Base Chain Requirements
- **Base Chain**: Mainnet (Chain ID: 8453)
- **RPC Endpoint**: Access to Base mainnet RPC
- **Block Explorer**: BaseScan (https://basescan.org)

### Wallet Requirements
- **Private Key**: Valid Ethereum private key
- **Base Chain**: Wallet must be on Base chain
- **Funds**: Sufficient ETH for gas fees and USDC for LP operations
- **Recommended**: Dedicated wallet for DeFi operations

## 📋 Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/defi-agent-aerodrome.git
cd defi-agent-aerodrome
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

**Required Environment Variables:**
```env
# Your wallet private key (keep secure!)
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Optional: Specific gauge address (will be auto-discovered if not provided)
GAUGE_ADDRESS=0x...

# Optional: Custom Base chain RPC URL
BASE_RPC_URL=https://mainnet.base.org
```

### 4. Build the Project
```bash
npm run build
```

## 🔧 Configuration

### Network Configuration
The agent is pre-configured for Base mainnet:
- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Block Explorer**: https://basescan.org

### Contract Addresses
All Aerodrome contract addresses are pre-configured:
- **Router**: `0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43`
- **Factory**: `0x420DD381b31aEf6683db6B902084cB0FFECe40Da`
- **Voter**: `0x16613524e02ad97eDfeF371bC883F2F5d6C480A5`
- **Gauge Factory**: `0x35968D8d2B80F7fe4476B3D5dC5C72D86b4a9F7c`

### Token Addresses
- **USDC**: `0x833589fcd6edb6e08f4c7c32d4f71b54bda02913`
- **WETH**: `0x4200000000000000000000000000000000000006`
- **VIRTUAL**: `0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b`
- **AERO**: `0x940181a94A35A4569E4529A3CDfB74e38FD98631`

## 🚀 Running the Agent

### Method 1: Direct Execution
```bash
# Run the main agent
npm start

# Or run in development mode
npm run dev
```

### Method 2: Interactive CLI
```bash
# Start interactive CLI
npm run cli
```

### Method 3: Example Script
```bash
# Run basic usage example
npx ts-node examples/basic-usage.ts
```

## 📊 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Deployment
```bash
# Test agent initialization and basic operations
npm run test:deploy
```

### Type Checking
```bash
# Check TypeScript types
npm run type-check
```

## 🔍 Monitoring and Debugging

### Log Levels
The agent provides comprehensive logging:
- **Info**: General operation information
- **Warning**: Non-critical issues
- **Error**: Critical errors and recovery attempts
- **Debug**: Detailed operation tracing

### Transaction Monitoring
- **BaseScan**: Monitor all transactions on BaseScan
- **Transaction Hashes**: All operations return transaction hashes
- **Gas Usage**: Track gas consumption for optimization

### Error Recovery
The agent automatically attempts error recovery:
1. **Automatic Refund**: Returns excess USDC on failures
2. **Token Recovery**: Swaps stuck tokens back to USDC
3. **Manual Intervention**: Provides detailed error reports

## 🛡️ Security Considerations

### Private Key Management
- **Environment Variables**: Store private keys in .env files
- **Access Control**: Restrict access to deployment environment
- **Dedicated Wallet**: Use separate wallet for DeFi operations
- **Regular Rotation**: Consider rotating private keys periodically

### Network Security
- **RPC Security**: Use secure RPC endpoints
- **Firewall**: Restrict network access to necessary endpoints
- **Monitoring**: Monitor for suspicious activity

### Smart Contract Security
- **Address Verification**: Verify all contract addresses
- **ABI Validation**: Ensure ABIs match deployed contracts
- **Slippage Protection**: Use appropriate slippage tolerance

## 📈 Performance Optimization

### Gas Optimization
- **Multicall**: Enable for batch operations
- **Gas Estimation**: Use gas estimation with buffer
- **Transaction Batching**: Group related operations

### Slippage Management
- **Conservative**: 0.1-0.5% for stable conditions
- **Moderate**: 0.5-1.0% for normal conditions
- **Aggressive**: 1.0-2.0% for volatile conditions
- **Maximum**: 2.0-5.0% for emergency situations

### Pool Selection
- **Volatile Pools**: Preferred for concentrated liquidity
- **Stable Pools**: Fallback option if volatile not available
- **Liquidity Threshold**: Minimum liquidity requirements

## 🚨 Troubleshooting

### Common Issues

#### 1. Pool Discovery Failed
```bash
Error: WETH-VIRTUAL pool not found on Aerodrome
```
**Solutions:**
- Verify Base chain connectivity
- Check Aerodrome contract addresses
- Ensure sufficient RPC quota

#### 2. Insufficient Gas
```bash
Error: Out of gas
```
**Solutions:**
- Increase gas limits
- Enable gas optimization
- Check gas price settings

#### 3. Token Approval Failed
```bash
Error: ERC20: transfer amount exceeds allowance
```
**Solutions:**
- Clear existing approvals
- Check token balances
- Verify spender addresses

#### 4. Slippage Exceeded
```bash
Error: Slippage tolerance exceeded
```
**Solutions:**
- Increase slippage tolerance
- Retry during lower volatility
- Check pool liquidity

### Error Recovery
The agent provides automatic error recovery:
1. **Check Logs**: Review detailed error logs
2. **Monitor Transactions**: Check BaseScan for failed transactions
3. **Recovery Actions**: Follow automatic recovery prompts
4. **Manual Intervention**: Use manual recovery if needed

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Project built successfully
- [ ] Tests passing
- [ ] Network connectivity verified
- [ ] Wallet funded with ETH and USDC

### Deployment
- [ ] Agent initialized successfully
- [ ] Pool discovered and validated
- [ ] Services updated with pool information
- [ ] Account summary retrieved
- [ ] Initial balance verification

### Post-Deployment
- [ ] Test deposit flow with small amount
- [ ] Verify LP token creation
- [ ] Confirm staking operation
- [ ] Monitor transaction success
- [ ] Validate position tracking

## 🔄 Maintenance

### Regular Tasks
- **Balance Monitoring**: Check wallet balances regularly
- **Gas Price Monitoring**: Monitor gas prices for optimal timing
- **Pool Health**: Verify pool liquidity and health
- **Reward Claims**: Claim staking rewards periodically

### Updates
- **Dependencies**: Keep npm packages updated
- **Contract Addresses**: Verify contract addresses haven't changed
- **Configuration**: Review and update configuration as needed

### Backup
- **Environment Files**: Backup .env configuration
- **Private Keys**: Secure backup of private keys
- **Transaction History**: Export transaction history regularly

## 📞 Support

### Documentation
- **README.md**: Comprehensive project overview
- **Code Comments**: Inline documentation
- **Type Definitions**: TypeScript interface documentation

### Community
- **GitHub Issues**: Report bugs and feature requests
- **Discord**: Join community for support
- **Documentation**: Check this guide and inline comments

### Emergency
If you encounter critical issues:
1. **Stop the agent immediately**
2. **Check transaction status on BaseScan**
3. **Review error logs and recovery reports**
4. **Contact support with detailed information**

---

**Happy DeFi Automation! 🚀**
