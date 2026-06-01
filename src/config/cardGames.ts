import { type CardGameType } from '@/types/cardGame';

export type CardGameConfig = {
  label: string;
  themeColor: string;
  searchPlaceholder: string;
};

export const CARD_GAME_CONFIG: Record<CardGameType, CardGameConfig> = {
  pokemon: {
    label: 'Pokémon TCG',
    themeColor: '#FFCB05',
    searchPlaceholder: 'Buscar cartas Pokémon…',
  },
  riftbound: {
    label: 'Riftbound',
    themeColor: '#C89B3C',
    searchPlaceholder: 'Buscar cartas de Riftbound…',
  },
};

export function getCardGameConfig(gameType: CardGameType): CardGameConfig {
  return CARD_GAME_CONFIG[gameType];
}
