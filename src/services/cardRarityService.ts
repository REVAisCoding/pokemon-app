import { RIFTCODEX_BASE_URL } from '@/config/riftcodex';
import { resolveTcgDexCardId } from '@/services/cardPricingService';
import { type CardGameType } from '@/types/cardGame';
import { type RiftboundCard } from '@/types/riftbound';
import { inferGameTypeFromCardId } from '@/utils/collectionCardMigration';

const TCGDEX_LOCALES = ['pt', 'en'] as const;
const POKEMON_TCG_API_URL = 'https://api.pokemontcg.io/v2';

type TcgDexRarityResponse = {
  rarity?: string;
};

type PokemonTcgRarityResponse = {
  data?: {
    rarity?: string;
  };
};

async function fetchTcgDexRarity(
  locale: (typeof TCGDEX_LOCALES)[number],
  tcgDexId: string,
): Promise<string | null> {
  const response = await fetch(`https://api.tcgdex.net/v2/${locale}/cards/${tcgDexId}`);

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as TcgDexRarityResponse;
  return payload.rarity?.trim() || null;
}

async function fetchPokemonTcgRarity(cardApiId: string): Promise<string | null> {
  const response = await fetch(`${POKEMON_TCG_API_URL}/cards/${encodeURIComponent(cardApiId)}`);

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as PokemonTcgRarityResponse;
  return payload.data?.rarity?.trim() || null;
}

async function fetchRiftboundRarity(riftboundId: string): Promise<string | null> {
  const response = await fetch(
    `${RIFTCODEX_BASE_URL}/cards/riftbound/${encodeURIComponent(riftboundId)}`,
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as RiftboundCard | RiftboundCard[];
  const card = Array.isArray(payload) ? payload[0] : payload;

  return card?.classification?.rarity?.trim() || null;
}

export async function fetchCardRarity(
  cardApiId: string,
  gameType?: CardGameType,
): Promise<string | null> {
  const resolvedGameType = gameType ?? inferGameTypeFromCardId(cardApiId);

  if (resolvedGameType === 'riftbound') {
    return fetchRiftboundRarity(cardApiId);
  }

  const tcgDexId = resolveTcgDexCardId(cardApiId);

  for (const locale of TCGDEX_LOCALES) {
    const rarity = await fetchTcgDexRarity(locale, tcgDexId);

    if (rarity) {
      return rarity;
    }
  }

  if (!cardApiId.startsWith('tcgdex-')) {
    return fetchPokemonTcgRarity(cardApiId);
  }

  return null;
}
