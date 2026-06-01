import { router } from 'expo-router';

import { type CardGameType } from '@/types/cardGame';

export type CardViewerParams = {
  imageUrl: string;
  name?: string;
  cardId?: string;
  gameType?: CardGameType;
  rarity?: string;
};

export function openCardViewer(params: CardViewerParams) {
  router.push({
    pathname: '/card-viewer',
    params: {
      imageUrl: params.imageUrl,
      ...(params.name ? { name: params.name } : {}),
      ...(params.cardId ? { cardId: params.cardId } : {}),
      ...(params.gameType ? { gameType: params.gameType } : {}),
      ...(params.rarity ? { rarity: params.rarity } : {}),
    },
  });
}
