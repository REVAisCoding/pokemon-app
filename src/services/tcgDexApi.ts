import { type ScannedCard } from '@/constants/scan-data';
import { type ExtractedCardInfo } from '@/services/scanApiService';
import { pricingToCardPrice, type TcgDexPricing } from '@/utils/card-pricing';
import { fetchWithTimeout } from '@/utils/fetch-with-timeout';
import { isPriceAvailable } from '@/utils/pricing';

const TCGDEX_PT_BASE_URL = 'https://api.tcgdex.net/v2/pt';
const TCGDEX_EN_BASE_URL = 'https://api.tcgdex.net/v2/en';
const TCGDEX_SEARCH_PAGE_SIZE = 250;
const TCGDEX_MAX_SEARCH_PAGES = 5;
const TCGDEX_MAX_DETAIL_FETCH = 100;

type TcgDexLocale = 'pt' | 'en';

const PT_TYPE_TO_EN: Record<string, string> = {
  Dragão: 'Dragon',
  Elétrico: 'Lightning',
  Fada: 'Fairy',
  Fogo: 'Fire',
  Incolor: 'Colorless',
  Lutador: 'Fighting',
  Metal: 'Metal',
  Planta: 'Grass',
  Psíquico: 'Psychic',
  Sombrio: 'Darkness',
  Água: 'Water',
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

type TcgDexBriefCard = {
  id: string;
  localId: string;
  name: string;
  image?: string;
};

type TcgDexCard = TcgDexBriefCard & {
  types?: string[];
  rarity?: string;
  pricing?: TcgDexPricing;
  set?: {
    id?: string;
    name?: string;
    logo?: string;
    symbol?: string;
    cardCount?: {
      official?: number;
      total?: number;
    };
  };
};

function formatCardNumber(number: string, setTotal: number): string {
  return `#${number}/${setTotal}`;
}

function getAccentColor(type: string): string {
  const normalizedType = PT_TYPE_TO_EN[type] ?? type;
  return TYPE_ACCENT_COLORS[normalizedType] ?? '#6C63FF';
}

function mapTcgDexCardToScannedCard(card: TcgDexCard): ScannedCard {
  const type = card.types?.[0] ?? 'Unknown';
  const setTotal = card.set?.cardCount?.official ?? card.set?.cardCount?.total ?? 0;
  const imageBase = card.image ?? '';
  const price = pricingToCardPrice(card.pricing);

  const setId = card.set?.id ?? card.id.split('-')[0];

  return {
    id: `tcgdex-${card.id}`,
    name: card.name,
    setName: card.set?.name ?? 'Unknown',
    number: formatCardNumber(card.localId, setTotal),
    type,
    imageUrl: imageBase ? `${imageBase}/high.webp` : '',
    accentColor: getAccentColor(type),
    gameType: 'pokemon',
    ...(isPriceAvailable(price) ? { price } : {}),
    setId,
    setPrintedTotal: setTotal > 0 ? setTotal : undefined,
    ...(card.set?.logo ? { setLogo: `${card.set.logo}.webp` } : {}),
    ...(card.set?.symbol ? { setSymbol: `${card.set.symbol}.webp` } : {}),
    ...(card.rarity ? { rarity: card.rarity } : {}),
  };
}

let cachedSetReleaseTimestamps: Map<string, number> | null = null;

function getTcgDexBaseUrl(locale: TcgDexLocale): string {
  return locale === 'pt' ? TCGDEX_PT_BASE_URL : TCGDEX_EN_BASE_URL;
}

async function getSetReleaseTimestamps(): Promise<Map<string, number>> {
  if (cachedSetReleaseTimestamps) {
    return cachedSetReleaseTimestamps;
  }

  const response = await fetchWithTimeout(`${TCGDEX_EN_BASE_URL}/sets`);

  if (!response?.ok) {
    return new Map();
  }

  const sets = (await response.json()) as { id: string; releaseDate?: string }[];
  cachedSetReleaseTimestamps = new Map(
    sets.map((set) => [set.id, new Date(set.releaseDate ?? 0).getTime()]),
  );

  return cachedSetReleaseTimestamps;
}

function extractSetIdFromCardId(cardId: string): string {
  return cardId.split('-')[0] ?? cardId;
}

async function sortBriefCardsBySetRecency(cards: TcgDexBriefCard[]): Promise<TcgDexBriefCard[]> {
  const releaseDates = await getSetReleaseTimestamps();

  return [...cards].sort((left, right) => {
    const leftSetId = extractSetIdFromCardId(left.id);
    const rightSetId = extractSetIdFromCardId(right.id);
    const leftDate = releaseDates.get(leftSetId) ?? 0;
    const rightDate = releaseDates.get(rightSetId) ?? 0;

    if (leftDate !== rightDate) {
      return rightDate - leftDate;
    }

    return right.id.localeCompare(left.id);
  });
}

async function fetchTcgDexBriefCardsByName(
  locale: TcgDexLocale,
  name: string,
): Promise<TcgDexBriefCard[]> {
  const baseUrl = getTcgDexBaseUrl(locale);
  const allCards: TcgDexBriefCard[] = [];

  for (let page = 1; page <= TCGDEX_MAX_SEARCH_PAGES; page += 1) {
    const response = await fetchWithTimeout(
      `${baseUrl}/cards?name=${encodeURIComponent(name)}&pagination:page=${page}&pagination:itemsPerPage=${TCGDEX_SEARCH_PAGE_SIZE}`,
    );

    if (!response?.ok) {
      break;
    }

    const pageCards = (await response.json()) as TcgDexBriefCard[];
    allCards.push(...pageCards);

    if (pageCards.length < TCGDEX_SEARCH_PAGE_SIZE) {
      break;
    }
  }

  return allCards;
}

async function fetchTcgDexCardDetail(
  locale: TcgDexLocale,
  cardId: string,
): Promise<TcgDexCard | null> {
  const response = await fetchWithTimeout(`${getTcgDexBaseUrl(locale)}/cards/${cardId}`);

  if (!response?.ok) {
    return null;
  }

  return (await response.json()) as TcgDexCard;
}

async function searchCardsByNameWithLocale(
  locale: TcgDexLocale,
  name: string,
): Promise<ScannedCard[]> {
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return [];
  }

  const briefCards = await fetchTcgDexBriefCardsByName(locale, trimmedName);

  if (briefCards.length === 0) {
    return [];
  }

  const sortedBriefCards = await sortBriefCardsBySetRecency(briefCards);
  const detailedCards = await Promise.all(
    sortedBriefCards
      .slice(0, TCGDEX_MAX_DETAIL_FETCH)
      .map(async (brief) => fetchTcgDexCardDetail(locale, brief.id)),
  );

  return detailedCards
    .filter((card): card is TcgDexCard => card !== null)
    .map(mapTcgDexCardToScannedCard);
}

export async function searchCardsByNamePt(name: string): Promise<ScannedCard[]> {
  return searchCardsByNameWithLocale('pt', name);
}

export async function searchCardsByNameEn(name: string): Promise<ScannedCard[]> {
  return searchCardsByNameWithLocale('en', name);
}

function resolveTcgDexLocale(language: string | null | undefined): TcgDexLocale {
  const normalized = (language ?? '').toLowerCase();

  if (normalized.includes('english') || normalized.includes('ingl')) {
    return 'en';
  }

  return 'pt';
}

function localIdVariants(number: string | null | undefined): string[] {
  if (!number) {
    return [];
  }

  const trimmed = number.trim();
  const variants: string[] = [];

  for (const value of [trimmed, trimmed.replace(/^0+/, '') || '0', trimmed.padStart(3, '0')]) {
    if (!variants.includes(value)) {
      variants.push(value);
    }
  }

  return variants;
}

function getSearchNames(extracted: ExtractedCardInfo): string[] {
  const names: string[] = [];

  for (const value of [extracted.name, extracted.nameEnglish]) {
    const cleaned = value?.trim();

    if (cleaned && !names.includes(cleaned)) {
      names.push(cleaned);
    }
  }

  return names;
}

async function fetchTcgDexBriefCards(
  locale: TcgDexLocale,
  params: Record<string, string>,
): Promise<TcgDexBriefCard[]> {
  const query = new URLSearchParams(params).toString();
  const response = await fetchWithTimeout(`${getTcgDexBaseUrl(locale)}/cards?${query}`);

  if (!response?.ok) {
    return [];
  }

  return (await response.json()) as TcgDexBriefCard[];
}

async function searchCardsByExtractedInfoWithLocale(
  locale: TcgDexLocale,
  extracted: ExtractedCardInfo,
): Promise<ScannedCard[]> {
  const names = getSearchNames(extracted);

  if (names.length === 0) {
    return [];
  }

  const numberVariants = localIdVariants(extracted.number);
  const numberBriefs: TcgDexBriefCard[] = [];
  const nameBriefs: TcgDexBriefCard[] = [];
  const seenIds = new Set<string>();

  for (const name of names) {
    if (numberVariants.length > 0) {
      for (const localId of numberVariants) {
        const matches = await fetchTcgDexBriefCards(locale, { name, localId });

        for (const match of matches) {
          if (seenIds.has(match.id)) {
            continue;
          }

          seenIds.add(match.id);
          numberBriefs.push(match);
        }
      }
    }

    const matches = await fetchTcgDexBriefCards(locale, { name });

    for (const match of matches) {
      if (seenIds.has(match.id)) {
        continue;
      }

      seenIds.add(match.id);
      nameBriefs.push(match);
    }
  }

  const briefCards = numberBriefs.length > 0 ? numberBriefs : nameBriefs.slice(0, 20);
  const detailedCards = await Promise.all(
    briefCards.map(async (brief) => fetchTcgDexCardDetail(locale, brief.id)),
  );

  return detailedCards
    .filter((card): card is TcgDexCard => card !== null)
    .map(mapTcgDexCardToScannedCard);
}

export async function searchCardsByExtractedInfo(
  extracted: ExtractedCardInfo,
): Promise<ScannedCard[]> {
  const primaryLocale = resolveTcgDexLocale(extracted.language);
  const locales: TcgDexLocale[] =
    primaryLocale === 'pt' ? ['pt', 'en'] : ['en', 'pt'];

  const seenIds = new Set<string>();
  const pool: ScannedCard[] = [];

  for (const locale of locales) {
    const cards = await searchCardsByExtractedInfoWithLocale(locale, extracted);

    for (const card of cards) {
      if (seenIds.has(card.id)) {
        continue;
      }

      seenIds.add(card.id);
      pool.push(card);
    }
  }

  return pool;
}
