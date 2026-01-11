# Data Model Review - Before Phase 1

# ✅ RESOLVED - Implemented on 2026-01-11

All critical issues have been addressed:

1. ✅ Asset metadata → JSON field with Zod validation
2. ✅ Performance indexes → 5 strategic indexes added
3. ✅ Transaction validation → FIFO with overselling checks
4. ✅ Cost basis method → FIFO implementation
5. ✅ Soft deletes → isArchived flag on portfolios
6. ✅ Cached values → currentQuantity and lastValuationDate

See implementation details in CLAUDE.md "Data Model Decisions" section.

---

## Current Status

The basic schema exists in `src/lib/db/schema.ts` with 5 tables:
- ✅ portfolios
- ✅ assets
- ✅ transactions
- ✅ valuations
- ✅ exchange_rates

However, several **design decisions and gaps** need resolution before building Phase 1 CRUD.

---

## 🔴 Critical Issues

### 1. Asset Type-Specific Fields

**Problem**: Task 9 mentions type-specific fields like:
- Startup: "shares"
- Fund: "commitment"
- Bonds: "maturity date"

**Current Schema**: Only generic `name`, `ticker`, `notes`

**Options**:
- **A) JSON metadata field** - Add `metadata JSONB` column for flexible type-specific data
- **B) Separate tables** - `startup_metadata`, `fund_metadata`, etc. (more complex)
- **C) Use notes field** - Store everything as text (loses type safety)

**Recommendation**: Option A (JSON metadata) - flexible, type-safe with Zod validation

```typescript
// Example metadata schemas by type
const startupMetadata = z.object({
  sharesOutstanding: z.number().optional(),
  shareClass: z.string().optional(),
  vestingSchedule: z.string().optional(),
});

const fundMetadata = z.object({
  commitmentAmount: z.number().optional(),
  calledCapital: z.number().optional(),
  managementFee: z.number().optional(),
});
```

---

### 2. Transaction Validation (Overselling)

**Problem**: Task 10 requires validation "can't sell more than owned"

**Current Schema**: No constraints at DB level

**Questions**:
- Calculate at application level only, or add DB constraint?
- Should we store running quantity balance?
- What about corporate actions (splits, mergers)?

**Recommendation**:
- Application-level validation in repository
- Add helper: `calculateCurrentHoldings(assetId)`
- Future: Consider adding `currentQuantity` cached field on assets table

---

### 3. Missing Indexes for Performance

**Current**: Only `exchange_rates` has an index

**Needed**:
```sql
CREATE INDEX IF NOT EXISTS idx_assets_portfolio
  ON assets(portfolio_id);

CREATE INDEX IF NOT EXISTS idx_transactions_asset
  ON transactions(asset_id);

CREATE INDEX IF NOT EXISTS idx_transactions_date
  ON transactions(date DESC);

CREATE INDEX IF NOT EXISTS idx_valuations_asset
  ON valuations(asset_id);

CREATE INDEX IF NOT EXISTS idx_valuations_date
  ON valuations(valuation_date DESC);
```

---

### 4. Currency Handling Edge Cases

**Questions**:
- What happens if user changes portfolio base currency?
- Do we recalculate historical costs, or keep as-is?
- What's the source of truth for "current" exchange rate?

**Current Schema**: Exchange rate stored with each transaction/valuation (good!)

**Needs Clarification**:
- Portfolio currency change policy
- Default exchange rate source (will be added in Task 12)

---

## 🟡 Nice-to-Have Improvements

### 5. Additional Portfolio Fields

```typescript
// Potential additions:
portfolios {
  isDefault: boolean,        // For multi-portfolio users
  isArchived: boolean,       // Soft delete
  sortOrder: integer,        // User-defined ordering
  color: text,              // UI customization
}
```

### 6. Additional Transaction Fields

```typescript
transactions {
  fees: decimal,            // Transaction costs
  taxLotId: uuid,          // For specific lot identification
  executedAt: timestamp,   // Precise time (vs just date)
}
```

### 7. Additional Valuation Fields

```typescript
valuations {
  confidence: text,        // 'high', 'medium', 'low'
  verifiedBy: text,        // Who verified this valuation
  documentUrl: text,       // Link to 409A report, etc.
}
```

### 8. Audit Trail

**Should we track**:
- Who modified records (userId + timestamp)?
- Change history (separate audit table)?
- Soft deletes vs hard deletes?

**Current**: Hard deletes with CASCADE

---

## 🟢 Business Logic Questions

### 9. Cost Basis Methodology

**Which method to support**:
- FIFO (First In, First Out) - **Recommended for MVP**
- LIFO (Last In, First Out)
- Specific Lot Identification
- Average Cost

**Decision Needed**: Start with FIFO, add selector later?

### 10. Corporate Actions

**Out of scope for Phase 1, but consider**:
- Stock splits
- Dividends
- Mergers/acquisitions
- Spin-offs

**Recommendation**: Add `corporate_actions` table in Phase 2+

### 11. Multi-Currency Display

**Questions**:
- Show values in original currency, base currency, or both?
- Real-time conversion vs historical rates?
- User preference setting?

---

## 📋 Proposed Schema Updates

### Option 1: Minimal Changes (MVP)

```typescript
// Add to assets table
assets {
  ...existing,
  metadata: text,  // JSON string for type-specific data
}

// Add indexes (migrations.ts)
CREATE INDEX idx_assets_portfolio ON assets(portfolio_id);
CREATE INDEX idx_transactions_asset ON transactions(asset_id);
CREATE INDEX idx_valuations_asset ON valuations(asset_id);
```

### Option 2: Enhanced (Better UX)

```typescript
// Assets
assets {
  ...existing,
  metadata: text,
  currentQuantity: decimal,  // Cached, updated on transaction
  lastValuationDate: date,   // Cached, for staleness checks
}

// Portfolios
portfolios {
  ...existing,
  isDefault: boolean,
  isArchived: boolean,
}

// Transactions
transactions {
  ...existing,
  fees: decimal,
}

// Valuations
valuations {
  ...existing,
  confidence: text,
}
```

---

## 🎯 Recommendations for Phase 1

### Must-Have (Blocking):
1. ✅ Decide on asset metadata approach (JSON field recommended)
2. ✅ Add performance indexes
3. ✅ Define overselling validation logic
4. ✅ Clarify cost basis method (FIFO for MVP)

### Should-Have (Quality):
5. ⚠️ Add `isArchived` to portfolios (soft delete)
6. ⚠️ Add `lastValuationDate` to assets (performance)
7. ⚠️ Add `fees` to transactions (common requirement)

### Nice-to-Have (Future):
8. 💡 Audit trail / change history
9. 💡 Corporate actions table
10. 💡 Tax lot tracking

---

## Next Steps

1. **Decide on schema additions** - Which of the above should we include?
2. **Update schema.ts** - Add chosen fields
3. **Update migrations.ts** - Add SQL for new fields/indexes
4. **Document decisions** - Update CLAUDE.md with data model choices
5. **Create validation utilities** - For overselling, etc.
6. **Then proceed with Phase 1** - Repository layer with solid foundation

---

## Questions for Discussion

1. Should we add `metadata` JSON field to assets now, or later?
2. Which optional fields from "Should-Have" list are worth including?
3. Hard deletes or soft deletes (isArchived)?
4. Should we cache computed values (currentQuantity, lastValuationDate)?
5. Cost basis method: FIFO only, or make it configurable from start?
