import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStorage } from '@/lib/storage/context';
import { AssetRepository } from '../asset';
import { ExchangeRateRepository } from '../exchange-rate';
import {
  useAssetRepository,
  useExchangeRateRepository,
  usePortfolioRepository,
  useTransactionRepository,
  useValuationRepository,
} from '../hooks';
import { PortfolioRepository } from '../portfolio';
import { TransactionRepository } from '../transaction';
import { ValuationRepository } from '../valuation';

vi.mock('@/lib/storage/context', () => ({
  useStorage: vi.fn(),
}));

describe('Repository Hooks', () => {
  const mockAdapter = {
    db: {},
    isConnected: () => true,
    getMode: () => 'local',
    connect: vi.fn(),
    disconnect: vi.fn(),
    migrate: vi.fn(),
    ping: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usePortfolioRepository', () => {
    it('returns repository when adapter is available', () => {
      vi.mocked(useStorage).mockReturnValue({
        adapter: mockAdapter as never,
        isLoading: false,
        error: null,
        mode: 'local',
        switchMode: vi.fn(),
      });

      const { result } = renderHook(() => usePortfolioRepository());

      expect(result.current).toBeInstanceOf(PortfolioRepository);
    });

    it('returns null when adapter is not available', () => {
      vi.mocked(useStorage).mockReturnValue({
        adapter: null,
        isLoading: true,
        error: null,
        mode: null,
        switchMode: vi.fn(),
      });

      const { result } = renderHook(() => usePortfolioRepository());

      expect(result.current).toBeNull();
    });

    it('memoizes repository instance', () => {
      vi.mocked(useStorage).mockReturnValue({
        adapter: mockAdapter as never,
        isLoading: false,
        error: null,
        mode: 'local',
        switchMode: vi.fn(),
      });

      const { result, rerender } = renderHook(() => usePortfolioRepository());
      const firstInstance = result.current;

      rerender();
      const secondInstance = result.current;

      expect(firstInstance).toBe(secondInstance);
    });
  });

  describe('useAssetRepository', () => {
    it('returns repository when adapter is available', () => {
      vi.mocked(useStorage).mockReturnValue({
        adapter: mockAdapter as never,
        isLoading: false,
        error: null,
        mode: 'local',
        switchMode: vi.fn(),
      });

      const { result } = renderHook(() => useAssetRepository());

      expect(result.current).toBeInstanceOf(AssetRepository);
    });

    it('returns null when adapter is not available', () => {
      vi.mocked(useStorage).mockReturnValue({
        adapter: null,
        isLoading: true,
        error: null,
        mode: null,
        switchMode: vi.fn(),
      });

      const { result } = renderHook(() => useAssetRepository());

      expect(result.current).toBeNull();
    });
  });

  describe('useTransactionRepository', () => {
    it('returns repository when adapter is available', () => {
      vi.mocked(useStorage).mockReturnValue({
        adapter: mockAdapter as never,
        isLoading: false,
        error: null,
        mode: 'local',
        switchMode: vi.fn(),
      });

      const { result } = renderHook(() => useTransactionRepository());

      expect(result.current).toBeInstanceOf(TransactionRepository);
    });

    it('returns null when adapter is not available', () => {
      vi.mocked(useStorage).mockReturnValue({
        adapter: null,
        isLoading: true,
        error: null,
        mode: null,
        switchMode: vi.fn(),
      });

      const { result } = renderHook(() => useTransactionRepository());

      expect(result.current).toBeNull();
    });
  });

  describe('useValuationRepository', () => {
    it('returns repository when adapter is available', () => {
      vi.mocked(useStorage).mockReturnValue({
        adapter: mockAdapter as never,
        isLoading: false,
        error: null,
        mode: 'local',
        switchMode: vi.fn(),
      });

      const { result } = renderHook(() => useValuationRepository());

      expect(result.current).toBeInstanceOf(ValuationRepository);
    });

    it('returns null when adapter is not available', () => {
      vi.mocked(useStorage).mockReturnValue({
        adapter: null,
        isLoading: true,
        error: null,
        mode: null,
        switchMode: vi.fn(),
      });

      const { result } = renderHook(() => useValuationRepository());

      expect(result.current).toBeNull();
    });
  });

  describe('useExchangeRateRepository', () => {
    it('returns repository when adapter is available', () => {
      vi.mocked(useStorage).mockReturnValue({
        adapter: mockAdapter as never,
        isLoading: false,
        error: null,
        mode: 'local',
        switchMode: vi.fn(),
      });

      const { result } = renderHook(() => useExchangeRateRepository());

      expect(result.current).toBeInstanceOf(ExchangeRateRepository);
    });

    it('returns null when adapter is not available', () => {
      vi.mocked(useStorage).mockReturnValue({
        adapter: null,
        isLoading: true,
        error: null,
        mode: null,
        switchMode: vi.fn(),
      });

      const { result } = renderHook(() => useExchangeRateRepository());

      expect(result.current).toBeNull();
    });
  });
});
