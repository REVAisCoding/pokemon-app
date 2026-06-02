export type ExchangeRates = {
  usdToBrl: number;
  eurToBrl: number;
  fetchedAt: string;
};

/** Fallback quando a API está indisponível e não há cache. */
export const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  usdToBrl: 5.75,
  eurToBrl: 6.35,
  fetchedAt: '',
};
