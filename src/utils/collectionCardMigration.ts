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

export function inferGameTypeFromCardId(cardId: string): CardGameType {
  if (isRiftboundCardId(cardId)) {
    return 'riftbound';
  }

  return DEFAULT_GAME_TYPE;
}

export function resolveCardGameType(card: {
  id: string;
  gameType?: CardGameType | string;
}): CardGameType {
  if (card.gameType === 'riftbound' || card.gameType === 'runeterra') {
    return 'riftbound';
  }

  const inferredFromId = inferGameTypeFromCardId(card.id);

  if (inferredFromId === 'riftbound') {
    return 'riftbound';
  }

  if (card.gameType === 'pokemon') {
    return 'pokemon';
  }

  return inferredFromId;
}

export function getCardCollectionKey(card: { id: string; gameType?: CardGameType | string }): string {
  return `${resolveCardGameType(card)}:${card.id}`;
}

export function normalizeCollectionCard(card: CollectionCard): CollectionCard {
  const gameType = resolveCardGameType(card);
  const rarity = getCardRarity(card);
  const price = getCardPrice(card);

  const normalized: CollectionCard = {
    ...card,
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

  const gameType = resolveCardGameType({
    id: coerced.id as string,
    gameType: typeof coerced.gameType === 'string' ? coerced.gameType : undefined,
  });
  const setName =
    typeof coerced.setName === 'string' && coerced.setName.trim().length > 0
      ? coerced.setName
      : (coerced.set as string);
  const price = resolveStoredPrice(coerced);
  const rawData =
    coerced.rawData != null && typeof coerced.rawData === 'object' && !Array.isArray(coerced.rawData)
      ? (coerced.rawData as Record<string, unknown>)
      : undefined;
  const rarity = getCardRarity({
    rarity: typeof coerced.rarity === 'string' ? coerced.rarity : undefined,
    rawData,
  });

  return {
    id: coerced.id as string,
    gameType,
    name: coerced.name as string,
    imageUrl: coerced.imageUrl as string,
    set: coerced.set as string,
    number: coerced.number as string,
    type: coerced.type as string,
    quantity: coerced.quantity as number,
    setName,
    ...(price ? { price } : {}),
    ...(typeof coerced.setId === 'string' ? { setId: coerced.setId } : {}),
    ...(typeof coerced.setPrintedTotal === 'number' ? { setPrintedTotal: coerced.setPrintedTotal } : {}),
    ...(typeof coerced.setLogo === 'string' ? { setLogo: coerced.setLogo } : {}),
    ...(typeof coerced.setSymbol === 'string' ? { setSymbol: coerced.setSymbol } : {}),
    ...(rarity ? { rarity } : {}),
    ...(typeof coerced.estimatedValueBrl === 'number'
      ? { estimatedValueBrl: coerced.estimatedValueBrl }
      : {}),
    ...(typeof coerced.updatedAt === 'string' ? { updatedAt: coerced.updatedAt } : {}),
    ...(rawData ? { rawData } : {}),
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
