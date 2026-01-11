import { desc, eq } from 'drizzle-orm';
import type { NewPortfolio, Portfolio } from '@/lib/db/schema';
import { portfolios } from '@/lib/db/schema';
import { BaseRepository, type Repository } from './types';

export class PortfolioRepository
  extends BaseRepository
  implements Repository<Portfolio, NewPortfolio>
{
  async findAll(): Promise<Portfolio[]> {
    return this.db
      .select()
      .from(portfolios)
      .where(eq(portfolios.isArchived, false))
      .orderBy(desc(portfolios.createdAt));
  }

  async findAllIncludingArchived(): Promise<Portfolio[]> {
    return this.db.select().from(portfolios).orderBy(desc(portfolios.createdAt));
  }

  async findById(id: string): Promise<Portfolio | null> {
    const results = await this.db.select().from(portfolios).where(eq(portfolios.id, id));
    return results[0] ?? null;
  }

  async create(data: NewPortfolio): Promise<Portfolio> {
    const [portfolio] = await this.db.insert(portfolios).values(data).returning();

    if (!portfolio) {
      throw new Error('Failed to create portfolio');
    }

    return portfolio;
  }

  async update(id: string, data: Partial<NewPortfolio>): Promise<Portfolio> {
    const [portfolio] = await this.db
      .update(portfolios)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(portfolios.id, id))
      .returning();

    if (!portfolio) {
      throw new Error(`Portfolio ${id} not found`);
    }

    return portfolio;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(portfolios).where(eq(portfolios.id, id));
  }

  async archive(id: string): Promise<Portfolio> {
    return this.update(id, { isArchived: true });
  }

  async unarchive(id: string): Promise<Portfolio> {
    return this.update(id, { isArchived: false });
  }
}
