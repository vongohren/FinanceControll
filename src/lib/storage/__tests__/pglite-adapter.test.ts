import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { createTestAdapter, TestPGliteAdapter } from '@/__tests__/helpers';
import { portfolios, assets } from '@/lib/db/schema';

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
  });
});
