import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestAdapter, type TestPGliteAdapter } from '@/__tests__/helpers';
import { assets, portfolios } from '@/lib/db/schema';

describe('PGliteAdapter', () => {
  let adapter: TestPGliteAdapter;

  beforeEach(async () => {
    adapter = await createTestAdapter();
  });

  afterEach(async () => {
    await adapter.disconnect();
  });

  describe('connection lifecycle', () => {
    it('should connect and report connected state', () => {
      expect(adapter.isConnected()).toBe(true);
    });

    it('should disconnect cleanly', async () => {
      await adapter.disconnect();
      expect(adapter.isConnected()).toBe(false);
    });

    it('should return local mode', () => {
      expect(adapter.getMode()).toBe('local');
    });

    it('should ping successfully when connected', async () => {
      expect(await adapter.ping()).toBe(true);
    });
  });

  describe('portfolio operations', () => {
    it('should create a portfolio', async () => {
      const result = await adapter.db
        .insert(portfolios)
        .values({
          name: 'Test Portfolio',
          baseCurrency: 'USD',
        })
        .returning();

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Test Portfolio');
      expect(result[0]?.baseCurrency).toBe('USD');
      expect(result[0]?.id).toBeDefined();
    });

    it('should query portfolios', async () => {
      await adapter.db.insert(portfolios).values([
        { name: 'Portfolio 1', baseCurrency: 'USD' },
        { name: 'Portfolio 2', baseCurrency: 'EUR' },
      ]);

      const all = await adapter.db.select().from(portfolios);
      expect(all).toHaveLength(2);
    });

    it('should update a portfolio', async () => {
      const [created] = await adapter.db
        .insert(portfolios)
        .values({ name: 'Original', baseCurrency: 'USD' })
        .returning();

      if (!created) throw new Error('Failed to create');

      await adapter.db
        .update(portfolios)
        .set({ name: 'Updated' })
        .where(eq(portfolios.id, created.id));

      const [updated] = await adapter.db
        .select()
        .from(portfolios)
        .where(eq(portfolios.id, created.id));

      expect(updated?.name).toBe('Updated');
    });

    it('should create portfolio with isArchived field', async () => {
      const [portfolio] = await adapter.db
        .insert(portfolios)
        .values({
          name: 'Archived Portfolio',
          baseCurrency: 'USD',
          isArchived: true,
        })
        .returning();

      expect(portfolio?.isArchived).toBe(true);
    });

    it('should default isArchived to false', async () => {
      const [portfolio] = await adapter.db
        .insert(portfolios)
        .values({
          name: 'Active Portfolio',
          baseCurrency: 'USD',
        })
        .returning();

      expect(portfolio?.isArchived).toBe(false);
    });
  });

  describe('asset operations', () => {
    it('should create an asset linked to portfolio', async () => {
      const [portfolio] = await adapter.db
        .insert(portfolios)
        .values({ name: 'Test', baseCurrency: 'USD' })
        .returning();

      if (!portfolio) throw new Error('Failed to create portfolio');

      const [asset] = await adapter.db
        .insert(assets)
        .values({
          portfolioId: portfolio.id,
          type: 'crypto',
          name: 'Bitcoin',
          ticker: 'BTC',
        })
        .returning();

      expect(asset?.name).toBe('Bitcoin');
      expect(asset?.portfolioId).toBe(portfolio.id);
    });

    it('should create asset with metadata field', async () => {
      const [portfolio] = await adapter.db
        .insert(portfolios)
        .values({ name: 'Test', baseCurrency: 'USD' })
        .returning();

      if (!portfolio) throw new Error('Failed to create portfolio');

      const metadata = { sharesOutstanding: 1000000, shareClass: 'Common' };
      const [asset] = await adapter.db
        .insert(assets)
        .values({
          portfolioId: portfolio.id,
          type: 'startup_equity',
          name: 'Test Startup',
          metadata: JSON.stringify(metadata),
        })
        .returning();

      expect(asset?.metadata).toBeTruthy();
      expect(JSON.parse(asset?.metadata ?? '{}')).toEqual(metadata);
    });

    it('should create asset with currentQuantity field', async () => {
      const [portfolio] = await adapter.db
        .insert(portfolios)
        .values({ name: 'Test', baseCurrency: 'USD' })
        .returning();

      if (!portfolio) throw new Error('Failed to create portfolio');

      const [asset] = await adapter.db
        .insert(assets)
        .values({
          portfolioId: portfolio.id,
          type: 'public_equity',
          name: 'Apple Inc.',
          ticker: 'AAPL',
          currentQuantity: '100.50000000',
        })
        .returning();

      expect(asset?.currentQuantity).toBe('100.50000000');
    });

    it('should create asset with lastValuationDate field', async () => {
      const [portfolio] = await adapter.db
        .insert(portfolios)
        .values({ name: 'Test', baseCurrency: 'USD' })
        .returning();

      if (!portfolio) throw new Error('Failed to create portfolio');

      const [asset] = await adapter.db
        .insert(assets)
        .values({
          portfolioId: portfolio.id,
          type: 'startup_equity',
          name: 'Test Startup',
          lastValuationDate: '2024-12-15',
        })
        .returning();

      expect(asset?.lastValuationDate).toBe('2024-12-15');
    });

    it('should create asset with all new fields', async () => {
      const [portfolio] = await adapter.db
        .insert(portfolios)
        .values({ name: 'Test', baseCurrency: 'USD' })
        .returning();

      if (!portfolio) throw new Error('Failed to create portfolio');

      const metadata = { exchange: 'NYSE', sector: 'Technology' };
      const [asset] = await adapter.db
        .insert(assets)
        .values({
          portfolioId: portfolio.id,
          type: 'public_equity',
          name: 'Microsoft',
          ticker: 'MSFT',
          metadata: JSON.stringify(metadata),
          currentQuantity: '50.25000000',
          lastValuationDate: '2024-12-31',
        })
        .returning();

      expect(asset?.metadata).toBeTruthy();
      expect(JSON.parse(asset?.metadata ?? '{}')).toEqual(metadata);
      expect(asset?.currentQuantity).toBe('50.25000000');
      expect(asset?.lastValuationDate).toBe('2024-12-31');
    });
  });
});
