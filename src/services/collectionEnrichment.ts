import { fetchCardPrice } from '@/services/cardPricingService';
import { fetchCardRarity } from '@/services/cardRarityService';
import { type CollectionCard } from '@/types/collection-card';
import { getCardRarity } from '@/utils/card-rarity';
import {
  getCardCollectionKey,
  getCollectionCardGameType,
  normalizeCollectionCard,
} from '@/utils/collectionCardMigration';
import { getCardPrice, isPriceAvailable } from '@/utils/pricing';

function isEnrichableGame(card: CollectionCard): boolean {
  const gameType = getCollectionCardGameType(card);
  return gameType === 'pokemon' || gameType === 'riftbound';
}

function needsPrice(card: CollectionCard): boolean {
  return isEnrichableGame(card) && !isPriceAvailable(getCardPrice(card));
}

function needsRarity(card: CollectionCard): boolean {
  return isEnrichableGame(card) && !getCardRarity(card);
}

export function collectionNeedsEnrichment(cards: CollectionCard[]): boolean {
  return cards.some((card) => needsPrice(card) || needsRarity(card));
}

export async function enrichCollectionCards(cards: CollectionCard[]): Promise<CollectionCard[]> {
  const targets = cards.filter((card) => needsPrice(card) || needsRarity(card));

  if (targets.length === 0) {
    return cards;
  }

  const priceByKey = new Map<string, Awaited<ReturnType<typeof fetchCardPrice>>>();
  const rarityByKey = new Map<string, string>();

  await Promise.all(
    targets.map(async (card) => {
      const key = getCardCollectionKey(card);
      const gameType = getCollectionCardGameType(card);

      const [price, rarity] = await Promise.all([
        needsPrice(card)
          ? fetchCardPrice(card.id, {
              gameType,
              tcgplayerId: card.rawData?.tcgplayer_id as string | undefined,
              rawData: card.rawData,
            })
          : null,
        needsRarity(card) ? fetchCardRarity(card.id, gameType) : null,
      ]);

      if (price && isPriceAvailable(price)) {
        priceByKey.set(key, price);
      }

      if (rarity) {
        rarityByKey.set(key, rarity);
      }
    }),
  );

  if (priceByKey.size === 0 && rarityByKey.size === 0) {
    return cards;
  }

  let changed = false;

  const nextCards = cards.map((card) => {
    const key = getCardCollectionKey(card);
    const price = priceByKey.get(key);
    const rarity = rarityByKey.get(key);

    if ((!price || card.price?.source === 'manual') && !rarity) {
      return card;
    }

    let next = card;

    if (price && isPriceAvailable(price) && card.price?.source !== 'manual') {
      next = normalizeCollectionCard({ ...next, price });
    }

    if (rarity) {
      next = { ...next, rarity };
    }

    if (next === card) {
      return card;
    }

    changed = true;
    return { ...next, updatedAt: new Date().toISOString() };
  });

  return changed ? nextCards : cards;
}
