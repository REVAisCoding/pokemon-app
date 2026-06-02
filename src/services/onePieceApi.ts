import { CARD_GAME_CONFIG } from '@/config/cardGames';
import { type ScannedCard } from '@/constants/scan-data';
import { type CardPrice, type GameCard } from '@/types/cardGame';
import { type OptcgCard } from '@/types/onePiece';
import { fetchWithTimeout } from '@/utils/fetch-with-timeout';
import { isPriceAvailable } from '@/utils/pricing';

const OPTCG_API_BASE_URL = 'https://optcgapi.com/api';
const ONE_PIECE_SEARCH_MAX_RESULTS = 80;
const ONE_PIECE_CARD_ID_PREFIX = 'onepiece-';

function buildOnePieceCardId(cardImageId: string): string {
  return `${ONE_PIECE_CARD_ID_PREFIX}${cardImageId}`;
}

function formatCollectorNumber(cardSetId: string): string {
  return cardSetId.startsWith('#') ? cardSetId : `#${cardSetId}`;
}

function formatCardType(card: OptcgCard): string {
  const color = card.card_color?.trim();
  const type = card.card_type?.trim();

  if (color && type) {
    return `${type} · ${color}`;
  }

  return type || color || '';
}

function parseOptcgPriceValue(value?: number | null): number | undefined {
  if (value == null) {
    return undefined;
  }

  if (Number.isNaN(value) || value <= 0) {
    return undefined;
  }

  return value;
}

export function extractOptcgPrice(card: OptcgCard): CardPrice | undefined {
  const amount = parseOptcgPriceValue(card.market_price) ?? parseOptcgPriceValue(card.inventory_price);

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

export function mapOnePieceCardToGameCard(card: OptcgCard): GameCard {
  const price = extractOptcgPrice(card);

  return {
    id: buildOnePieceCardId(card.card_image_id),
    gameType: 'onepiece',
    name: card.card_name,
    imageUrl: card.card_image,
    setId: card.set_id,
    setName: card.set_name,
    number: formatCollectorNumber(card.card_set_id),
    rarity: card.rarity,
    type: formatCardType(card),
    quantity: 1,
    ...(price ? { price } : {}),
    rawData: card as unknown as Record<string, unknown>,
  };
}

function rankNameMatch(name: string, query: string): number {
  const normalizedName = normalizeSearchText(name);
  const normalizedQuery = normalizeSearchText(query);

  if (normalizedName === normalizedQuery) {
    return 0;
  }

  if (normalizedName.startsWith(normalizedQuery)) {
    return 1;
  }

  return 2;
}

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function rankOnePieceCandidates(cards: OptcgCard[], query: string): OptcgCard[] {
  return [...cards].sort((left, right) => {
    const scoreDiff = rankNameMatch(left.card_name, query) - rankNameMatch(right.card_name, query);

    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return left.card_name.localeCompare(right.card_name);
  });
}

function getOptcgFilteredSearchUrl(name: string): string {
  const searchParams = new URLSearchParams({
    card_name: name.trim(),
  });

  return `${OPTCG_API_BASE_URL}/sets/filtered/?${searchParams.toString()}`;
}

async function fetchOptcgCardsByName(name: string): Promise<OptcgCard[]> {
  const query = name.trim();

  if (!query) {
    return [];
  }

  const response = await fetchWithTimeout(getOptcgFilteredSearchUrl(query));

  if (!response?.ok) {
    throw new Error('Não foi possível buscar cartas de One Piece. Tente novamente.');
  }

  const payload: unknown = await response.json();

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload as OptcgCard[];
}

export type OnePieceScanHints = {
  collectorNumber?: string | null;
  setId?: string | null;
  setName?: string | null;
};

function normalizeCollectorNumber(value?: string | null): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const digits = value.replace(/^#/, '').split('/')[0]?.replace(/\D/g, '');

  if (!digits) {
    return undefined;
  }

  return digits.replace(/^0+/, '') || '0';
}

function normalizeOnePieceSetId(value?: string | null): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const compact = value.trim().toUpperCase().replace(/\s+/g, '');
  const codeMatch = compact.match(/^OP-?(\d{1,2})$/i);

  if (codeMatch) {
    return `OP-${codeMatch[1].padStart(2, '0')}`;
  }

  return value.trim();
}

function extractCollectorFromCardSetId(cardSetId: string): string | undefined {
  const suffix = cardSetId.split('-').pop();

  if (!suffix) {
    return undefined;
  }

  const digits = suffix.replace(/\D/g, '');

  if (!digits) {
    return undefined;
  }

  return digits.replace(/^0+/, '') || '0';
}

function scoreOnePieceCandidate(card: OptcgCard, hints?: OnePieceScanHints): number {
  let score = 0;
  const setId = normalizeOnePieceSetId(hints?.setId);
  const setName = hints?.setName?.trim().toLowerCase();
  const collectorNumber = normalizeCollectorNumber(hints?.collectorNumber);
  const cardCollector = extractCollectorFromCardSetId(card.card_set_id);

  if (setId && card.set_id.toUpperCase() === setId.toUpperCase()) {
    score += 10;
  }

  if (setName && card.set_name.toLowerCase().includes(setName)) {
    score += 8;
  }

  if (collectorNumber && cardCollector === collectorNumber) {
    score += 5;
  }

  return score;
}

function rankOnePieceScanCandidates(
  cards: OptcgCard[],
  query: string,
  hints?: OnePieceScanHints,
): OptcgCard[] {
  const nameRanked = rankOnePieceCandidates(cards, query);

  if (!hints?.setId && !hints?.setName && !hints?.collectorNumber) {
    return nameRanked;
  }

  return [...nameRanked].sort((left, right) => {
    const scoreDiff = scoreOnePieceCandidate(right, hints) - scoreOnePieceCandidate(left, hints);

    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return rankNameMatch(left.card_name, query) - rankNameMatch(right.card_name, query);
  });
}

export async function searchOnePieceCardsByName(name: string): Promise<GameCard[]> {
  const cards = await fetchOptcgCardsByName(name);
  const ranked = rankOnePieceCandidates(cards, name.trim()).slice(0, ONE_PIECE_SEARCH_MAX_RESULTS);

  return ranked.map(mapOnePieceCardToGameCard);
}

export async function searchOnePieceCardsForRecognition(
  name: string,
  hints?: OnePieceScanHints,
): Promise<GameCard[]> {
  const query = name.trim();

  if (!query) {
    return [];
  }

  const cards = await fetchOptcgCardsByName(query);
  const ranked = rankOnePieceScanCandidates(cards, query, hints).slice(0, ONE_PIECE_SEARCH_MAX_RESULTS);

  return ranked.map(mapOnePieceCardToGameCard);
}

export function onePieceGameCardToScannedCard(card: GameCard): ScannedCard {
  return {
    id: card.id,
    name: card.name,
    setName: card.setName ?? '',
    number: card.number ?? card.id,
    type: card.type ?? '',
    imageUrl: card.imageUrl,
    accentColor: CARD_GAME_CONFIG.onepiece.themeColor,
    gameType: 'onepiece',
    ...(card.setId ? { setId: card.setId } : {}),
    ...(card.rarity ? { rarity: card.rarity } : {}),
    ...(isPriceAvailable(card.price) ? { price: card.price } : {}),
  };
}
