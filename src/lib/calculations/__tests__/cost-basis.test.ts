import { describe, expect, it } from 'vitest';
import type { Transaction } from '@/lib/db/schema';
import { calculateCurrentQuantity, canSellQuantity } from '../cost-basis';

describe('FIFO Cost Basis Calculations', () => {
  describe('calculateCurrentQuantity', () => {
    it('calculates current quantity from buy transactions only', () => {
      const transactions: Partial<Transaction>[] = [
        { type: 'buy', quantity: '100.00000000' },
        { type: 'buy', quantity: '50.00000000' },
      ];

      const result = calculateCurrentQuantity(transactions as Transaction[]);

      expect(result.currentQuantity).toBe('150.00000000');
      expect(result.totalBuys).toBe('150.00000000');
      expect(result.totalSells).toBe('0.00000000');
    });

    it('calculates current quantity from buy and sell transactions', () => {
      const transactions: Partial<Transaction>[] = [
        { type: 'buy', quantity: '100.00000000' },
        { type: 'buy', quantity: '50.00000000' },
        { type: 'sell', quantity: '30.00000000' },
      ];

      const result = calculateCurrentQuantity(transactions as Transaction[]);

      expect(result.currentQuantity).toBe('120.00000000');
      expect(result.totalBuys).toBe('150.00000000');
      expect(result.totalSells).toBe('30.00000000');
    });

    it('handles multiple sell transactions', () => {
      const transactions: Partial<Transaction>[] = [
        { type: 'buy', quantity: '200.00000000' },
        { type: 'sell', quantity: '50.00000000' },
        { type: 'sell', quantity: '30.00000000' },
      ];

      const result = calculateCurrentQuantity(transactions as Transaction[]);

      expect(result.currentQuantity).toBe('120.00000000');
      expect(result.totalBuys).toBe('200.00000000');
      expect(result.totalSells).toBe('80.00000000');
    });

    it('handles selling all holdings', () => {
      const transactions: Partial<Transaction>[] = [
        { type: 'buy', quantity: '100.00000000' },
        { type: 'sell', quantity: '100.00000000' },
      ];

      const result = calculateCurrentQuantity(transactions as Transaction[]);

      expect(result.currentQuantity).toBe('0.00000000');
      expect(result.totalBuys).toBe('100.00000000');
      expect(result.totalSells).toBe('100.00000000');
    });

    it('handles empty transaction list', () => {
      const result = calculateCurrentQuantity([]);

      expect(result.currentQuantity).toBe('0.00000000');
      expect(result.totalBuys).toBe('0.00000000');
      expect(result.totalSells).toBe('0.00000000');
    });

    it('maintains precision with decimal quantities', () => {
      const transactions: Partial<Transaction>[] = [
        { type: 'buy', quantity: '0.12345678' },
        { type: 'buy', quantity: '0.87654321' },
        { type: 'sell', quantity: '0.50000000' },
      ];

      const result = calculateCurrentQuantity(transactions as Transaction[]);

      expect(result.currentQuantity).toBe('0.49999999');
    });
  });

  describe('canSellQuantity', () => {
    it('allows sell when quantity is within holdings', () => {
      const result = canSellQuantity('100.00000000', 50);

      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('allows sell of exact holdings amount', () => {
      const result = canSellQuantity('100.00000000', 100);

      expect(result.valid).toBe(true);
    });

    it('rejects sell exceeding holdings', () => {
      const result = canSellQuantity('100.00000000', 150);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('Cannot sell');
      expect(result.message).toContain('150');
      expect(result.message).toContain('100');
    });

    it('rejects sell when holdings are null', () => {
      const result = canSellQuantity(null, 10);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('No holdings to sell');
      expect(result.message).toContain('Add buy transactions first');
    });

    it('rejects sell when holdings are zero', () => {
      const result = canSellQuantity('0.00000000', 10);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('Cannot sell');
    });

    it('handles decimal sell quantities', () => {
      const result = canSellQuantity('0.50000000', 0.25);

      expect(result.valid).toBe(true);
    });

    it('rejects decimal sell exceeding holdings', () => {
      const result = canSellQuantity('0.50000000', 0.75);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('Cannot sell');
    });
  });
});
