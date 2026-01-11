import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { TestPGliteAdapter } from '@/__tests__/helpers';
import { createTestAdapter } from '@/__tests__/helpers';
import { AssetRepository } from '../asset';
import { PortfolioRepository } from '../portfolio';
import { TransactionRepository } from '../transaction';

const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000';

describe('TransactionRepository', () => {
  let adapter: TestPGliteAdapter;
  let repo: TransactionRepository;
  let assetRepo: AssetRepository;
  let portfolioRepo: PortfolioRepository;
  let testAssetId: string;

  beforeEach(async () => {
    adapter = await createTestAdapter();
    repo = new TransactionRepository(adapter);
    assetRepo = new AssetRepository(adapter);
    portfolioRepo = new PortfolioRepository(adapter);

    const portfolio = await portfolioRepo.create({ name: 'Test', baseCurrency: 'USD' });
    const asset = await assetRepo.create({
      portfolioId: portfolio.id,
      type: 'crypto',
      name: 'BTC',
    });
    testAssetId = asset.id;
  });

  afterEach(async () => {
    await adapter.disconnect();
  });

  describe('create', () => {
    it('creates a buy transaction', async () => {
      const transaction = await repo.create({
        assetId: testAssetId,
        type: 'buy',
        quantity: '1.00000000',
        pricePerUnit: '50000.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        date: '2024-01-01',
      });

      expect(transaction.id).toBeDefined();
      expect(transaction.assetId).toBe(testAssetId);
      expect(transaction.type).toBe('buy');
      expect(transaction.quantity).toBe('1.00000000');
    });

    it('creates a sell transaction', async () => {
      // First create a buy
      await repo.create({
        assetId: testAssetId,
        type: 'buy',
        quantity: '2.00000000',
        pricePerUnit: '50000.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        date: '2024-01-01',
      });

      const sellTransaction = await repo.create({
        assetId: testAssetId,
        type: 'sell',
        quantity: '1.00000000',
        pricePerUnit: '55000.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        date: '2024-02-01',
      });

      expect(sellTransaction.type).toBe('sell');
    });

    it('prevents overselling', async () => {
      await repo.create({
        assetId: testAssetId,
        type: 'buy',
        quantity: '1.00000000',
        pricePerUnit: '50000.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        date: '2024-01-01',
      });

      await expect(
        repo.create({
          assetId: testAssetId,
          type: 'sell',
          quantity: '2.00000000',
          pricePerUnit: '55000.00000000',
          currency: 'USD',
          exchangeRate: '1.00000000',
          date: '2024-02-01',
        }),
      ).rejects.toThrow('Cannot sell');
    });

    it('prevents selling with no holdings', async () => {
      await expect(
        repo.create({
          assetId: testAssetId,
          type: 'sell',
          quantity: '1.00000000',
          pricePerUnit: '50000.00000000',
          currency: 'USD',
          exchangeRate: '1.00000000',
          date: '2024-01-01',
        }),
      ).rejects.toThrow('Cannot sell');
    });
  });

  describe('findAll', () => {
    it('returns empty array when no transactions exist', async () => {
      const results = await repo.findAll();
      expect(results).toEqual([]);
    });

    it('returns all transactions', async () => {
      await repo.create({
        assetId: testAssetId,
        type: 'buy',
        quantity: '1.00000000',
        pricePerUnit: '50000.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        date: '2024-01-01',
      });
      await repo.create({
        assetId: testAssetId,
        type: 'buy',
        quantity: '2.00000000',
        pricePerUnit: '51000.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        date: '2024-02-01',
      });

      const results = await repo.findAll();

      expect(results).toHaveLength(2);
    });
  });

  describe('findByAssetId', () => {
    it('returns transactions for specific asset', async () => {
      const asset2 = await assetRepo.create({
        portfolioId: (await portfolioRepo.findAll())[0]?.id,
        type: 'public_equity',
        name: 'AAPL',
      });

      await repo.create({
        assetId: testAssetId,
        type: 'buy',
        quantity: '1.00000000',
        pricePerUnit: '50000.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        date: '2024-01-01',
      });
      await repo.create({
        assetId: asset2.id,
        type: 'buy',
        quantity: '10.00000000',
        pricePerUnit: '150.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        date: '2024-01-01',
      });

      const results = await repo.findByAssetId(testAssetId);

      expect(results).toHaveLength(1);
      expect(results[0]?.assetId).toBe(testAssetId);
    });
  });

  describe('getQuantitySummary', () => {
    it('calculates quantity summary', async () => {
      await repo.create({
        assetId: testAssetId,
        type: 'buy',
        quantity: '10.00000000',
        pricePerUnit: '50000.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        date: '2024-01-01',
      });
      await repo.create({
        assetId: testAssetId,
        type: 'buy',
        quantity: '5.00000000',
        pricePerUnit: '51000.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        date: '2024-02-01',
      });
      await repo.create({
        assetId: testAssetId,
        type: 'sell',
        quantity: '3.00000000',
        pricePerUnit: '52000.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        date: '2024-03-01',
      });

      const summary = await repo.getQuantitySummary(testAssetId);

      expect(summary.currentQuantity).toBe('12.00000000');
      expect(summary.totalBuys).toBe('15.00000000');
      expect(summary.totalSells).toBe('3.00000000');
    });
  });

  describe('update', () => {
    it('updates transaction', async () => {
      const created = await repo.create({
        assetId: testAssetId,
        type: 'buy',
        quantity: '1.00000000',
        pricePerUnit: '50000.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        date: '2024-01-01',
      });

      const updated = await repo.update(created.id, {
        notes: 'Updated note',
      });

      expect(updated.notes).toBe('Updated note');
    });

    it('throws error when transaction not found', async () => {
      await expect(repo.update(NON_EXISTENT_ID, { notes: 'Test' })).rejects.toThrow(
        `Transaction ${NON_EXISTENT_ID} not found`,
      );
    });
  });

  describe('delete', () => {
    it('deletes transaction', async () => {
      const created = await repo.create({
        assetId: testAssetId,
        type: 'buy',
        quantity: '1.00000000',
        pricePerUnit: '50000.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        date: '2024-01-01',
      });

      await repo.delete(created.id);

      const found = await repo.findById(created.id);
      expect(found).toBeNull();
    });
  });
});
