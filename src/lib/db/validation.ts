import { z } from 'zod';

// Metadata schemas by asset type
export const startupEquityMetadata = z
  .object({
    sharesOutstanding: z.number().positive().optional(),
    shareClass: z.string().optional(),
    vestingSchedule: z.string().optional(),
    exercisePrice: z.number().positive().optional(),
  })
  .strict();

export const fundMetadata = z
  .object({
    commitmentAmount: z.number().positive().optional(),
    calledCapital: z.number().positive().optional(),
    managementFee: z.number().min(0).max(100).optional(), // Percentage
    vintageYear: z.number().int().min(1900).max(2100).optional(),
  })
  .strict();

export const stateObligationMetadata = z
  .object({
    bondType: z.string().optional(),
    maturityDate: z.string().optional(), // ISO date string
    couponRate: z.number().min(0).optional(),
    faceValue: z.number().positive().optional(),
  })
  .strict();

export const cryptoMetadata = z
  .object({
    walletAddress: z.string().optional(),
    network: z.string().optional(), // e.g., "Ethereum", "Bitcoin"
    stakingInfo: z.string().optional(),
  })
  .strict();

export const publicEquityMetadata = z
  .object({
    exchange: z.string().optional(), // e.g., "NYSE", "NASDAQ"
    sector: z.string().optional(),
    isin: z.string().optional(),
  })
  .strict();

export const otherMetadata = z
  .object({
    customFields: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

// Type union
export type AssetMetadata =
  | z.infer<typeof startupEquityMetadata>
  | z.infer<typeof fundMetadata>
  | z.infer<typeof stateObligationMetadata>
  | z.infer<typeof cryptoMetadata>
  | z.infer<typeof publicEquityMetadata>
  | z.infer<typeof otherMetadata>;

// Validator function
export function validateMetadata(
  assetType: string,
  metadataJson: string | null,
): { valid: true; data: AssetMetadata } | { valid: false; error: string } {
  if (!metadataJson) {
    return { valid: true, data: {} };
  }

  try {
    const parsed = JSON.parse(metadataJson);

    const schemaMap = {
      startup_equity: startupEquityMetadata,
      fund: fundMetadata,
      state_obligation: stateObligationMetadata,
      crypto: cryptoMetadata,
      public_equity: publicEquityMetadata,
      other: otherMetadata,
    };

    const schema = schemaMap[assetType as keyof typeof schemaMap];
    if (!schema) {
      return { valid: false, error: `Unknown asset type: ${assetType}` };
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      return { valid: false, error: result.error.message };
    }

    return { valid: true, data: result.data };
  } catch {
    return { valid: false, error: 'Invalid JSON' };
  }
}

// Helper to serialize metadata
export function serializeMetadata(data: AssetMetadata): string {
  return JSON.stringify(data);
}
