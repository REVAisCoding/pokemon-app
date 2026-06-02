import { getScanApiUrl } from '@/services/scanApiService';
import { type CardPrice } from '@/types/cardGame';
import { createUnavailablePrice, isPriceAvailable } from '@/utils/pricing';
import { extractRiftboundSetIdFromRawData } from '@/utils/riftboundCardId';

type BackendPriceResponse = {
  price: CardPrice | null;
};

const priceCache = new Map<string, CardPrice>();

function cacheKey(riftboundId: string, tcgplayerId?: string): string {
  return `${riftboundId}:${tcgplayerId?.trim() ?? ''}`;
}

function buildPriceQueryParams(
  tcgplayerId?: string,
  rawData?: Record<string, unknown>,
): URLSearchParams {
  const params = new URLSearchParams();

  if (tcgplayerId?.trim()) {
    params.set('tcgplayer_id', tcgplayerId.trim());
  }

  const name = rawData?.name;
  if (typeof name === 'string' && name.trim()) {
    params.set('name', name.trim());
  }

  const setId = extractRiftboundSetIdFromRawData(rawData);
  if (setId) {
    params.set('set_id', setId);
  }

  return params;
}

async function fetchPriceFromBackend(
  riftboundId: string,
  tcgplayerId?: string,
  rawData?: Record<string, unknown>,
): Promise<CardPrice> {
  const scanApiUrl = getScanApiUrl();
  const params = buildPriceQueryParams(tcgplayerId, rawData);
  const query = params.toString();
  const url = `${scanApiUrl}/riftbound/price/by-id/${encodeURIComponent(riftboundId)}${
    query ? `?${query}` : ''
  }`;

  const response = await fetch(url);

  if (response.status === 503) {
    return createUnavailablePrice('USD');
  }

  if (!response.ok) {
    return createUnavailablePrice('USD');
  }

  const payload = (await response.json()) as BackendPriceResponse;

  if (!payload.price || !isPriceAvailable(payload.price)) {
    return createUnavailablePrice('USD');
  }

  return payload.price;
}

export async function fetchRiftboundCardPrice(
  riftboundId: string,
  tcgplayerId?: string,
  rawData?: Record<string, unknown>,
): Promise<CardPrice> {
  const key = cacheKey(riftboundId, tcgplayerId);
  const cached = priceCache.get(key);

  if (cached && isPriceAvailable(cached)) {
    return cached;
  }

  const price = await fetchPriceFromBackend(riftboundId, tcgplayerId, rawData);

  if (isPriceAvailable(price)) {
    priceCache.set(key, price);
  }

  return price;
}

export function getTcgplayerIdFromRawData(rawData?: Record<string, unknown>): string | undefined {
  const tcgplayerId = rawData?.tcgplayer_id;

  return typeof tcgplayerId === 'string' && tcgplayerId.trim().length > 0
    ? tcgplayerId.trim()
    : undefined;
}

/** @deprecated kept for tests — prefer backend proxy */
export function extractTcgApiDevPrice(
  prices: Array<{
    market_price?: number | null;
    median_price?: number | null;
    low_price?: number | null;
    last_updated_at?: string | null;
  }> | undefined,
  updatedAt?: string | null,
): CardPrice {
  if (!prices || prices.length === 0) {
    return createUnavailablePrice('USD');
  }

  for (const entry of prices) {
    if (typeof entry.market_price === 'number' && entry.market_price > 0) {
      return {
        amount: entry.market_price,
        currency: 'USD',
        source: 'tcgplayer',
        updatedAt: entry.last_updated_at ?? updatedAt ?? new Date().toISOString(),
      };
    }
  }

  for (const entry of prices) {
    if (typeof entry.median_price === 'number' && entry.median_price > 0) {
      return {
        amount: entry.median_price,
        currency: 'USD',
        source: 'tcgplayer',
        updatedAt: entry.last_updated_at ?? updatedAt ?? new Date().toISOString(),
      };
    }
  }

  for (const entry of prices) {
    if (typeof entry.low_price === 'number' && entry.low_price > 0) {
      return {
        amount: entry.low_price,
        currency: 'USD',
        source: 'tcgplayer',
        updatedAt: entry.last_updated_at ?? updatedAt ?? new Date().toISOString(),
      };
    }
  }

  return createUnavailablePrice('USD');
}
