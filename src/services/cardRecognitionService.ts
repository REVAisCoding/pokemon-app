import { CARD_GAME_CONFIG } from '@/config/cardGames';
import { type ScannedCard } from '@/constants/scan-data';
import { searchCardsByName, searchPokemonCardsForRecognition } from '@/services/pokemonTcgApi';
import { scanCardFromImage } from '@/services/scanApiService';
import { searchCardsByExtractedInfo } from '@/services/tcgDexApi';
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

function normalizeCardNumber(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const match = value.match(/\d+/);
  if (!match) {
    return null;
  }

  return match[0].replace(/^0+/, '') || '0';
}

function scorePokemonCandidate(card: ScannedCard, extracted: ExtractedCardInfo): number {
  let score = 0;
  const cardName = card.name.toLowerCase();

  for (const value of [extracted.name, extracted.nameEnglish]) {
    const name = value?.trim();

    if (!name) {
      continue;
    }

    const normalizedName = name.toLowerCase();

    if (normalizedName === cardName) {
      score += 100;
    } else if (cardName.includes(normalizedName) || normalizedName.includes(cardName)) {
      score += 50;
    }
  }

  const extractedNumber = normalizeCardNumber(extracted.number);
  const candidateNumber = normalizeCardNumber(card.number);

  if (extractedNumber && candidateNumber && extractedNumber === candidateNumber) {
    score += 1000;
  }

  const setName = extracted.set?.trim().toLowerCase();

  if (setName && card.setName.toLowerCase().includes(setName)) {
    score += 500;
  }

  const language = extracted.language?.toLowerCase() ?? '';

  if (
    (language.includes('portug') ||
      language.includes('brasil') ||
      language.includes('brazil')) &&
    card.id.startsWith('tcgdex-')
  ) {
    score += 200;
  }

  return score;
}

function rankPokemonCandidates(
  cards: ScannedCard[],
  extracted: ExtractedCardInfo,
): ScannedCard[] {
  return cards
    .map((card, index) => ({ card, index }))
    .sort((left, right) => {
      const scoreDiff =
        scorePokemonCandidate(right.card, extracted) -
        scorePokemonCandidate(left.card, extracted);

      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return left.index - right.index;
    })
    .map(({ card }) => card);
}

function appendUniqueCards(pool: ScannedCard[], cards: ScannedCard[]): void {
  const seenIds = new Set(pool.map((card) => card.id));

  for (const card of cards) {
    if (seenIds.has(card.id)) {
      continue;
    }

    seenIds.add(card.id);
    pool.push(card);
  }
}

async function resolvePokemonCandidates(
  detectedName: string,
  backendCandidates: ScannedCard[],
  extracted: ExtractedCardInfo,
): Promise<GameCard[]> {
  const pool: ScannedCard[] = [];

  appendUniqueCards(pool, backendCandidates);

  try {
    const [tcgDexCards, pokemonTcgCards] = await Promise.all([
      searchCardsByExtractedInfo(extracted),
      searchPokemonCardsForRecognition(extracted),
    ]);

    appendUniqueCards(pool, tcgDexCards);
    appendUniqueCards(pool, pokemonTcgCards);
  } catch {
    // APIs externas indisponíveis — segue com candidatos do backend.
  }

  if (pool.length === 0 && detectedName.trim()) {
    appendUniqueCards(pool, await searchCardsByName(detectedName));
  }

  if (pool.length === 0) {
    return [];
  }

  return rankPokemonCandidates(pool, extracted)
    .slice(0, 3)
    .map(scannedCardToGameCard);
}

async function resolveCandidates(
  gameType: CardGameType,
  detectedName: string,
  backendCandidates: ScannedCard[],
  extracted: ExtractedCardInfo,
): Promise<GameCard[]> {
  if (gameType === 'pokemon') {
    return resolvePokemonCandidates(detectedName, backendCandidates, extracted);
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

    const candidates = await resolveCandidates(
      gameType,
      detectedName,
      scanResult.candidates,
      scanResult.extracted,
    );

    if (candidates.length === 0 && scanResult.confidence === 'low') {
      return { status: 'low_confidence', detectedName: detectedName || null };
    }

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
