import { type CardGameType, type CardPrice, type GameCard } from '@/types/cardGame';
import { type CollectionCard } from '@/types/collection-card';
import {
  isPriceAvailable,
  isStoredCardPrice,
  migrateLegacyEstimatedValueBrl,
  getCardPrice,
} from '@/utils/pricing';
import { getCardRarity } from '@/utils/card-rarity';
import { deriveSetIdFromCard } from '@/utils/deriveSetIdFromCard';
import {
  extractRiftboundSetCode,
  extractRiftboundSetIdFromRawData,
  extractRiftboundSetSize,
  isRiftboundCardId,
} from '@/utils/riftboundCardId';

const DEFAULT_GAME_TYPE: CardGameType = 'pokemon';
const MAGIC_CARD_ID_PREFIX = 'magic-';
const SCRYFALL_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type CardGameTypeHints = {
  id: string;
  gameType?: CardGameType | string;
  imageUrl?: string;
  type?: string;
  rawData?: Record<string, unknown>;
};

function isMagicCardId(cardId: string): boolean {
  return cardId.startsWith(MAGIC_CARD_ID_PREFIX);
}

function isScryfallUuid(value: string): boolean {
  return SCRYFALL_UUID_PATTERN.test(value.trim());
}

function extractScryfallUuid(card: CardGameTypeHints): string | null {
  if (isMagicCardId(card.id)) {
    const scryfallId = card.id.slice(MAGIC_CARD_ID_PREFIX.length);

    return isScryfallUuid(scryfallId) ? scryfallId.toLowerCase() : null;
  }

  if (isScryfallUuid(card.id)) {
    return card.id.trim().toLowerCase();
  }

  const rawScryfallId = card.rawData?.id;

  if (typeof rawScryfallId === 'string' && isScryfallUuid(rawScryfallId)) {
    return rawScryfallId.trim().toLowerCase();
  }

  return null;
}

function isScryfallImageUrl(imageUrl?: string): boolean {
  if (!imageUrl?.trim()) {
    return false;
  }

  return /scryfall\.(io|com)/i.test(imageUrl);
}

function isScryfallRawData(rawData?: Record<string, unknown>): boolean {
  if (!rawData) {
    return false;
  }

  return (
    rawData.object === 'card' &&
    typeof rawData.set === 'string' &&
    typeof rawData.collector_number === 'string'
  );
}

function buildMagicCardId(scryfallId: string): string {
  return `${MAGIC_CARD_ID_PREFIX}${scryfallId.toLowerCase()}`;
}

function canonicalizeMagicCardId(card: CardGameTypeHints): string {
  const scryfallId = extractScryfallUuid(card);

  if (scryfallId) {
    return buildMagicCardId(scryfallId);
  }

  return card.id;
}

export function inferGameTypeFromCardId(cardId: string): CardGameType {
  if (isRiftboundCardId(cardId)) {
    return 'riftbound';
  }

  if (isMagicCardId(cardId) || isScryfallUuid(cardId)) {
    return 'magic';
  }

  return DEFAULT_GAME_TYPE;
}

function inferGameTypeFromCardMetadata(card: CardGameTypeHints): CardGameType | null {
  if (
    isMagicCardId(card.id) ||
    isScryfallUuid(card.id) ||
    extractScryfallUuid(card) != null ||
    isScryfallImageUrl(card.imageUrl) ||
    isScryfallRawData(card.rawData)
  ) {
    return 'magic';
  }

  return null;
}

export function resolveCardGameType(card: CardGameTypeHints): CardGameType {
  const inferredFromId = inferGameTypeFromCardId(card.id);

  if (inferredFromId === 'riftbound' || inferredFromId === 'magic') {
    return inferredFromId;
  }

  const inferredFromMetadata = inferGameTypeFromCardMetadata(card);

  if (inferredFromMetadata) {
    return inferredFromMetadata;
  }

  if (card.gameType === 'riftbound' || card.gameType === 'runeterra') {
    return 'riftbound';
  }

  if (card.gameType === 'magic') {
    return 'magic';
  }

  if (card.gameType === 'pokemon') {
    return 'pokemon';
  }

  return inferredFromId;
}

export function getCardCollectionKey(card: CardGameTypeHints): string {
  const gameType = resolveCardGameType(card);
  const id = gameType === 'magic' ? canonicalizeMagicCardId(card) : card.id;

  return `${gameType}:${id}`;
}

function mergeDuplicateMagicCards(
  left: CollectionCard,
  right: CollectionCard,
): CollectionCard {
  const leftUpdatedAt = left.updatedAt ? Date.parse(left.updatedAt) : 0;
  const rightUpdatedAt = right.updatedAt ? Date.parse(right.updatedAt) : 0;
  const preferred = rightUpdatedAt >= leftUpdatedAt ? right : left;
  const secondary = preferred === right ? left : right;

  return normalizeCollectionCard({
    ...preferred,
    quantity: preferred.quantity + secondary.quantity,
    setName: preferred.setName ?? secondary.setName ?? preferred.set,
    price: preferred.price ?? secondary.price,
    rarity: preferred.rarity ?? secondary.rarity,
    rawData: preferred.rawData ?? secondary.rawData,
    setId: preferred.setId ?? secondary.setId,
    setPrintedTotal: preferred.setPrintedTotal ?? secondary.setPrintedTotal,
    setLogo: preferred.setLogo ?? secondary.setLogo,
    setSymbol: preferred.setSymbol ?? secondary.setSymbol,
    updatedAt:
      rightUpdatedAt >= leftUpdatedAt
        ? right.updatedAt ?? left.updatedAt
        : left.updatedAt ?? right.updatedAt,
  });
}

export function getMagicCardAliasIds(card: CardGameTypeHints): string[] {
  const scryfallId = extractScryfallUuid(card);

  if (!scryfallId) {
    return isMagicCardId(card.id) || isScryfallUuid(card.id) ? [card.id] : [];
  }

  return [buildMagicCardId(scryfallId), scryfallId];
}

export function reconcileCollectionCards(cards: CollectionCard[]): CollectionCard[] {
  const normalized = cards.map(normalizeCollectionCard);
  const magicByScryfallId = new Map<string, CollectionCard>();
  const reconciled: CollectionCard[] = [];

  for (const card of normalized) {
    const scryfallId = extractScryfallUuid(card);

    if (!scryfallId) {
      reconciled.push(card);
      continue;
    }

    const existing = magicByScryfallId.get(scryfallId);

    if (!existing) {
      magicByScryfallId.set(scryfallId, card);
      continue;
    }

    magicByScryfallId.set(scryfallId, mergeDuplicateMagicCards(existing, card));
  }

  return [...reconciled, ...magicByScryfallId.values()];
}

export function normalizeCollectionCard(card: CollectionCard): CollectionCard {
  const gameType = resolveCardGameType(card);
  const rarity = getCardRarity(card);
  const price = getCardPrice(card);
  const id = gameType === 'magic' ? canonicalizeMagicCardId(card) : card.id;

  const normalized: CollectionCard = {
    ...card,
    id,
    gameType,
  };

  if (rarity) {
    normalized.rarity = rarity;
  }

  if (price) {
    normalized.price = price;
  } else {
    delete normalized.price;
  }

  if (card.estimatedValueBrl != null && card.estimatedValueBrl > 0) {
    normalized.estimatedValueBrl = card.estimatedValueBrl;
  }

  if (isRiftboundCardId(normalized.id)) {
    const riftboundSetId =
      extractRiftboundSetIdFromRawData(normalized.rawData) ?? extractRiftboundSetCode(normalized.id);

    if (riftboundSetId) {
      normalized.setId = riftboundSetId;
    }
  } else if (!normalized.setId) {
    normalized.setId = deriveSetIdFromCard(normalized);
  }

  if (!normalized.setPrintedTotal && isRiftboundCardId(normalized.id)) {
    const setSize = extractRiftboundSetSize(normalized.id);

    if (setSize) {
      normalized.setPrintedTotal = setSize;
    }
  }

  return normalized;
}

function coerceStoredQuantity(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 1) {
    return Math.floor(value);
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);

    if (Number.isFinite(parsed) && parsed >= 1) {
      return Math.floor(parsed);
    }
  }

  return null;
}

function coerceLegacyStoredRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const card = value as Record<string, unknown>;

  if (typeof card.id !== 'string' || typeof card.name !== 'string') {
    return null;
  }

  const set =
    typeof card.set === 'string' && card.set.trim().length > 0
      ? card.set
      : typeof card.setName === 'string' && card.setName.trim().length > 0
        ? card.setName
        : null;

  const imageUrl =
    typeof card.imageUrl === 'string' && card.imageUrl.trim().length > 0
      ? card.imageUrl
      : typeof card.image_url === 'string' && card.image_url.trim().length > 0
        ? card.image_url
        : null;

  if (!set || !imageUrl) {
    return null;
  }

  const quantity = coerceStoredQuantity(card.quantity) ?? 1;
  const number =
    typeof card.number === 'string'
      ? card.number
      : card.number != null
        ? String(card.number)
        : card.id;
  const type = typeof card.type === 'string' && card.type.trim().length > 0 ? card.type : 'Unknown';

  return {
    ...card,
    set,
    setName: typeof card.setName === 'string' && card.setName.trim().length > 0 ? card.setName : set,
    imageUrl,
    number,
    type,
    quantity,
  };
}

function resolveStoredPrice(
  value: Record<string, unknown>,
): CardPrice | undefined {
  if (isStoredCardPrice(value.price)) {
    const price = value.price as CardPrice;

    if (isPriceAvailable(price)) {
      return price;
    }
  }

  const legacyPrice = migrateLegacyEstimatedValueBrl(
    typeof value.estimatedValueBrl === 'number' ? value.estimatedValueBrl : undefined,
  );

  if (legacyPrice) {
    return legacyPrice;
  }

  return undefined;
}

export function migrateStoredCard(value: unknown): CollectionCard | null {
  const coerced = coerceLegacyStoredRecord(value);

  if (!coerced) {
    return null;
  }

  const rawData =
    coerced.rawData != null && typeof coerced.rawData === 'object' && !Array.isArray(coerced.rawData)
      ? (coerced.rawData as Record<string, unknown>)
      : undefined;
  const price = resolveStoredPrice(coerced);
  const rarity = getCardRarity({
    rarity: typeof coerced.rarity === 'string' ? coerced.rarity : undefined,
    rawData,
  });

  const migratedCard = normalizeCollectionCard({
    id: coerced.id as string,
    gameType:
      typeof coerced.gameType === 'string' && coerced.gameType.trim().length > 0
        ? (coerced.gameType as CardGameType)
        : DEFAULT_GAME_TYPE,
    name: coerced.name as string,
    imageUrl: coerced.imageUrl as string,
    set: coerced.set as string,
    number: coerced.number as string,
    type: coerced.type as string,
    quantity: coerced.quantity as number,
    setName:
      typeof coerced.setName === 'string' && coerced.setName.trim().length > 0
        ? coerced.setName
        : (coerced.set as string),
    ...(price ? { price } : {}),
    ...(typeof coerced.setId === 'string' ? { setId: coerced.setId } : {}),
    ...(typeof coerced.setPrintedTotal === 'number'
      ? { setPrintedTotal: coerced.setPrintedTotal }
      : {}),
    ...(typeof coerced.setLogo === 'string' ? { setLogo: coerced.setLogo } : {}),
    ...(typeof coerced.setSymbol === 'string' ? { setSymbol: coerced.setSymbol } : {}),
    ...(typeof coerced.estimatedValueBrl === 'number'
      ? { estimatedValueBrl: coerced.estimatedValueBrl }
      : {}),
    ...(typeof coerced.updatedAt === 'string' ? { updatedAt: coerced.updatedAt } : {}),
    ...(rawData ? { rawData } : {}),
  });

  return {
    ...migratedCard,
    ...(rarity ? { rarity } : {}),
  };
}

export function ensureGameType(card: Omit<GameCard, 'gameType'> & { gameType?: CardGameType }): GameCard {
  return {
    ...card,
    gameType: resolveCardGameType(card),
  };
}

export function filterCardsByGameType<T extends GameCard>(
  cards: T[],
  gameType: CardGameType,
): T[] {
  return cards.filter((card) => resolveCardGameType(card) === gameType);
}
