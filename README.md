# DeFi Agent: Aerodrome WETH-VIRTUAL LP Automation

A complete TypeScript project for automated DeFi operations on the Aerodrome WETH-VIRTUAL pool on Base chain.

## Overview

This project implements an automated DeFi agent that handles liquidity provision operations on the Aerodrome protocol. The agent manages the complete lifecycle of liquidity positions, from initial deposit to withdrawal, with comprehensive error handling and gas optimization.

## Core Functionality

### Deposit Flow
1. **USDC Input**: Accepts USDC from user wallet
2. **Token Conversion**: Splits USDC into WETH and VIRTUAL tokens
3. **Liquidity Addition**: Adds tokens to the WETH-VIRTUAL pool
4. **LP Token Staking**: Stakes LP tokens in the Aerodrome gauge
5. **Receipt Generation**: Provides detailed position receipt

### Withdrawal Flow
1. **LP Token Unstaking**: Unstakes LP tokens from gauge
2. **Liquidity Removal**: Removes liquidity from pool
3. **Token Conversion**: Swaps WETH and VIRTUAL back to USDC
4. **Fund Return**: Returns USDC to user wallet
5. **Transaction Receipt**: Provides withdrawal confirmation

## Technical Features

- **Gas Optimization**: Multicall support and dynamic gas estimation
- **Slippage Protection**: Configurable tolerance with sensible defaults
- **Error Recovery**: Automatic retry mechanisms and manual intervention
- **Pool Discovery**: Dynamic pool and gauge address resolution
- **Transaction Monitoring**: Complete transaction lifecycle tracking
- **Balance Validation**: Pre-operation balance and allowance checks

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- Access to Base chain RPC endpoint
- Funded wallet with USDC and ETH for gas

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd defi-agent-aerodrome

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

### Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure your environment variables:
```env
# Required: Your private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Optional: Custom Base RPC URL
BASE_RPC_URL=https://mainnet.

```

### Contract Addresses

The project includes pre-configured addresses for:
- Base chain network configuration
- Aerodrome protocol contracts (Router, Factory, Voter)
- Token addresses (USDC, WETH, VIRTUAL, AERO)
- Pool and gauge discovery endpoints

## Usage

### Command Line Scripts

#### Check Agent Status
```bash
npm run status
```
Displays current agent status, pool information, and account balances.

#### Execute Deposit Flow
```bash
# Deposit 100 USDC
npm run deposit 100

# Deposit 500 USDC
npm run deposit 500
```
Executes the complete deposit flow for the specified USDC amount.

#### Execute Withdrawal Flow
```bash
# Withdraw 50% of position
npm run withdraw 50

# Withdraw 100% of position
npm run withdraw 100
```
Executes the complete withdrawal flow for the specified percentage.

#### Interactive CLI
```bash
npm run cli
```
Launches an interactive command-line interface for all operations.

#### Quick Start Demo
```bash
npm run quick-start
```
Runs a demonstration of basic agent functionality.

#### Setup Verification
```bash
npm run verify-setup
```
Verifies that all configuration is correct and ready for use.

### Programmatic Usage

```typescript
import { DefiAgent } from './src/services/DefiAgent';

// Initialize agent
const agent = new DefiAgent(privateKey);
await agent.initialize();

// Execute deposit flow
const depositResult = await agent.executeDepositFlow({
  amount: '100',
  slippageTolerance: 0.5,
  enableMulticall: true,
  gasOptimization: true
});

// Execute withdrawal flow
const withdrawResult = await agent.executeWithdrawFlow({
  percentage: 50,
  slippageTolerance: 0.5,
  enableMulticall: true,
  gasOptimization: true
});
```

## Architecture

### Core Services

- **WalletService**: Manages wallet operations, token balances, and approvals
- **SwapService**: Handles token swaps via Aerodrome router
- **LiquidityService**: Manages liquidity addition and removal operations
- **StakingService**: Handles LP token staking and unstaking
- **PoolDiscoveryService**: Discovers pools and gauges dynamically
- **MulticallService**: Optimizes multiple transactions with batch operations
- **ErrorRecoveryService**: Manages error handling and recovery mechanisms

### Key Components

- **Pool Discovery**: Automatically locates WETH-VIRTUAL pool and associated gauge
- **Gas Optimization**: Implements multicall for batch operations and gas estimation
- **Slippage Protection**: Configurable tolerance limits with safety defaults
- **Error Recovery**: Automatic retry with exponential backoff and manual intervention
- **Transaction Monitoring**: Complete transaction lifecycle tracking and validation

## Security Features

- **Slippage Protection**: Configurable tolerance limits to prevent unfavorable trades
- **Gas Estimation**: Dynamic gas limit calculation with safety buffers
- **Error Recovery**: Comprehensive failure handling and automatic retry
- **Transaction Validation**: Full transaction receipt verification
- **Balance Checks**: Pre-operation balance and allowance validation
- **Refund Protection**: Automatic USDC refund on operation failure

## Testing

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

The test suite covers:
- Service initialization and configuration
- Contract address validation
- Type definition verification
- Gas limit and slippage configuration
- Basic agent functionality

## Project Structure

```
src/
├── config/          # Configuration constants and settings
├── contracts/       # Contract ABIs and address definitions
├── services/        # Core business logic services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions and helpers
└── index.ts         # Main application entry point

scripts/
├── cli.ts          # Interactive command-line interface
├── deposit.ts      # Automated deposit flow execution
├── withdraw.ts     # Automated withdrawal flow execution
├── status.ts       # Status and balance checking
├── quick-start.ts  # Basic functionality demonstration
└── verify-setup.ts # Configuration verification

test/               # Comprehensive test suite
dist/               # Compiled JavaScript output
```

## Error Handling

The agent implements comprehensive error handling:

- **Automatic Retry**: Failed transactions are retried with exponential backoff
- **Error Recovery**: Automatic recovery for common failure scenarios
- **Manual Intervention**: Support for manual error resolution when needed
- **Refund Protection**: USDC is automatically refunded on any step failure
- **Transaction Rollback**: Failed operations are safely rolled back

## Performance Optimization

- **Multicall Support**: Batch multiple operations for gas efficiency
- **Gas Optimization**: Dynamic gas estimation and limit calculation
- **Parallel Processing**: Concurrent operations where possible
- **Caching**: Pool and token information caching for efficiency

## Troubleshooting

### Common Issues

1. **Insufficient Balance**
   - Ensure agent wallet has sufficient USDC and ETH for gas
   - Check token allowances for router contracts

2. **RPC Connectivity**
   - Verify Base RPC endpoint accessibility
   - Check network configuration and chain ID

3. **Gas Issues**
   - Verify gas price and limit settings
   - Check for network congestion

4. **Pool Discovery**
   - Ensure WETH-VIRTUAL pool exists on Aerodrome
   - Verify token addresses are correct


## Example Transaction Flows


## Contributing

1. Fork the repository
2. Create a feature branch for your changes
3. Implement your modifications with appropriate tests
4. Ensure all tests pass and code builds successfully
5. Submit a pull request with detailed description

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Disclaimer

This software is provided for educational and experimental purposes. Use at your own risk. Always test with small amounts first and ensure you understand the risks associated with DeFi operations. The authors are not responsible for any financial losses incurred through the use of this software.

## Support

For technical support and questions:

1. Review the troubleshooting section above
2. Check the test files for usage examples
3. Open an issue on the project repository
4. Consult Base chain and Aerodrome protocol documentation

## Getting Started

1. **Install Dependencies**: `npm install`
2. **Configure Environment**: Set up your `.env` file with required variables
3. **Verify Setup**: Run `npm run verify-setup` to confirm configuration
4. **Test Functionality**: Execute `npm run quick-start` for basic verification
5. **Begin Operations**: Use deposit and withdrawal scripts as needed

---

**The project is ready for end-to-end execution with a funded agent wallet and Base RPC URL.**
