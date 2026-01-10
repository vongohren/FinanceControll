import { relations } from 'drizzle-orm';
import {
  date,
  decimal,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// Enums
export const assetTypeEnum = pgEnum('asset_type', [
  'startup_equity',
  'fund',
  'state_obligation',
  'crypto',
  'public_equity',
  'other',
]);

export const transactionTypeEnum = pgEnum('transaction_type', ['buy', 'sell']);

// Tables
export const portfolios = pgTable('portfolios', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  name: text('name').notNull(),
  description: text('description'),
  baseCurrency: text('base_currency').default('NOK').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  portfolioId: uuid('portfolio_id')
    .notNull()
    .references(() => portfolios.id, { onDelete: 'cascade' }),
  type: assetTypeEnum('type').notNull(),
  name: text('name').notNull(),
  ticker: text('ticker'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  assetId: uuid('asset_id')
    .notNull()
    .references(() => assets.id, { onDelete: 'cascade' }),
  type: transactionTypeEnum('type').notNull(),
  quantity: decimal('quantity', { precision: 20, scale: 8 }).notNull(),
  pricePerUnit: decimal('price_per_unit', { precision: 20, scale: 8 }).notNull(),
  currency: text('currency').notNull(),
  exchangeRate: decimal('exchange_rate', { precision: 20, scale: 8 }).notNull(),
  date: date('date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const valuations = pgTable('valuations', {
  id: uuid('id').primaryKey().defaultRandom(),
  assetId: uuid('asset_id')
    .notNull()
    .references(() => assets.id, { onDelete: 'cascade' }),
  valuePerUnit: decimal('value_per_unit', { precision: 20, scale: 8 }).notNull(),
  currency: text('currency').notNull(),
  exchangeRate: decimal('exchange_rate', { precision: 20, scale: 8 }).notNull(),
  valuationDate: date('valuation_date').notNull(),
  source: text('source'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const exchangeRates = pgTable(
  'exchange_rates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fromCurrency: text('from_currency').notNull(),
    toCurrency: text('to_currency').notNull(),
    rate: decimal('rate', { precision: 20, scale: 8 }).notNull(),
    date: date('date').notNull(),
  },
  (table) => [
    uniqueIndex('currency_date_idx').on(table.fromCurrency, table.toCurrency, table.date),
  ],
);

// Relations
export const portfoliosRelations = relations(portfolios, ({ many }) => ({
  assets: many(assets),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  portfolio: one(portfolios, {
    fields: [assets.portfolioId],
    references: [portfolios.id],
  }),
  transactions: many(transactions),
  valuations: many(valuations),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  asset: one(assets, {
    fields: [transactions.assetId],
    references: [assets.id],
  }),
}));

export const valuationsRelations = relations(valuations, ({ one }) => ({
  asset: one(assets, {
    fields: [valuations.assetId],
    references: [assets.id],
  }),
}));

// Type exports
export type Portfolio = typeof portfolios.$inferSelect;
export type NewPortfolio = typeof portfolios.$inferInsert;
export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Valuation = typeof valuations.$inferSelect;
export type NewValuation = typeof valuations.$inferInsert;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type NewExchangeRate = typeof exchangeRates.$inferInsert;
