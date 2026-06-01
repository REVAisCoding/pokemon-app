import { type CollectionCard } from '@/types/collection-card';

export function getDuplicateCards(cards: CollectionCard[]): CollectionCard[] {
  return cards
    .filter((card) => card.quantity > 1)
    .sort((a, b) => b.quantity - a.quantity);
}

export function countDuplicateCards(cards: CollectionCard[]): number {
  return getDuplicateCards(cards).length;
}
