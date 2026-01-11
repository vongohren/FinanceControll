import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { TestPGliteAdapter } from '@/__tests__/helpers';
import { createTestAdapter } from '@/__tests__/helpers';
import { AssetRepository } from '../asset';
import { PortfolioRepository } from '../portfolio';

const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000';

describe('AssetRepository', () => {
  let adapter: TestPGliteAdapter;
  let repo: AssetRepository;
  let portfolioRepo: PortfolioRepository;
  let testPortfolioId: string;

  beforeEach(async () => {
    adapter = await createTestAdapter();
    repo = new AssetRepository(adapter);
    portfolioRepo = new PortfolioRepository(adapter);

    const portfolio = await portfolioRepo.create({ name: 'Test', baseCurrency: 'USD' });
    testPortfolioId = portfolio.id;
  });

  afterEach(async () => {
    await adapter.disconnect();
  });

  describe('create', () => {
    it('creates an asset with required fields', async () => {
      const asset = await repo.create({
        portfolioId: testPortfolioId,
        type: 'crypto',
        name: 'Bitcoin',
      });

      expect(asset.id).toBeDefined();
      expect(asset.portfolioId).toBe(testPortfolioId);
      expect(asset.type).toBe('crypto');
      expect(asset.name).toBe('Bitcoin');
    });

    it('creates an asset with metadata', async () => {
      const metadata = { walletAddress: '0x123', network: 'Ethereum' };
      const asset = await repo.create({
        portfolioId: testPortfolioId,
        type: 'crypto',
        name: 'ETH',
        metadata: JSON.stringify(metadata),
      });

      expect(asset.metadata).toBeTruthy();
      if (asset.metadata) {
        expect(JSON.parse(asset.metadata)).toEqual(metadata);
      }
    });

    it('validates metadata for asset type', async () => {
      const invalidMetadata = '{"unknownField": "value"}';

      await expect(
        repo.create({
          portfolioId: testPortfolioId,
          type: 'crypto',
          name: 'Test',
          metadata: invalidMetadata,
        }),
      ).rejects.toThrow('Invalid metadata');
    });

    it('creates asset with cached fields', async () => {
      const asset = await repo.create({
        portfolioId: testPortfolioId,
        type: 'public_equity',
        name: 'AAPL',
        currentQuantity: '100.00000000',
        lastValuationDate: '2024-12-31',
      });

      expect(asset.currentQuantity).toBe('100.00000000');
      expect(asset.lastValuationDate).toBe('2024-12-31');
    });
  });

  describe('findAll', () => {
    it('returns empty array when no assets exist', async () => {
      const results = await repo.findAll();
      expect(results).toEqual([]);
    });

    it('returns all assets', async () => {
      await repo.create({ portfolioId: testPortfolioId, type: 'crypto', name: 'BTC' });
      await repo.create({ portfolioId: testPortfolioId, type: 'public_equity', name: 'AAPL' });

      const results = await repo.findAll();

      expect(results).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('returns asset when found', async () => {
      const created = await repo.create({
        portfolioId: testPortfolioId,
        type: 'crypto',
        name: 'BTC',
      });

      const found = await repo.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('returns null when not found', async () => {
      const found = await repo.findById(NON_EXISTENT_ID);
      expect(found).toBeNull();
    });
  });

  describe('findByPortfolioId', () => {
    it('returns assets for specific portfolio', async () => {
      const portfolio2 = await portfolioRepo.create({ name: 'Portfolio 2', baseCurrency: 'EUR' });

      await repo.create({ portfolioId: testPortfolioId, type: 'crypto', name: 'BTC' });
      await repo.create({ portfolioId: testPortfolioId, type: 'public_equity', name: 'AAPL' });
      await repo.create({ portfolioId: portfolio2.id, type: 'fund', name: 'Index Fund' });

      const results = await repo.findByPortfolioId(testPortfolioId);

      expect(results).toHaveLength(2);
      expect(results.every((a) => a.portfolioId === testPortfolioId)).toBe(true);
    });
  });

  describe('update', () => {
    it('updates asset fields', async () => {
      const created = await repo.create({
        portfolioId: testPortfolioId,
        type: 'crypto',
        name: 'BTC',
      });

      const updated = await repo.update(created.id, {
        name: 'Bitcoin',
        ticker: 'BTC',
      });

      expect(updated.name).toBe('Bitcoin');
      expect(updated.ticker).toBe('BTC');
    });

    it('validates metadata on update', async () => {
      const created = await repo.create({
        portfolioId: testPortfolioId,
        type: 'crypto',
        name: 'ETH',
      });

      await expect(
        repo.update(created.id, {
          metadata: '{"invalidField": 123}',
        }),
      ).rejects.toThrow('Invalid metadata');
    });

    it('throws error when asset not found', async () => {
      await expect(repo.update(NON_EXISTENT_ID, { name: 'Test' })).rejects.toThrow(
        `Asset ${NON_EXISTENT_ID} not found`,
      );
    });
  });

  describe('delete', () => {
    it('deletes asset', async () => {
      const created = await repo.create({
        portfolioId: testPortfolioId,
        type: 'crypto',
        name: 'BTC',
      });

      await repo.delete(created.id);

      const found = await repo.findById(created.id);
      expect(found).toBeNull();
    });
  });

  describe('updateCachedQuantity', () => {
    it('updates cached quantity', async () => {
      const created = await repo.create({
        portfolioId: testPortfolioId,
        type: 'crypto',
        name: 'BTC',
      });

      await repo.updateCachedQuantity(created.id, '50.12345678');

      const found = await repo.findById(created.id);
      expect(found?.currentQuantity).toBe('50.12345678');
    });
  });

  describe('updateCachedValuationDate', () => {
    it('updates cached valuation date', async () => {
      const created = await repo.create({
        portfolioId: testPortfolioId,
        type: 'startup_equity',
        name: 'Startup',
      });

      await repo.updateCachedValuationDate(created.id, '2024-12-31');

      const found = await repo.findById(created.id);
      expect(found?.lastValuationDate).toBe('2024-12-31');
    });
  });
});
