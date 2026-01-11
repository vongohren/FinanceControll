import { useMemo } from 'react';
import { useStorage } from '@/lib/storage/context';
import { AssetRepository } from './asset';
import { ExchangeRateRepository } from './exchange-rate';
import { PortfolioRepository } from './portfolio';
import { TransactionRepository } from './transaction';
import { ValuationRepository } from './valuation';

export function usePortfolioRepository() {
  const { adapter } = useStorage();

  return useMemo(() => {
    if (!adapter) return null;
    return new PortfolioRepository(adapter);
  }, [adapter]);
}

export function useAssetRepository() {
  const { adapter } = useStorage();

  return useMemo(() => {
    if (!adapter) return null;
    return new AssetRepository(adapter);
  }, [adapter]);
}

export function useTransactionRepository() {
  const { adapter } = useStorage();

  return useMemo(() => {
    if (!adapter) return null;
    return new TransactionRepository(adapter);
  }, [adapter]);
}

export function useValuationRepository() {
  const { adapter } = useStorage();

  return useMemo(() => {
    if (!adapter) return null;
    return new ValuationRepository(adapter);
  }, [adapter]);
}

export function useExchangeRateRepository() {
  const { adapter } = useStorage();

  return useMemo(() => {
    if (!adapter) return null;
    return new ExchangeRateRepository(adapter);
  }, [adapter]);
}
