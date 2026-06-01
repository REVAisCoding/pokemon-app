import { CARD_GAME_CONFIG } from '@/config/cardGames';
import { type ScannedCard } from '@/constants/scan-data';
import {
  type ScryfallCard,
  type ScryfallCardsResponse,
  type ScryfallErrorResponse,
} from '@/types/magic';
import { type CardPrice, type GameCard } from '@/types/cardGame';
import { isPriceAvailable } from '@/utils/pricing';

const SCRYFALL_API_BASE_URL = 'https://api.scryfall.com';
const SCRYFALL_USER_AGENT = 'PokemonApp/1.0 (card-collection-app)';

function buildMagicCardId(scryfallId: string): string {
  return `magic-${scryfallId}`;
}

function formatCollectorNumber(collectorNumber: string): string {
  return collectorNumber.startsWith('#') ? collectorNumber : `#${collectorNumber}`;
}

function formatRarity(rarity: string): string {
  if (!rarity) {
    return rarity;
  }

  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

function parseScryfallPriceValue(value?: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseFloat(value);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

export function extractScryfallPrice(prices?: ScryfallCard['prices']): CardPrice | undefined {
  if (!prices) {
    return undefined;
  }

  const amount =
    parseScryfallPriceValue(prices.usd) ??
    parseScryfallPriceValue(prices.usd_foil) ??
    parseScryfallPriceValue(prices.usd_etched);

  if (amount == null) {
    return undefined;
  }

  return {
    amount,
    currency: 'USD',
    source: 'tcgplayer',
    updatedAt: new Date().toISOString(),
  };
}

export function resolveScryfallImageUrl(card: ScryfallCard): string {
  const topLevelImage =
    card.image_uris?.normal ?? card.image_uris?.large ?? card.image_uris?.small;

  if (topLevelImage) {
    return topLevelImage;
  }

  const firstFace = card.card_faces?.[0];
  const faceImage =
    firstFace?.image_uris?.normal ??
    firstFace?.image_uris?.large ??
    firstFace?.image_uris?.small;

  if (faceImage) {
    return faceImage;
  }

  return `${SCRYFALL_API_BASE_URL}/cards/${card.id}?format=image&version=normal`;
}

export function mapMagicCardToGameCard(card: ScryfallCard): GameCard {
  const price = extractScryfallPrice(card.prices);
  const type = card.type_line ?? card.card_faces?.[0]?.type_line ?? '';

  return {
    id: buildMagicCardId(card.id),
    gameType: 'magic',
    name: card.name,
    imageUrl: resolveScryfallImageUrl(card),
    setId: card.set,
    setName: card.set_name,
    number: formatCollectorNumber(card.collector_number),
    rarity: formatRarity(card.rarity),
    type,
    quantity: 1,
    ...(price ? { price } : {}),
    rawData: card as unknown as Record<string, unknown>,
  };
}

function isScryfallErrorResponse(payload: unknown): payload is ScryfallErrorResponse {
  return (
    typeof payload === 'object' &&
    payload != null &&
    'object' in payload &&
    (payload as ScryfallErrorResponse).object === 'error'
  );
}

async function fetchScryfallCards(query: string): Promise<ScryfallCard[]> {
  const searchParams = new URLSearchParams({
    q: query,
    unique: 'cards',
    order: 'name',
  });

  const response = await fetch(`${SCRYFALL_API_BASE_URL}/cards/search?${searchParams.toString()}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': SCRYFALL_USER_AGENT,
    },
  });

  const payload: unknown = await response.json();

  if (response.status === 404 && isScryfallErrorResponse(payload) && payload.code === 'not_found') {
    return [];
  }

  if (!response.ok) {
    const details =
      isScryfallErrorResponse(payload) && payload.details
        ? payload.details
        : 'Não foi possível buscar cartas de Magic. Tente novamente.';

    throw new Error(details);
  }

  const data = payload as ScryfallCardsResponse;

  if (!Array.isArray(data.data)) {
    return [];
  }

  return data.data;
}

export type MagicScanHints = {
  collectorNumber?: string | null;
  setCode?: string | null;
};

function normalizeCollectorNumber(value?: string | null): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  return value.replace(/^#/, '').split('/')[0]?.trim().toLowerCase();
}

function normalizeSetCode(value?: string | null): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  return value.trim().toLowerCase();
}

function scoreMagicCandidate(card: ScryfallCard, hints?: MagicScanHints): number {
  let score = 0;
  const setCode = normalizeSetCode(hints?.setCode);
  const collectorNumber = normalizeCollectorNumber(hints?.collectorNumber);

  if (setCode && card.set.toLowerCase() === setCode) {
    score += 10;
  }

  if (collectorNumber && card.collector_number.toLowerCase() === collectorNumber) {
    score += 5;
  }

  return score;
}

function rankMagicCandidates(cards: ScryfallCard[], hints?: MagicScanHints): ScryfallCard[] {
  if (!hints?.setCode && !hints?.collectorNumber) {
    return cards;
  }

  return [...cards].sort((left, right) => {
    const scoreDiff = scoreMagicCandidate(right, hints) - scoreMagicCandidate(left, hints);

    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return left.name.localeCompare(right.name);
  });
}

function buildScryfallSearchQuery(name: string, hints?: MagicScanHints): string {
  const trimmedName = name.trim();
  const setCode = normalizeSetCode(hints?.setCode);
  const collectorNumber = normalizeCollectorNumber(hints?.collectorNumber);

  if (setCode && collectorNumber) {
    return `!"${trimmedName}" set:${setCode} cn:${collectorNumber}`;
  }

  if (setCode) {
    return `!"${trimmedName}" set:${setCode}`;
  }

  return trimmedName;
}

export async function searchMagicCardsByName(name: string): Promise<GameCard[]> {
  const query = name.trim();

  if (!query) {
    return [];
  }

  const cards = await fetchScryfallCards(query);

  return cards.map(mapMagicCardToGameCard);
}

export async function searchMagicCardsForRecognition(
  name: string,
  hints?: MagicScanHints,
): Promise<GameCard[]> {
  const query = name.trim();

  if (!query) {
    return [];
  }

  const scryfallQuery = buildScryfallSearchQuery(query, hints);
  let cards = await fetchScryfallCards(scryfallQuery);

  if (cards.length === 0 && scryfallQuery !== query) {
    cards = await fetchScryfallCards(query);
  }

  return rankMagicCandidates(cards, hints).map(mapMagicCardToGameCard);
}

export function magicGameCardToScannedCard(card: GameCard): ScannedCard {
  const tcgplayerId =
    typeof card.rawData?.tcgplayer_id === 'number'
      ? String(card.rawData.tcgplayer_id)
      : undefined;

  return {
    id: card.id,
    name: card.name,
    setName: card.setName ?? '',
    number: card.number ?? card.id,
    type: card.type ?? '',
    imageUrl: card.imageUrl,
    accentColor: CARD_GAME_CONFIG.magic.themeColor,
    gameType: 'magic',
    ...(card.setId ? { setId: card.setId } : {}),
    ...(card.rarity ? { rarity: card.rarity } : {}),
    ...(tcgplayerId ? { tcgplayerId } : {}),
    ...(isPriceAvailable(card.price) ? { price: card.price } : {}),
  };
}
