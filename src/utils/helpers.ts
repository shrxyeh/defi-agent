import { ethers } from 'ethers';

export function formatBalance(balance: string, decimals: number = 18): string {
  return parseFloat(ethers.formatUnits(balance, decimals)).toFixed(6);
}

export function parseAmount(amount: string, decimals: number = 18): bigint {
  return ethers.parseUnits(amount, decimals);
}

export function calculateSlippage(amount: bigint, slippagePercent: number): bigint {
  const slippageFactor = BigInt(Math.floor((100 - slippagePercent) * 100));
  return (amount * slippageFactor) / 10000n;
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function validateAddress(address: string): boolean {
  return ethers.isAddress(address);
}

export function formatTransactionHash(hash: string): string {
  return `https://basescan.org/tx/${hash}`;
}