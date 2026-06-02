import { fetchRiftboundCardPrice, getTcgplayerIdFromRawData } from '@/services/riftboundPricingService';
import { type CardGameType, type CardPrice } from '@/types/cardGame';
import { pricingToCardPrice, type TcgDexPricing } from '@/utils/card-pricing';
import { inferGameTypeFromCardId } from '@/utils/collectionCardMigration';
import { fetchWithTimeout } from '@/utils/fetch-with-timeout';
import { priceToBrl } from '@/utils/pricing';
import { isRiftboundCardId as isRiftboundCardIdPattern } from '@/utils/riftboundCardId';

const TCGDEX_LOCALES = ['pt', 'en'] as const;

type TcgDexPricingResponse = {
  pricing?: TcgDexPricing;
};

export type FetchCardPriceOptions = {
  gameType?: CardGameType;
  tcgplayerId?: string;
  rawData?: Record<string, unknown>;
};

export function resolveTcgDexCardId(cardApiId: string): string {
  return cardApiId.startsWith('tcgdex-') ? cardApiId.slice('tcgdex-'.length) : cardApiId;
}


async function fetchTcgDexPricing(
  locale: (typeof TCGDEX_LOCALES)[number],
  tcgDexId: string,
): Promise<TcgDexPricing | null> {
  const response = await fetchWithTimeout(`https://api.tcgdex.net/v2/${locale}/cards/${tcgDexId}`);

  if (!response?.ok) {
    return null;
  }

  const payload = (await response.json()) as TcgDexPricingResponse;
  return payload.pricing ?? null;
}

async function fetchPokemonCardPrice(cardApiId: string): Promise<CardPrice> {
  const tcgDexId = resolveTcgDexCardId(cardApiId);

  for (const locale of TCGDEX_LOCALES) {
    const pricing = await fetchTcgDexPricing(locale, tcgDexId);
    const price = pricingToCardPrice(pricing);

    if (price.source !== 'unavailable') {
      return price;
    }
  }

  return pricingToCardPrice(null);
}

export async function fetchCardPrice(
  cardApiId: string,
  options?: FetchCardPriceOptions,
): Promise<CardPrice> {
  const gameType =
    options?.gameType ??
    (isRiftboundCardIdPattern(cardApiId) ? 'riftbound' : inferGameTypeFromCardId(cardApiId));

  if (gameType === 'riftbound') {
    const tcgplayerId =
      options?.tcgplayerId ?? getTcgplayerIdFromRawData(options?.rawData);

    return fetchRiftboundCardPrice(cardApiId, tcgplayerId, options?.rawData);
  }

  return fetchPokemonCardPrice(cardApiId);
}

/** @deprecated use fetchCardPrice */
export async function fetchEstimatedValueBrl(cardApiId: string): Promise<number | null> {
  const price = await fetchCardPrice(cardApiId);

  if (price.source === 'unavailable') {
    return null;
  }

  return priceToBrl(price);
}
