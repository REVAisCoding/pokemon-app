import { type CollectionCard } from '@/types/collection-card';

export type CollectionSetGroup = {
  setId: string;
  setName: string;
  setLogo?: string;
  setSymbol?: string;
  totalCardsOwned: number;
  uniqueCardsOwned: number;
  cards: CollectionCard[];
  completionPercentage?: number;
  printedTotal?: number;
};
