import { and, eq } from 'drizzle-orm';
import type { ExchangeRate, NewExchangeRate } from '@/lib/db/schema';
import { exchangeRates } from '@/lib/db/schema';
import { BaseRepository, type Repository } from './types';

export class ExchangeRateRepository
  extends BaseRepository
  implements Repository<ExchangeRate, NewExchangeRate>
{
  async findAll(): Promise<ExchangeRate[]> {
    return this.db.select().from(exchangeRates);
  }

  async findById(id: string): Promise<ExchangeRate | null> {
    const results = await this.db.select().from(exchangeRates).where(eq(exchangeRates.id, id));
    return results[0] ?? null;
  }

  async findByDateAndCurrencies(
    fromCurrency: string,
    toCurrency: string,
    date: string,
  ): Promise<ExchangeRate | null> {
    const results = await this.db
      .select()
      .from(exchangeRates)
      .where(
        and(
          eq(exchangeRates.fromCurrency, fromCurrency),
          eq(exchangeRates.toCurrency, toCurrency),
          eq(exchangeRates.date, date),
        ),
      );

    return results[0] ?? null;
  }

  async create(data: NewExchangeRate): Promise<ExchangeRate> {
    const [rate] = await this.db.insert(exchangeRates).values(data).returning();

    if (!rate) {
      throw new Error('Failed to create exchange rate');
    }

    return rate;
  }

  async update(id: string, data: Partial<NewExchangeRate>): Promise<ExchangeRate> {
    const [rate] = await this.db
      .update(exchangeRates)
      .set(data)
      .where(eq(exchangeRates.id, id))
      .returning();

    if (!rate) {
      throw new Error(`Exchange rate ${id} not found`);
    }

    return rate;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(exchangeRates).where(eq(exchangeRates.id, id));
  }

  async upsert(data: NewExchangeRate): Promise<ExchangeRate> {
    const existing = await this.findByDateAndCurrencies(
      data.fromCurrency,
      data.toCurrency,
      data.date,
    );

    if (existing) {
      return this.update(existing.id, data);
    }

    return this.create(data);
  }
}
