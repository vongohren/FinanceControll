// Raw SQL migrations for PGlite
// These create the tables defined in schema.ts

export const migrations = `
-- Create enums
DO $$ BEGIN
  CREATE TYPE asset_type AS ENUM (
    'startup_equity',
    'fund',
    'state_obligation',
    'crypto',
    'public_equity',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('buy', 'sell');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  base_currency TEXT NOT NULL DEFAULT 'NOK',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  type asset_type NOT NULL,
  name TEXT NOT NULL,
  ticker TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  quantity DECIMAL(20, 8) NOT NULL,
  price_per_unit DECIMAL(20, 8) NOT NULL,
  currency TEXT NOT NULL,
  exchange_rate DECIMAL(20, 8) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create valuations table
CREATE TABLE IF NOT EXISTS valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  value_per_unit DECIMAL(20, 8) NOT NULL,
  currency TEXT NOT NULL,
  exchange_rate DECIMAL(20, 8) NOT NULL,
  valuation_date DATE NOT NULL,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate DECIMAL(20, 8) NOT NULL,
  date DATE NOT NULL
);

-- Create unique index on exchange_rates
CREATE UNIQUE INDEX IF NOT EXISTS currency_date_idx
ON exchange_rates(from_currency, to_currency, date);
`;
