import { desc, eq } from 'drizzle-orm';
import type { NewValuation, Valuation } from '@/lib/db/schema';
import { valuations } from '@/lib/db/schema';
import { BaseRepository, type Repository } from './types';

export class ValuationRepository
  extends BaseRepository
  implements Repository<Valuation, NewValuation>
{
  async findAll(): Promise<Valuation[]> {
    return this.db.select().from(valuations).orderBy(desc(valuations.valuationDate));
  }

  async findById(id: string): Promise<Valuation | null> {
    const results = await this.db.select().from(valuations).where(eq(valuations.id, id));
    return results[0] ?? null;
  }

  async findByAssetId(assetId: string): Promise<Valuation[]> {
    return this.db
      .select()
      .from(valuations)
      .where(eq(valuations.assetId, assetId))
      .orderBy(desc(valuations.valuationDate));
  }

  async getLatest(assetId: string): Promise<Valuation | null> {
    const results = await this.db
      .select()
      .from(valuations)
      .where(eq(valuations.assetId, assetId))
      .orderBy(desc(valuations.valuationDate))
      .limit(1);

    return results[0] ?? null;
  }

  async create(data: NewValuation): Promise<Valuation> {
    const [valuation] = await this.db.insert(valuations).values(data).returning();

    if (!valuation) {
      throw new Error('Failed to create valuation');
    }

    return valuation;
  }

  async update(id: string, data: Partial<NewValuation>): Promise<Valuation> {
    const [valuation] = await this.db
      .update(valuations)
      .set(data)
      .where(eq(valuations.id, id))
      .returning();

    if (!valuation) {
      throw new Error(`Valuation ${id} not found`);
    }

    return valuation;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(valuations).where(eq(valuations.id, id));
  }
}
