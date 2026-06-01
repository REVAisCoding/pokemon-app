import { isTcgDexSetId } from '@/utils/deriveSetIdFromCard';
import { type CollectionCard } from '@/types/collection-card';

export type SetMetadata = {
  setLogo?: string;
  setSymbol?: string;
  printedTotal?: number;
  total?: number;
};

const metadataCache = new Map<string, SetMetadata>();

async function fetchPokemonTcgSetMetadata(setId: string): Promise<SetMetadata | null> {
  const response = await fetch(`https://api.pokemontcg.io/v2/sets/${encodeURIComponent(setId)}`);

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    data?: {
      images?: { logo?: string; symbol?: string };
      printedTotal?: number;
      total?: number;
    };
  };

  const data = payload.data;

  if (!data) {
    return null;
  }

  return {
    ...(data.images?.logo ? { setLogo: data.images.logo } : {}),
    ...(data.images?.symbol ? { setSymbol: data.images.symbol } : {}),
    ...(data.printedTotal ? { printedTotal: data.printedTotal } : {}),
    ...(data.total ? { total: data.total } : {}),
  };
}

async function fetchTcgDexSetMetadata(setId: string): Promise<SetMetadata | null> {
  const response = await fetch(`https://api.tcgdex.net/v2/pt/sets/${encodeURIComponent(setId)}`);

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    logo?: string;
    symbol?: string;
    cardCount?: { official?: number; total?: number };
  };

  const printedTotal = data.cardCount?.official ?? data.cardCount?.total;

  return {
    ...(data.logo ? { setLogo: `${data.logo}.webp` } : {}),
    ...(data.symbol ? { setSymbol: `${data.symbol}.webp` } : {}),
    ...(printedTotal ? { printedTotal, total: data.cardCount?.total ?? printedTotal } : {}),
  };
}

export async function fetchSetMetadata(
  setId: string,
  cards: CollectionCard[],
): Promise<SetMetadata | null> {
  const cached = metadataCache.get(setId);

  if (cached) {
    return cached;
  }

  const preferTcgDex = isTcgDexSetId(setId, cards);
  const primaryFetcher = preferTcgDex ? fetchTcgDexSetMetadata : fetchPokemonTcgSetMetadata;
  const fallbackFetcher = preferTcgDex ? fetchPokemonTcgSetMetadata : fetchTcgDexSetMetadata;

  const metadata = (await primaryFetcher(setId)) ?? (await fallbackFetcher(setId));

  if (metadata) {
    metadataCache.set(setId, metadata);
  }

  return metadata;
}
