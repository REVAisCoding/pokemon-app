import { type CollectionCard } from '@/types/collection-card';
import { getCardRarity, isRareCard } from '@/utils/card-rarity';

export function getRareCards(cards: CollectionCard[]): CollectionCard[] {
  return cards.filter((card) => isRareCard(getCardRarity(card)));
}
