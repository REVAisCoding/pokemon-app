import { CARD_GAME_CONFIG } from '@/config/cardGames';
import { type ScannedCard } from '@/constants/scan-data';
import { searchCardsByName } from '@/services/pokemonTcgApi';
import { scanCardFromImage } from '@/services/scanApiService';
import {
  magicGameCardToScannedCard,
  searchMagicCardsForRecognition,
} from '@/services/magicApi';
import {
  riftboundGameCardToScannedCard,
  searchRiftboundCardsByNameAsGameCards,
} from '@/services/riftboundApi';
import { type ExtractedCardInfo } from '@/services/scanApiService';
import { type CardGameType, type GameCard } from '@/types/cardGame';
import { resolveScannedCardPrice } from '@/utils/pricing';

export type CardRecognitionResult = {
  detectedName: string;
  confidence: 'high' | 'medium' | 'low';
  candidates: GameCard[];
};

export type CardRecognitionFlowResult =
  | {
      status: 'candidates';
      recognition: CardRecognitionResult;
    }
  | { status: 'low_confidence'; detectedName: string | null }
  | { status: 'not_found'; detectedName: string | null }
  | { status: 'error'; message: string };

function scannedCardToGameCard(card: ScannedCard): GameCard {
  const price = resolveScannedCardPrice(card);

  return {
    id: card.id,
    gameType: card.gameType ?? 'pokemon',
    name: card.name,
    imageUrl: card.imageUrl,
    setName: card.setName,
    number: card.number,
    type: card.type,
    quantity: 1,
    ...(card.setId ? { setId: card.setId } : {}),
    ...(card.rarity ? { rarity: card.rarity } : {}),
    ...(price ? { price } : {}),
    ...(card.tcgplayerId ? { rawData: { tcgplayer_id: card.tcgplayerId } } : {}),
  };
}

export function gameCardToScannedCard(card: GameCard): ScannedCard {
  if (card.gameType === 'riftbound') {
    return riftboundGameCardToScannedCard(card);
  }

  if (card.gameType === 'magic') {
    return magicGameCardToScannedCard(card);
  }

  return {
    id: card.id,
    name: card.name,
    setName: card.setName ?? '',
    number: card.number ?? card.id,
    type: card.type ?? '',
    imageUrl: card.imageUrl,
    accentColor: CARD_GAME_CONFIG.pokemon.themeColor,
    gameType: 'pokemon',
    ...(card.setId ? { setId: card.setId } : {}),
    ...(card.rarity ? { rarity: card.rarity } : {}),
    ...(card.price ? { price: card.price } : {}),
  };
}

async function resolveCandidates(
  gameType: CardGameType,
  detectedName: string,
  backendCandidates: ScannedCard[],
  extracted: ExtractedCardInfo,
): Promise<GameCard[]> {
  if (gameType === 'pokemon') {
    if (backendCandidates.length > 0) {
      return backendCandidates.slice(0, 3).map(scannedCardToGameCard);
    }

    if (!detectedName.trim()) {
      return [];
    }

    const scannedCards = await searchCardsByName(detectedName);
    return scannedCards.slice(0, 3).map(scannedCardToGameCard);
  }

  if (gameType === 'riftbound') {
    if (!detectedName.trim()) {
      return [];
    }

    const riftboundCards = await searchRiftboundCardsByNameAsGameCards(detectedName);
    return riftboundCards.slice(0, 3);
  }

  if (gameType === 'magic') {
    if (!detectedName.trim()) {
      return [];
    }

    const magicCards = await searchMagicCardsForRecognition(detectedName, {
      collectorNumber: extracted.number,
      setCode: extracted.set,
    });
    return magicCards.slice(0, 3);
  }

  return [];
}

export async function recognizeCardFromImage(
  imageUri: string,
  gameType: CardGameType,
): Promise<CardRecognitionFlowResult> {
  try {
    const scanResult = await scanCardFromImage(imageUri, gameType);
    const detectedName =
      scanResult.extracted.name?.trim() ||
      scanResult.extracted.nameEnglish?.trim() ||
      '';

    if (scanResult.confidence === 'low') {
      return { status: 'low_confidence', detectedName: detectedName || null };
    }

    const candidates = await resolveCandidates(
      gameType,
      detectedName,
      scanResult.candidates,
      scanResult.extracted,
    );

    if (candidates.length === 0) {
      return { status: 'not_found', detectedName: detectedName || null };
    }

    return {
      status: 'candidates',
      recognition: {
        detectedName,
        confidence: scanResult.confidence,
        candidates,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      message:
        error instanceof Error
          ? error.message
          : 'Não foi possível analisar a carta. Tente novamente.',
    };
  }
}
