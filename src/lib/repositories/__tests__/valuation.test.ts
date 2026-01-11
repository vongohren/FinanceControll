import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { TestPGliteAdapter } from '@/__tests__/helpers';
import { createTestAdapter } from '@/__tests__/helpers';
import { AssetRepository } from '../asset';
import { PortfolioRepository } from '../portfolio';
import { ValuationRepository } from '../valuation';

const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000';

describe('ValuationRepository', () => {
  let adapter: TestPGliteAdapter;
  let repo: ValuationRepository;
  let assetRepo: AssetRepository;
  let portfolioRepo: PortfolioRepository;
  let testAssetId: string;

  beforeEach(async () => {
    adapter = await createTestAdapter();
    repo = new ValuationRepository(adapter);
    assetRepo = new AssetRepository(adapter);
    portfolioRepo = new PortfolioRepository(adapter);

    const portfolio = await portfolioRepo.create({ name: 'Test', baseCurrency: 'USD' });
    const asset = await assetRepo.create({
      portfolioId: portfolio.id,
      type: 'startup_equity',
      name: 'Startup Inc',
    });
    testAssetId = asset.id;
  });

  afterEach(async () => {
    await adapter.disconnect();
  });

  describe('create', () => {
    it('creates a valuation', async () => {
      const valuation = await repo.create({
        assetId: testAssetId,
        valuePerUnit: '10.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        valuationDate: '2024-12-31',
        source: '409A Valuation',
      });

      expect(valuation.id).toBeDefined();
      expect(valuation.assetId).toBe(testAssetId);
      expect(valuation.valuePerUnit).toBe('10.00000000');
      expect(valuation.source).toBe('409A Valuation');
    });
  });

  describe('findAll', () => {
    it('returns empty array when no valuations exist', async () => {
      const results = await repo.findAll();
      expect(results).toEqual([]);
    });

    it('returns all valuations ordered by date descending', async () => {
      await repo.create({
        assetId: testAssetId,
        valuePerUnit: '5.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        valuationDate: '2024-01-01',
      });
      await repo.create({
        assetId: testAssetId,
        valuePerUnit: '10.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        valuationDate: '2024-12-31',
      });

      const results = await repo.findAll();

      expect(results).toHaveLength(2);
      expect(results[0]?.valuationDate).toBe('2024-12-31');
      expect(results[1]?.valuationDate).toBe('2024-01-01');
    });
  });

  describe('findByAssetId', () => {
    it('returns valuations for specific asset', async () => {
      const asset2 = await assetRepo.create({
        portfolioId: (await portfolioRepo.findAll())[0]?.id,
        type: 'fund',
        name: 'Index Fund',
      });

      await repo.create({
        assetId: testAssetId,
        valuePerUnit: '10.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        valuationDate: '2024-12-31',
      });
      await repo.create({
        assetId: asset2.id,
        valuePerUnit: '100.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        valuationDate: '2024-12-31',
      });

      const results = await repo.findByAssetId(testAssetId);

      expect(results).toHaveLength(1);
      expect(results[0]?.assetId).toBe(testAssetId);
    });
  });

  describe('getLatest', () => {
    it('returns most recent valuation', async () => {
      await repo.create({
        assetId: testAssetId,
        valuePerUnit: '5.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        valuationDate: '2024-01-01',
      });
      const latest = await repo.create({
        assetId: testAssetId,
        valuePerUnit: '10.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        valuationDate: '2024-12-31',
      });

      const result = await repo.getLatest(testAssetId);

      expect(result?.id).toBe(latest.id);
      expect(result?.valuePerUnit).toBe('10.00000000');
    });

    it('returns null when no valuations exist', async () => {
      const result = await repo.getLatest(testAssetId);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('updates valuation', async () => {
      const created = await repo.create({
        assetId: testAssetId,
        valuePerUnit: '10.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        valuationDate: '2024-12-31',
      });

      const updated = await repo.update(created.id, {
        source: 'Market Price',
        notes: 'Updated valuation',
      });

      expect(updated.source).toBe('Market Price');
      expect(updated.notes).toBe('Updated valuation');
    });

    it('throws error when valuation not found', async () => {
      await expect(repo.update(NON_EXISTENT_ID, { notes: 'Test' })).rejects.toThrow(
        `Valuation ${NON_EXISTENT_ID} not found`,
      );
    });
  });

  describe('delete', () => {
    it('deletes valuation', async () => {
      const created = await repo.create({
        assetId: testAssetId,
        valuePerUnit: '10.00000000',
        currency: 'USD',
        exchangeRate: '1.00000000',
        valuationDate: '2024-12-31',
      });

      await repo.delete(created.id);

      const found = await repo.findById(created.id);
      expect(found).toBeNull();
    });
  });
});
