import { type GameCard } from '@/types/cardGame';
import { getCardRarity } from '@/utils/card-rarity';

const RARE_RARITY_MARKERS = [
  'rare',
  'rara',
  'holo',
  'ultra',
  'secret',
  'legendary',
  'legend',
  'mythic',
  'special',
  'promo',
  'epic',
  'showcase',
] as const;

export function isRareCard(card: GameCard): boolean {
  const rarity = getCardRarity(card);

  if (!rarity) {
    return false;
  }

  const normalized = rarity.toLowerCase();

  if (normalized === 'common' || normalized === 'uncommon' || normalized === 'comum' || normalized === 'incomum') {
    return false;
  }

  return RARE_RARITY_MARKERS.some((marker) => normalized.includes(marker));
}

export function resolveCardRarityLabel(card: Pick<GameCard, 'rarity' | 'rawData'>): string | undefined {
  return getCardRarity(card);
}
