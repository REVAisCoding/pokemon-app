import { CARD_GAME_CONFIG } from '@/config/cardGames';
import { type CardGameType, isCardGameType } from '@/types/cardGame';

export type CardGameId = CardGameType;

export type CardGame = {
  id: CardGameId;
  name: string;
  shortName: string;
  description: string;
  accentColor: string;
};

export const CARD_GAMES: CardGame[] = [
  {
    id: 'pokemon',
    name: CARD_GAME_CONFIG.pokemon.label,
    shortName: 'Pokémon',
    description: 'Gerencie sua coleção de cartas Pokémon Trading Card Game.',
    accentColor: CARD_GAME_CONFIG.pokemon.themeColor,
  },
  {
    id: 'riftbound',
    name: CARD_GAME_CONFIG.riftbound.label,
    shortName: 'Riftbound',
    description: 'Gerencie sua coleção de cartas Riftbound.',
    accentColor: CARD_GAME_CONFIG.riftbound.themeColor,
  },
  {
    id: 'magic',
    name: CARD_GAME_CONFIG.magic.label,
    shortName: 'Magic',
    description: 'Gerencie sua coleção de cartas Magic: The Gathering.',
    accentColor: CARD_GAME_CONFIG.magic.themeColor,
  },
];

export function isCardGameId(value: string): value is CardGameId {
  return isCardGameType(value);
}

export function getCardGameById(gameId: CardGameId): CardGame | undefined {
  return CARD_GAMES.find((game) => game.id === gameId);
}
