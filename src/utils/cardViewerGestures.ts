import { type CardGameType } from '@/types/cardGame';
import { getCardRarity } from '@/utils/card-rarity';
import { openCardViewer, type CardViewerParams } from '@/utils/openCardViewer';

export const CARD_VIEWER_LONG_PRESS_DELAY_MS = 450;

export function createCardViewerLongPressHandler(params: CardViewerParams) {
  return () => openCardViewer(params);
}

export function cardToViewerParams(card: {
  imageUrl: string;
  name?: string;
  id?: string;
  gameType?: CardGameType;
  rarity?: string;
  rawData?: Record<string, unknown>;
}): CardViewerParams {
  const rarity = getCardRarity(card);

  return {
    imageUrl: card.imageUrl,
    name: card.name,
    ...(card.id ? { cardId: card.id } : {}),
    ...(card.gameType ? { gameType: card.gameType } : {}),
    ...(rarity ? { rarity } : {}),
  };
}
