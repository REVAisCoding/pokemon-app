import { useNetworkStatus } from '@/hooks/use-network-status';
import { loadExchangeRates } from '@/services/exchangeRateService';
import { DEFAULT_EXCHANGE_RATES, type ExchangeRates } from '@/types/exchange-rates';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';

type ExchangeRateContextValue = {
  rates: ExchangeRates;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const ExchangeRateContext = createContext<ExchangeRateContextValue | null>(null);

type ExchangeRateProviderProps = {
  children: ReactNode;
};

export function ExchangeRateProvider({ children }: ExchangeRateProviderProps) {
  const isOnline = useNetworkStatus();
  const [rates, setRates] = useState<ExchangeRates>(DEFAULT_EXCHANGE_RATES);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);

    try {
      const nextRates = await loadExchangeRates({
        forceRefresh: forceRefresh && isOnline,
      });
      setRates(nextRates);
    } catch {
      // Keep the current rates on failure.
    } finally {
      setIsLoading(false);
    }
  }, [isOnline]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isOnline) {
      return;
    }

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void refresh();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isOnline, refresh]);

  const value = useMemo(
    () => ({
      rates,
      isLoading,
      refresh: () => refresh(true),
    }),
    [rates, isLoading, refresh],
  );

  return <ExchangeRateContext.Provider value={value}>{children}</ExchangeRateContext.Provider>;
}

export function useExchangeRates(): ExchangeRateContextValue {
  const context = useContext(ExchangeRateContext);

  if (!context) {
    throw new Error('useExchangeRates must be used within an ExchangeRateProvider');
  }

  return context;
}
