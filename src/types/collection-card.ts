import { type CardGameType, type GameCard } from '@/types/cardGame';

export type CollectionCard = GameCard & {
  set: string;
  number: string;
  type: string;
  setPrintedTotal?: number;
  setLogo?: string;
  setSymbol?: string;
  /** @deprecated use price */
  estimatedValueBrl?: number;
  updatedAt?: string;
};

export type AddCollectionCardInput = Omit<CollectionCard, 'quantity' | 'gameType'> & {
  gameType?: CardGameType;
};
