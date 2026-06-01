export type CardGameType = 'pokemon' | 'riftbound' | 'magic';

export type CardPriceSource = 'pokemon_tcg_api' | 'tcgplayer' | 'manual' | 'unavailable';

export type CardPrice = {
  amount: number;
  currency: string;
  source: CardPriceSource;
  updatedAt?: string;
};

export type GameCard = {
  id: string;
  gameType: CardGameType;
  name: string;
  imageUrl: string;
  setId?: string;
  setName?: string;
  number?: string;
  rarity?: string;
  type?: string;
  quantity: number;
  price?: CardPrice;
  rawData?: Record<string, unknown>;
};

export function isCardGameType(value: string): value is CardGameType {
  return value === 'pokemon' || value === 'riftbound' || value === 'magic';
}

export function isCardPriceSource(value: string): value is CardPriceSource {
  return value === 'pokemon_tcg_api' || value === 'tcgplayer' || value === 'manual' || value === 'unavailable';
}
