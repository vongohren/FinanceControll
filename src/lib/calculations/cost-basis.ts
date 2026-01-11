import type { Transaction } from '@/lib/db/schema';

interface QuantitySummary {
  currentQuantity: string; // Decimal as string
  totalBuys: string;
  totalSells: string;
}

/**
 * Calculate current quantity from transactions using FIFO
 * Returns decimal strings to maintain precision
 */
export function calculateCurrentQuantity(transactions: Transaction[]): QuantitySummary {
  let totalBuys = 0;
  let totalSells = 0;

  for (const tx of transactions) {
    const qty = Number(tx.quantity);
    if (tx.type === 'buy') {
      totalBuys += qty;
    } else {
      totalSells += qty;
    }
  }

  const current = totalBuys - totalSells;

  return {
    currentQuantity: current.toFixed(8),
    totalBuys: totalBuys.toFixed(8),
    totalSells: totalSells.toFixed(8),
  };
}

/**
 * Validate that a sell transaction doesn't exceed holdings
 */
export function canSellQuantity(
  currentQuantity: string | null,
  sellQuantity: number,
): { valid: boolean; message?: string } {
  if (!currentQuantity) {
    return {
      valid: false,
      message: 'No holdings to sell. Add buy transactions first.',
    };
  }

  const current = Number(currentQuantity);
  if (sellQuantity > current) {
    return {
      valid: false,
      message: `Cannot sell ${sellQuantity}. Current holdings: ${current}`,
    };
  }

  return { valid: true };
}
