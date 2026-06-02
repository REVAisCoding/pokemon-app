import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_EXCHANGE_RATES, type ExchangeRates } from '@/types/exchange-rates';

const EXCHANGE_RATES_STORAGE_KEY = '@pokemon_app/exchange_rates';
const AWESOME_API_URL = 'https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL';
const CACHE_TTL_MS = 30 * 60 * 1000;

type AwesomeApiQuote = {
  bid?: string;
};

type AwesomeApiResponse = {
  USDBRL?: AwesomeApiQuote;
  EURBRL?: AwesomeApiQuote;
};

function parseAwesomeApiResponse(payload: AwesomeApiResponse): ExchangeRates | null {
  const usdToBrl = Number(payload.USDBRL?.bid);
  const eurToBrl = Number(payload.EURBRL?.bid);

  if (
    Number.isNaN(usdToBrl) ||
    Number.isNaN(eurToBrl) ||
    usdToBrl <= 0 ||
    eurToBrl <= 0
  ) {
    return null;
  }

  return {
    usdToBrl,
    eurToBrl,
    fetchedAt: new Date().toISOString(),
  };
}

function isCacheFresh(rates: ExchangeRates): boolean {
  if (!rates.fetchedAt) {
    return false;
  }

  const fetchedAtMs = Date.parse(rates.fetchedAt);

  if (Number.isNaN(fetchedAtMs)) {
    return false;
  }

  return Date.now() - fetchedAtMs < CACHE_TTL_MS;
}

async function readCachedExchangeRates(): Promise<ExchangeRates | null> {
  try {
    const rawValue = await AsyncStorage.getItem(EXCHANGE_RATES_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsed: unknown = JSON.parse(rawValue);

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as ExchangeRates).usdToBrl !== 'number' ||
      typeof (parsed as ExchangeRates).eurToBrl !== 'number' ||
      typeof (parsed as ExchangeRates).fetchedAt !== 'string'
    ) {
      return null;
    }

    return parsed as ExchangeRates;
  } catch {
    return null;
  }
}

async function writeCachedExchangeRates(rates: ExchangeRates): Promise<void> {
  await AsyncStorage.setItem(EXCHANGE_RATES_STORAGE_KEY, JSON.stringify(rates));
}

export async function fetchExchangeRatesFromApi(): Promise<ExchangeRates | null> {
  const response = await fetch(AWESOME_API_URL);

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as AwesomeApiResponse;
  const rates = parseAwesomeApiResponse(payload);

  if (!rates) {
    return null;
  }

  await writeCachedExchangeRates(rates);

  return rates;
}

export async function loadExchangeRates(options?: { forceRefresh?: boolean }): Promise<ExchangeRates> {
  const cached = await readCachedExchangeRates();

  if (cached && isCacheFresh(cached) && !options?.forceRefresh) {
    return cached;
  }

  try {
    const fetched = await fetchExchangeRatesFromApi();

    if (fetched) {
      return fetched;
    }
  } catch {
    // Fall back to cache or defaults below.
  }

  if (cached) {
    return cached;
  }

  return DEFAULT_EXCHANGE_RATES;
}
