import { type ScannedCard } from '@/constants/scan-data';

import { fetchCardPrice } from '@/services/cardPricingService';
import { searchCardsByNameEn, searchCardsByNamePt } from '@/services/tcgDexApi';
import { extractPokemonTcgApiPrice, isPriceAvailable } from '@/utils/pricing';

const API_BASE_URL = 'https://api.pokemontcg.io/v2';

type PokemonTcgSet = {
  id: string;
  name: string;
  total: number;
  printedTotal?: number;
  images?: {
    symbol?: string;
    logo?: string;
  };
};

type PokemonTcgCard = {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  types?: string[];
  images: {
    small: string;
    large: string;
  };
  set: PokemonTcgSet;
  tcgplayer?: {
    prices?: {
      holofoil?: { market?: number | null };
      normal?: { market?: number | null };
      reverseHolofoil?: { market?: number | null };
    };
  };
  cardmarket?: {
    prices?: {
      averageSellPrice?: number | null;
    };
  };
};

type PokemonTcgCardsResponse = {
  data: PokemonTcgCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
};

const TYPE_ACCENT_COLORS: Record<string, string> = {
  Colorless: '#A8A878',
  Darkness: '#705848',
  Dragon: '#7038F8',
  Fairy: '#EE99AC',
  Fighting: '#C03028',
  Fire: '#F08030',
  Grass: '#78C850',
  Lightning: '#F7D046',
  Metal: '#B8B8D0',
  Psychic: '#F85888',
  Water: '#6890F0',
};

function formatCardNumber(number: string, setTotal: number): string {
  return `#${number}/${setTotal}`;
}

function getCardType(types?: string[]): string {
  return types?.[0] ?? 'Unknown';
}

function getAccentColor(type: string): string {
  return TYPE_ACCENT_COLORS[type] ?? '#6C63FF';
}

export function mapPokemonTcgCardToScannedCard(card: PokemonTcgCard): ScannedCard {
  const type = getCardType(card.types);
  const price = extractPokemonTcgApiPrice(card);

  return {
    id: card.id,
    name: card.name,
    setName: card.set.name,
    number: formatCardNumber(card.number, card.set.total),
    type,
    imageUrl: card.images.large || card.images.small,
    accentColor: getAccentColor(type),
    gameType: 'pokemon',
    ...(isPriceAvailable(price) ? { price } : {}),
    setId: card.set.id,
    setPrintedTotal: card.set.printedTotal ?? card.set.total,
    ...(card.set.images?.logo ? { setLogo: card.set.images.logo } : {}),
    ...(card.set.images?.symbol ? { setSymbol: card.set.images.symbol } : {}),
    ...(card.rarity ? { rarity: card.rarity } : {}),
  };
}

const POKEMON_TCG_PAGE_SIZE = 250;
const POKEMON_TCG_MAX_PAGES = 3;

async function searchPokemonTcgByName(name: string): Promise<ScannedCard[]> {
  const query = encodeURIComponent(`name:${name}*`);
  const allCards: PokemonTcgCard[] = [];

  for (let page = 1; page <= POKEMON_TCG_MAX_PAGES; page += 1) {
    const response = await fetch(
      `${API_BASE_URL}/cards?q=${query}&page=${page}&pageSize=${POKEMON_TCG_PAGE_SIZE}`,
    );

    if (!response.ok) {
      throw new Error('Não foi possível buscar cartas. Tente novamente.');
    }

    const payload = (await response.json()) as PokemonTcgCardsResponse;
    allCards.push(...payload.data);

    if (allCards.length >= payload.totalCount || payload.data.length < POKEMON_TCG_PAGE_SIZE) {
      break;
    }
  }

  return allCards.map(mapPokemonTcgCardToScannedCard);
}

export async function searchCardsByName(name: string): Promise<ScannedCard[]> {
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return [];
  }

  try {
    const portugueseResults = await searchCardsByNamePt(trimmedName);
    if (portugueseResults.length > 0) {
      return portugueseResults;
    }

    const englishTcgDexResults = await searchCardsByNameEn(trimmedName);
    if (englishTcgDexResults.length > 0) {
      return englishTcgDexResults;
    }
  } catch {
    // TCGDex indisponível — segue para Pokémon TCG API.
  }

  const englishResults = await searchPokemonTcgByName(trimmedName);

  return enrichCardsWithPrice(englishResults);
}

async function enrichCardsWithPrice(cards: ScannedCard[]): Promise<ScannedCard[]> {
  return Promise.all(
    cards.map(async (card) => {
      if (isPriceAvailable(card.price)) {
        return card;
      }

      try {
        const price = await fetchCardPrice(card.id);

        if (!isPriceAvailable(price)) {
          return card;
        }

        return { ...card, price };
      } catch {
        return card;
      }
    }),
  );
}
