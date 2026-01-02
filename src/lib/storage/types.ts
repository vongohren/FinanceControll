export type StorageMode = 'local' | 'postgres' | 'supabase';

export interface StorageConfig {
  mode: StorageMode;
  connectionString?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

// Entity types (will be fully defined with Drizzle schema)
export interface Portfolio {
  id: string;
  userId: string | null;
  name: string;
  description: string | null;
  baseCurrency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id: string;
  portfolioId: string;
  type: 'startup_equity' | 'fund' | 'state_obligation' | 'crypto' | 'public_equity' | 'other';
  name: string;
  ticker: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  assetId: string;
  type: 'buy' | 'sell';
  quantity: string;
  pricePerUnit: string;
  currency: string;
  exchangeRate: string;
  date: Date;
  notes: string | null;
  createdAt: Date;
}

export interface Valuation {
  id: string;
  assetId: string;
  valuePerUnit: string;
  currency: string;
  exchangeRate: string;
  valuationDate: Date;
  source: string | null;
  notes: string | null;
  createdAt: Date;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: string;
  date: Date;
}

export interface ExportedData {
  version: string;
  exportedAt: string;
  portfolios: Portfolio[];
  assets: Asset[];
  transactions: Transaction[];
  valuations: Valuation[];
  exchangeRates: ExchangeRate[];
}

// Generic database type - will be specialized by each adapter
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DrizzleDatabase = any;

export interface StorageAdapter {
  // Lifecycle
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getMode(): StorageMode;

  // Database access
  db: DrizzleDatabase;

  // Migrations
  migrate(): Promise<void>;

  // Portability
  exportData(): Promise<ExportedData>;
  importData(data: ExportedData): Promise<void>;

  // Health check
  ping(): Promise<boolean>;
}

export interface StorageContextValue {
  adapter: StorageAdapter | null;
  isLoading: boolean;
  error: Error | null;
  mode: StorageMode | null;
  switchMode: (config: StorageConfig) => Promise<void>;
}
