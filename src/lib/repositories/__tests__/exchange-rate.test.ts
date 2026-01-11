import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { TestPGliteAdapter } from '@/__tests__/helpers';
import { createTestAdapter } from '@/__tests__/helpers';
import { ExchangeRateRepository } from '../exchange-rate';

const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000';

describe('ExchangeRateRepository', () => {
  let adapter: TestPGliteAdapter;
  let repo: ExchangeRateRepository;

  beforeEach(async () => {
    adapter = await createTestAdapter();
    repo = new ExchangeRateRepository(adapter);
  });

  afterEach(async () => {
    await adapter.disconnect();
  });

  describe('create', () => {
    it('creates an exchange rate', async () => {
      const rate = await repo.create({
        fromCurrency: 'USD',
        toCurrency: 'NOK',
        rate: '10.50000000',
        date: '2024-12-31',
      });

      expect(rate.id).toBeDefined();
      expect(rate.fromCurrency).toBe('USD');
      expect(rate.toCurrency).toBe('NOK');
      expect(rate.rate).toBe('10.50000000');
      expect(rate.date).toBe('2024-12-31');
    });
  });

  describe('findByDateAndCurrencies', () => {
    it('finds exchange rate by criteria', async () => {
      await repo.create({
        fromCurrency: 'USD',
        toCurrency: 'NOK',
        rate: '10.50000000',
        date: '2024-12-31',
      });

      const found = await repo.findByDateAndCurrencies('USD', 'NOK', '2024-12-31');

      expect(found).toBeDefined();
      expect(found?.rate).toBe('10.50000000');
    });

    it('returns null when not found', async () => {
      const found = await repo.findByDateAndCurrencies('EUR', 'USD', '2024-12-31');
      expect(found).toBeNull();
    });
  });

  describe('upsert', () => {
    it('creates new rate when none exists', async () => {
      const rate = await repo.upsert({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        rate: '0.85000000',
        date: '2024-12-31',
      });

      expect(rate.id).toBeDefined();
      expect(rate.rate).toBe('0.85000000');

      const all = await repo.findAll();
      expect(all).toHaveLength(1);
    });

    it('updates existing rate', async () => {
      await repo.create({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        rate: '0.85000000',
        date: '2024-12-31',
      });

      const updated = await repo.upsert({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        rate: '0.90000000',
        date: '2024-12-31',
      });

      expect(updated.rate).toBe('0.90000000');

      const all = await repo.findAll();
      expect(all).toHaveLength(1);
    });
  });

  describe('findAll', () => {
    it('returns empty array when no rates exist', async () => {
      const results = await repo.findAll();
      expect(results).toEqual([]);
    });

    it('returns all exchange rates', async () => {
      await repo.create({
        fromCurrency: 'USD',
        toCurrency: 'NOK',
        rate: '10.50000000',
        date: '2024-12-31',
      });
      await repo.create({
        fromCurrency: 'EUR',
        toCurrency: 'NOK',
        rate: '12.00000000',
        date: '2024-12-31',
      });

      const results = await repo.findAll();

      expect(results).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('updates exchange rate', async () => {
      const created = await repo.create({
        fromCurrency: 'USD',
        toCurrency: 'NOK',
        rate: '10.50000000',
        date: '2024-12-31',
      });

      const updated = await repo.update(created.id, {
        rate: '11.00000000',
      });

      expect(updated.rate).toBe('11.00000000');
    });

    it('throws error when rate not found', async () => {
      await expect(repo.update(NON_EXISTENT_ID, { rate: '1.00000000' })).rejects.toThrow(
        `Exchange rate ${NON_EXISTENT_ID} not found`,
      );
    });
  });

  describe('delete', () => {
    it('deletes exchange rate', async () => {
      const created = await repo.create({
        fromCurrency: 'USD',
        toCurrency: 'NOK',
        rate: '10.50000000',
        date: '2024-12-31',
      });

      await repo.delete(created.id);

      const found = await repo.findById(created.id);
      expect(found).toBeNull();
    });
  });
});
