import { getSupabase } from '@/lib/supabase';
import { type CollectionCard } from '@/types/collection-card';
import { type CardPrice } from '@/types/cardGame';
import { type UserCardRow } from '@/types/database';
import {
  getCardCollectionKey,
  getMagicCardAliasIds,
  inferGameTypeFromCardId,
  normalizeCollectionCard,
  reconcileCollectionCards,
  resolveCardGameType,
} from '@/utils/collectionCardMigration';
import { getCardPrice, isPriceAvailable } from '@/utils/pricing';

function resolveMergedPrice(localCard: CollectionCard, remoteCard: CollectionCard): CardPrice | undefined {
  if (localCard.price?.source === 'manual') {
    return localCard.price;
  }

  if (remoteCard.price?.source === 'manual') {
    return remoteCard.price;
  }

  const localPrice = getCardPrice(localCard);
  const remotePrice = getCardPrice(remoteCard);

  if (isPriceAvailable(localPrice)) {
    return localPrice;
  }

  if (isPriceAvailable(remotePrice)) {
    return remotePrice;
  }

  return localPrice ?? remotePrice;
}

function mergeCardRecords(localCard: CollectionCard, remoteCard: CollectionCard): CollectionCard {
  const localUpdatedAt = localCard.updatedAt ? Date.parse(localCard.updatedAt) : 0;
  const remoteUpdatedAt = remoteCard.updatedAt ? Date.parse(remoteCard.updatedAt) : 0;
  const remoteIsNewer = remoteUpdatedAt >= localUpdatedAt;
  const core = remoteIsNewer ? remoteCard : localCard;

  return normalizeCollectionCard({
    ...core,
    gameType: resolveCardGameType({
      id: core.id,
      gameType: localCard.gameType ?? remoteCard.gameType,
      imageUrl: localCard.imageUrl ?? remoteCard.imageUrl,
      type: localCard.type ?? remoteCard.type,
      rawData: localCard.rawData ?? remoteCard.rawData,
    }),
    setName: localCard.setName ?? remoteCard.setName ?? core.setName ?? core.set,
    quantity: Math.max(localCard.quantity, remoteCard.quantity),
    updatedAt: remoteIsNewer ? remoteCard.updatedAt : localCard.updatedAt,
    price: resolveMergedPrice(localCard, remoteCard),
    rarity: localCard.rarity ?? remoteCard.rarity,
    rawData: localCard.rawData ?? remoteCard.rawData,
    setId: localCard.setId ?? remoteCard.setId,
    setPrintedTotal: localCard.setPrintedTotal ?? remoteCard.setPrintedTotal,
    setLogo: localCard.setLogo ?? remoteCard.setLogo,
    setSymbol: localCard.setSymbol ?? remoteCard.setSymbol,
    estimatedValueBrl: localCard.estimatedValueBrl ?? remoteCard.estimatedValueBrl,
  });
}

function rowToCollectionCard(row: UserCardRow): CollectionCard {
  return normalizeCollectionCard({
    id: row.card_api_id,
    gameType: inferGameTypeFromCardId(row.card_api_id),
    name: row.name,
    set: row.set,
    setName: row.set,
    number: row.number,
    type: row.type,
    imageUrl: row.image_url,
    quantity: row.quantity,
    updatedAt: row.updated_at,
  });
}

function collectionCardToRow(card: CollectionCard, userId: string) {
  return {
    user_id: userId,
    card_api_id: card.id,
    name: card.name,
    set: card.set,
    number: card.number,
    type: card.type,
    image_url: card.imageUrl,
    quantity: card.quantity,
    updated_at: card.updatedAt ?? new Date().toISOString(),
  };
}

export async function fetchUserCardsFromCloud(userId: string): Promise<CollectionCard[]> {
  const { data, error } = await getSupabase()
    .from('user_cards')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(rowToCollectionCard);
}

export async function upsertCardToCloud(userId: string, card: CollectionCard): Promise<void> {
  const payload = collectionCardToRow(card, userId);
  const { error } = await getSupabase().from('user_cards').upsert(payload, {
    onConflict: 'user_id,card_api_id',
  });

  if (error) {
    throw error;
  }
}

export async function deleteCardFromCloud(userId: string, cardApiId: string): Promise<void> {
  const { error } = await getSupabase()
    .from('user_cards')
    .delete()
    .eq('user_id', userId)
    .eq('card_api_id', cardApiId);

  if (error) {
    throw error;
  }
}

export async function syncCollectionToCloud(
  userId: string,
  cards: CollectionCard[],
): Promise<void> {
  if (cards.length === 0) {
    return;
  }

  const remoteCards = await fetchUserCardsFromCloud(userId);
  const retainedCloudIds = new Set<string>();

  for (const card of cards) {
    retainedCloudIds.add(card.id);

    for (const aliasId of getMagicCardAliasIds(card)) {
      retainedCloudIds.add(aliasId);
    }
  }

  const staleRemoteCards = remoteCards.filter((card) => !retainedCloudIds.has(card.id));

  await Promise.all(
    staleRemoteCards.map((card) => deleteCardFromCloud(userId, card.id)),
  );

  const rows = cards.map((card) => collectionCardToRow(card, userId));
  const { error } = await getSupabase().from('user_cards').upsert(rows, {
    onConflict: 'user_id,card_api_id',
  });

  if (error) {
    throw error;
  }
}

export function mergeLocalAndRemoteCards(
  localCards: CollectionCard[],
  remoteCards: CollectionCard[],
): CollectionCard[] {
  const merged = new Map<string, CollectionCard>();

  for (const card of localCards.map(normalizeCollectionCard)) {
    merged.set(getCardCollectionKey(card), card);
  }

  for (const remoteCard of remoteCards.map(normalizeCollectionCard)) {
    const key = getCardCollectionKey(remoteCard);
    const localCard = merged.get(key);

    if (!localCard) {
      merged.set(key, remoteCard);
      continue;
    }

    merged.set(key, mergeCardRecords(localCard, remoteCard));
  }

  return reconcileCollectionCards(
    Array.from(merged.values()).sort((left, right) => {
      const leftTime = left.updatedAt ? Date.parse(left.updatedAt) : 0;
      const rightTime = right.updatedAt ? Date.parse(right.updatedAt) : 0;

      return rightTime - leftTime;
    }),
  );
}
