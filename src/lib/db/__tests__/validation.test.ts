import { describe, expect, it } from 'vitest';
import { serializeMetadata, validateMetadata } from '../validation';

describe('Asset Metadata Validation', () => {
  describe('startup_equity', () => {
    it('validates valid startup equity metadata', () => {
      const metadata = { sharesOutstanding: 1000000, shareClass: 'Common' };
      const json = serializeMetadata(metadata);
      const result = validateMetadata('startup_equity', json);

      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data).toEqual(metadata);
      }
    });

    it('rejects negative shares outstanding', () => {
      const json = '{"sharesOutstanding": -100}';
      const result = validateMetadata('startup_equity', json);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBeTruthy();
      }
    });

    it('accepts empty metadata', () => {
      const json = '{}';
      const result = validateMetadata('startup_equity', json);

      expect(result.valid).toBe(true);
    });

    it('rejects extra fields in strict mode', () => {
      const json = '{"unknownField": "value"}';
      const result = validateMetadata('startup_equity', json);

      expect(result.valid).toBe(false);
    });
  });

  describe('fund', () => {
    it('validates valid fund metadata', () => {
      const metadata = {
        commitmentAmount: 100000,
        calledCapital: 50000,
        managementFee: 2.5,
      };
      const json = serializeMetadata(metadata);
      const result = validateMetadata('fund', json);

      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data).toEqual(metadata);
      }
    });

    it('rejects management fee over 100%', () => {
      const json = '{"managementFee": 150}';
      const result = validateMetadata('fund', json);

      expect(result.valid).toBe(false);
    });

    it('rejects management fee below 0%', () => {
      const json = '{"managementFee": -5}';
      const result = validateMetadata('fund', json);

      expect(result.valid).toBe(false);
    });
  });

  describe('state_obligation', () => {
    it('validates valid state obligation metadata', () => {
      const metadata = {
        bondType: 'Treasury Bond',
        maturityDate: '2030-12-31',
        couponRate: 3.5,
        faceValue: 10000,
      };
      const json = serializeMetadata(metadata);
      const result = validateMetadata('state_obligation', json);

      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data).toEqual(metadata);
      }
    });

    it('rejects negative coupon rate', () => {
      const json = '{"couponRate": -1}';
      const result = validateMetadata('state_obligation', json);

      expect(result.valid).toBe(false);
    });
  });

  describe('crypto', () => {
    it('validates valid crypto metadata', () => {
      const metadata = {
        walletAddress: '0x1234567890abcdef',
        network: 'Ethereum',
        stakingInfo: 'Staked on Lido',
      };
      const json = serializeMetadata(metadata);
      const result = validateMetadata('crypto', json);

      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data).toEqual(metadata);
      }
    });
  });

  describe('public_equity', () => {
    it('validates valid public equity metadata', () => {
      const metadata = {
        exchange: 'NYSE',
        sector: 'Technology',
        isin: 'US0378331005',
      };
      const json = serializeMetadata(metadata);
      const result = validateMetadata('public_equity', json);

      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data).toEqual(metadata);
      }
    });
  });

  describe('other', () => {
    it('validates valid other metadata', () => {
      const metadata = {
        customFields: { type: 'collectible', condition: 'mint' },
      };
      const json = serializeMetadata(metadata);
      const result = validateMetadata('other', json);

      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data).toEqual(metadata);
      }
    });
  });

  describe('edge cases', () => {
    it('accepts null metadata', () => {
      const result = validateMetadata('startup_equity', null);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data).toEqual({});
      }
    });

    it('rejects invalid JSON', () => {
      const result = validateMetadata('startup_equity', 'not valid json');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe('Invalid JSON');
      }
    });

    it('rejects unknown asset type', () => {
      const json = '{}';
      const result = validateMetadata('unknown_type', json);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain('Unknown asset type');
      }
    });
  });

  describe('serializeMetadata', () => {
    it('serializes metadata to JSON string', () => {
      const metadata = { sharesOutstanding: 1000000 };
      const json = serializeMetadata(metadata);
      expect(json).toBe('{"sharesOutstanding":1000000}');
    });

    it('handles empty object', () => {
      const json = serializeMetadata({});
      expect(json).toBe('{}');
    });
  });
});
