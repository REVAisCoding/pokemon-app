import { RIFTCODEX_BASE_URL } from '@/config/riftcodex';
import { getScanApiUrl } from '@/services/scanApiService';
import { type CardPrice } from '@/types/cardGame';
import { type RiftboundCard } from '@/types/riftbound';
import { createUnavailablePrice, isPriceAvailable } from '@/utils/pricing';

type TcgApiDevPriceEntry = {
  printing?: string;
  market_price?: number | null;
  median_price?: number | null;
  low_price?: number | null;
  last_updated_at?: string | null;
};

type TcgApiDevCardResponse = {
  data?: {
    prices?: TcgApiDevPriceEntry[];
  };
};

type BackendPriceResponse = {
  price: CardPrice | null;
};

const priceCache = new Map<string, CardPrice>();
const tcgplayerIdCache = new Map<string, string>();

function cacheKey(tcgplayerId: string): string {
  return tcgplayerId.trim();
}

export function extractTcgApiDevPrice(
  prices: TcgApiDevPriceEntry[] | undefined,
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

async function fetchTcgplayerIdFromRiftcodex(riftboundId: string): Promise<string | null> {
  const cached = tcgplayerIdCache.get(riftboundId);

  if (cached) {
    return cached;
  }

  const response = await fetch(
    `${RIFTCODEX_BASE_URL}/cards/riftbound/${encodeURIComponent(riftboundId)}`,
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as RiftboundCard | RiftboundCard[];
  const card = Array.isArray(payload) ? payload[0] : payload;
  const tcgplayerId = card?.tcgplayer_id?.trim();

  if (!tcgplayerId) {
    return null;
  }

  tcgplayerIdCache.set(riftboundId, tcgplayerId);

  return tcgplayerId;
}

async function fetchPriceFromBackend(tcgplayerId: string): Promise<CardPrice> {
  const scanApiUrl = getScanApiUrl();
  const response = await fetch(`${scanApiUrl}/riftbound/price/${encodeURIComponent(tcgplayerId)}`);

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
): Promise<CardPrice> {
  const resolvedTcgplayerId = tcgplayerId?.trim() || (await fetchTcgplayerIdFromRiftcodex(riftboundId));

  if (!resolvedTcgplayerId) {
    return createUnavailablePrice('USD');
  }

  const key = cacheKey(resolvedTcgplayerId);
  const cached = priceCache.get(key);

  if (cached) {
    return cached;
  }

  const price = await fetchPriceFromBackend(resolvedTcgplayerId);
  priceCache.set(key, price);

  return price;
}

export function getTcgplayerIdFromRawData(rawData?: Record<string, unknown>): string | undefined {
  const tcgplayerId = rawData?.tcgplayer_id;

  return typeof tcgplayerId === 'string' && tcgplayerId.trim().length > 0
    ? tcgplayerId.trim()
    : undefined;
}
