import { desc, eq } from 'drizzle-orm';
import type { Asset, NewAsset, Transaction, Valuation } from '@/lib/db/schema';
import { assets } from '@/lib/db/schema';
import { validateMetadata } from '@/lib/db/validation';
import { BaseRepository, type Repository } from './types';

export class AssetRepository extends BaseRepository implements Repository<Asset, NewAsset> {
  async findAll(): Promise<Asset[]> {
    return this.db.select().from(assets).orderBy(desc(assets.createdAt));
  }

  async findById(id: string): Promise<Asset | null> {
    const results = await this.db.select().from(assets).where(eq(assets.id, id));
    return results[0] ?? null;
  }

  async findByIdWithRelations(id: string) {
    return this.db.query.assets.findFirst({
      where: eq(assets.id, id),
      with: {
        portfolio: true,
        transactions: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          orderBy: (tx: Transaction, { desc }: any) => [desc(tx.date)],
        },
        valuations: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          orderBy: (val: Valuation, { desc }: any) => [desc(val.valuationDate)],
        },
      },
    });
  }

  async findByPortfolioId(portfolioId: string): Promise<Asset[]> {
    return this.db
      .select()
      .from(assets)
      .where(eq(assets.portfolioId, portfolioId))
      .orderBy(desc(assets.createdAt));
  }

  async create(data: NewAsset): Promise<Asset> {
    // Validate metadata if provided
    if (data.metadata && data.type) {
      const validation = validateMetadata(data.type, data.metadata);
      if (!validation.valid) {
        throw new Error(`Invalid metadata: ${validation.error}`);
      }
    }

    const [asset] = await this.db.insert(assets).values(data).returning();

    if (!asset) {
      throw new Error('Failed to create asset');
    }

    return asset;
  }

  async update(id: string, data: Partial<NewAsset>): Promise<Asset> {
    // If metadata is being updated, validate it
    if (data.metadata) {
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error(`Asset ${id} not found`);
      }

      const assetType = data.type ?? existing.type;
      const validation = validateMetadata(assetType, data.metadata);
      if (!validation.valid) {
        throw new Error(`Invalid metadata: ${validation.error}`);
      }
    }

    const [asset] = await this.db
      .update(assets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(assets.id, id))
      .returning();

    if (!asset) {
      throw new Error(`Asset ${id} not found`);
    }

    return asset;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(assets).where(eq(assets.id, id));
  }

  async updateCachedQuantity(assetId: string, quantity: string): Promise<void> {
    await this.db.update(assets).set({ currentQuantity: quantity }).where(eq(assets.id, assetId));
  }

  async updateCachedValuationDate(assetId: string, date: string): Promise<void> {
    await this.db.update(assets).set({ lastValuationDate: date }).where(eq(assets.id, assetId));
  }
}
