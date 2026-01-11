import { desc, eq } from 'drizzle-orm';
import { calculateCurrentQuantity, canSellQuantity } from '@/lib/calculations/cost-basis';
import type { NewTransaction, Transaction } from '@/lib/db/schema';
import { transactions } from '@/lib/db/schema';
import { BaseRepository, type Repository } from './types';

export class TransactionRepository
  extends BaseRepository
  implements Repository<Transaction, NewTransaction>
{
  async findAll(): Promise<Transaction[]> {
    return this.db.select().from(transactions).orderBy(desc(transactions.date));
  }

  async findById(id: string): Promise<Transaction | null> {
    const results = await this.db.select().from(transactions).where(eq(transactions.id, id));
    return results[0] ?? null;
  }

  async findByAssetId(assetId: string): Promise<Transaction[]> {
    return this.db
      .select()
      .from(transactions)
      .where(eq(transactions.assetId, assetId))
      .orderBy(desc(transactions.date));
  }

  async create(data: NewTransaction): Promise<Transaction> {
    // Validate sell quantity doesn't exceed holdings
    if (data.type === 'sell') {
      const existingTransactions = await this.findByAssetId(data.assetId);
      const { currentQuantity } = calculateCurrentQuantity(existingTransactions);

      const validation = canSellQuantity(currentQuantity, Number(data.quantity));
      if (!validation.valid) {
        throw new Error(validation.message);
      }
    }

    const [transaction] = await this.db.insert(transactions).values(data).returning();

    if (!transaction) {
      throw new Error('Failed to create transaction');
    }

    return transaction;
  }

  async update(id: string, data: Partial<NewTransaction>): Promise<Transaction> {
    const [transaction] = await this.db
      .update(transactions)
      .set(data)
      .where(eq(transactions.id, id))
      .returning();

    if (!transaction) {
      throw new Error(`Transaction ${id} not found`);
    }

    return transaction;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(transactions).where(eq(transactions.id, id));
  }

  async getQuantitySummary(assetId: string) {
    const txs = await this.findByAssetId(assetId);
    return calculateCurrentQuantity(txs);
  }
}
