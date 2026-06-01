import { CARD_GAME_CONFIG } from '@/config/cardGames';
import { type ScannedCard } from '@/constants/scan-data';
import { searchRiftboundCardsByName } from '@/services/riftcodexService';
import { fetchRiftboundCardPrice, getTcgplayerIdFromRawData } from '@/services/riftboundPricingService';
import { type GameCard } from '@/types/cardGame';
import { type RiftboundCard } from '@/types/riftbound';
import { isPriceAvailable } from '@/utils/pricing';

function formatCollectorNumber(collectorNumber: number, riftboundId: string): string {
  const parts = riftboundId.split('-');
  const setTotal = parts[parts.length - 1];

  if (setTotal && !Number.isNaN(Number(setTotal))) {
    return `#${collectorNumber}/${setTotal}`;
  }

  return `#${collectorNumber}`;
}

function formatCardType(card: RiftboundCard): string {
  const { type, supertype, domain } = card.classification;
  const domainLabel = domain.length > 0 ? domain.join(' · ') : '';
  const typeLabel = supertype ? `${supertype} · ${type}` : type;

  return domainLabel ? `${typeLabel} · ${domainLabel}` : typeLabel;
}

export async function searchRiftboundCardsByNameAsGameCards(name: string): Promise<GameCard[]> {
  const cards = await searchRiftboundCardsByName(name);
  const mappedCards = cards.map(mapRiftboundCardToGameCard);

  return enrichRiftboundGameCardsWithPrice(mappedCards);
}

export function mapRiftboundCardToGameCard(card: RiftboundCard): GameCard {
  return {
    id: card.riftbound_id,
    gameType: 'riftbound',
    name: card.name,
    imageUrl: card.media.image_url,
    setId: card.set.set_id,
    setName: card.set.label,
    number: formatCollectorNumber(card.collector_number, card.riftbound_id),
    rarity: card.classification.rarity,
    type: formatCardType(card),
    quantity: 1,
    rawData: card as unknown as Record<string, unknown>,
  };
}

export async function enrichRiftboundGameCardsWithPrice(cards: GameCard[]): Promise<GameCard[]> {
  return Promise.all(
    cards.map(async (card) => {
      if (isPriceAvailable(card.price)) {
        return card;
      }

      const tcgplayerId = getTcgplayerIdFromRawData(card.rawData);
      const price = await fetchRiftboundCardPrice(card.id, tcgplayerId);

      if (!isPriceAvailable(price)) {
        return card;
      }

      return { ...card, price };
    }),
  );
}

export function riftboundGameCardToScannedCard(card: GameCard): ScannedCard {
  return {
    id: card.id,
    name: card.name,
    setName: card.setName ?? '',
    number: card.number ?? card.id,
    type: card.type ?? '',
    imageUrl: card.imageUrl,
    accentColor: CARD_GAME_CONFIG.riftbound.themeColor,
    gameType: 'riftbound',
    ...(card.setId ? { setId: card.setId } : {}),
    ...(card.rarity ? { rarity: card.rarity } : {}),
    ...(getTcgplayerIdFromRawData(card.rawData)
      ? { tcgplayerId: getTcgplayerIdFromRawData(card.rawData) }
      : {}),
    ...(isPriceAvailable(card.price) ? { price: card.price } : {}),
  };
}
