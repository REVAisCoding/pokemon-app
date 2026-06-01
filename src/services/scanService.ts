import { type ScannedCard } from '@/constants/scan-data';
import { type CardGameType } from '@/types/cardGame';

import {
  gameCardToScannedCard,
  recognizeCardFromImage,
} from '@/services/cardRecognitionService';
import { enrichRiftboundGameCardsWithPrice } from '@/services/riftboundApi';

export type IdentifyCardResult =
  | {
      status: 'candidates';
      cards: ScannedCard[];
      confidence: 'high' | 'medium';
      extractedName: string | null;
    }
  | { status: 'low_confidence'; cardName: string | null }
  | { status: 'not_found'; cardName: string | null }
  | { status: 'error'; message: string };

export async function identifyCardFromImage(
  imageUri: string,
  gameType: CardGameType = 'pokemon',
): Promise<IdentifyCardResult> {
  const result = await recognizeCardFromImage(imageUri, gameType);

  if (result.status === 'candidates') {
    let cards = result.recognition.candidates.map(gameCardToScannedCard);

    if (gameType === 'riftbound') {
      const gameCards = await enrichRiftboundGameCardsWithPrice(result.recognition.candidates);
      cards = gameCards.map(gameCardToScannedCard);
    }

    return {
      status: 'candidates',
      cards,
      confidence:
        result.recognition.confidence === 'high' ? 'high' : 'medium',
      extractedName: result.recognition.detectedName || null,
    };
  }

  if (result.status === 'low_confidence') {
    return { status: 'low_confidence', cardName: result.detectedName };
  }

  if (result.status === 'not_found') {
    return { status: 'not_found', cardName: result.detectedName };
  }

  return { status: 'error', message: result.message };
}
