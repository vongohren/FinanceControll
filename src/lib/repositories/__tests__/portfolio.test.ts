import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { TestPGliteAdapter } from '@/__tests__/helpers';
import { createTestAdapter } from '@/__tests__/helpers';
import { PortfolioRepository } from '../portfolio';

const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000';

describe('PortfolioRepository', () => {
  let adapter: TestPGliteAdapter;
  let repo: PortfolioRepository;

  beforeEach(async () => {
    adapter = await createTestAdapter();
    repo = new PortfolioRepository(adapter);
  });

  afterEach(async () => {
    await adapter.disconnect();
  });

  describe('create', () => {
    it('creates a portfolio with required fields', async () => {
      const portfolio = await repo.create({
        name: 'Test Portfolio',
        baseCurrency: 'USD',
      });

      expect(portfolio.id).toBeDefined();
      expect(portfolio.name).toBe('Test Portfolio');
      expect(portfolio.baseCurrency).toBe('USD');
      expect(portfolio.isArchived).toBe(false);
      expect(portfolio.createdAt).toBeDefined();
      expect(portfolio.updatedAt).toBeDefined();
    });

    it('creates a portfolio with all fields', async () => {
      const portfolio = await repo.create({
        name: 'Full Portfolio',
        description: 'Test description',
        baseCurrency: 'EUR',
        isArchived: false,
      });

      expect(portfolio.id).toBeDefined();
      expect(portfolio.name).toBe('Full Portfolio');
      expect(portfolio.description).toBe('Test description');
      expect(portfolio.baseCurrency).toBe('EUR');
    });
  });

  describe('findAll', () => {
    it('returns empty array when no portfolios exist', async () => {
      const results = await repo.findAll();
      expect(results).toEqual([]);
    });

    it('returns all non-archived portfolios', async () => {
      await repo.create({ name: 'Active 1', baseCurrency: 'USD' });
      await repo.create({ name: 'Active 2', baseCurrency: 'EUR' });
      await repo.create({ name: 'Archived', baseCurrency: 'NOK', isArchived: true });

      const results = await repo.findAll();

      expect(results).toHaveLength(2);
      expect(results.map((p) => p.name)).toContain('Active 1');
      expect(results.map((p) => p.name)).toContain('Active 2');
      expect(results.map((p) => p.name)).not.toContain('Archived');
    });

    it('orders results by createdAt descending', async () => {
      const first = await repo.create({ name: 'First', baseCurrency: 'USD' });
      const second = await repo.create({ name: 'Second', baseCurrency: 'USD' });

      const results = await repo.findAll();

      expect(results[0]?.id).toBe(second.id);
      expect(results[1]?.id).toBe(first.id);
    });
  });

  describe('findAllIncludingArchived', () => {
    it('returns all portfolios including archived', async () => {
      await repo.create({ name: 'Active', baseCurrency: 'USD' });
      await repo.create({ name: 'Archived', baseCurrency: 'EUR', isArchived: true });

      const results = await repo.findAllIncludingArchived();

      expect(results).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('returns portfolio when found', async () => {
      const created = await repo.create({ name: 'Test', baseCurrency: 'USD' });

      const found = await repo.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe('Test');
    });

    it('returns null when not found', async () => {
      const found = await repo.findById(NON_EXISTENT_ID);

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('updates portfolio fields', async () => {
      const created = await repo.create({ name: 'Original', baseCurrency: 'USD' });

      const updated = await repo.update(created.id, {
        name: 'Updated',
        description: 'New description',
      });

      expect(updated.name).toBe('Updated');
      expect(updated.description).toBe('New description');
      expect(updated.baseCurrency).toBe('USD');
    });

    it('updates updatedAt timestamp', async () => {
      const created = await repo.create({ name: 'Test', baseCurrency: 'USD' });
      const originalUpdatedAt = created.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));
      const updated = await repo.update(created.id, { name: 'Updated' });

      expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('throws error when portfolio not found', async () => {
      await expect(repo.update(NON_EXISTENT_ID, { name: 'Test' })).rejects.toThrow(
        `Portfolio ${NON_EXISTENT_ID} not found`,
      );
    });
  });

  describe('delete', () => {
    it('deletes portfolio', async () => {
      const created = await repo.create({ name: 'To Delete', baseCurrency: 'USD' });

      await repo.delete(created.id);

      const found = await repo.findById(created.id);
      expect(found).toBeNull();
    });

    it('does not throw when deleting non-existent portfolio', async () => {
      await expect(repo.delete(NON_EXISTENT_ID)).resolves.not.toThrow();
    });
  });

  describe('archive', () => {
    it('archives a portfolio', async () => {
      const created = await repo.create({ name: 'To Archive', baseCurrency: 'USD' });

      const archived = await repo.archive(created.id);

      expect(archived.isArchived).toBe(true);
    });

    it('archived portfolio not in findAll results', async () => {
      const created = await repo.create({ name: 'Test', baseCurrency: 'USD' });
      await repo.archive(created.id);

      const results = await repo.findAll();

      expect(results).toHaveLength(0);
    });
  });

  describe('unarchive', () => {
    it('unarchives a portfolio', async () => {
      const created = await repo.create({
        name: 'Archived',
        baseCurrency: 'USD',
        isArchived: true,
      });

      const unarchived = await repo.unarchive(created.id);

      expect(unarchived.isArchived).toBe(false);
    });

    it('unarchived portfolio appears in findAll results', async () => {
      const created = await repo.create({
        name: 'Test',
        baseCurrency: 'USD',
        isArchived: true,
      });
      await repo.unarchive(created.id);

      const results = await repo.findAll();

      expect(results).toHaveLength(1);
      expect(results[0]?.id).toBe(created.id);
    });
  });
});
