import { type CollectionCard } from '@/types/collection-card';
import {
  extractRiftboundSetCode,
  extractRiftboundSetIdFromRawData,
  isRiftboundCardId,
} from '@/utils/riftboundCardId';

function slugifySetName(setName: string): string {
  return setName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function deriveSetIdFromCard(card: CollectionCard): string {
  if (card.setId?.trim()) {
    return card.setId.trim();
  }

  if (card.gameType === 'riftbound' || isRiftboundCardId(card.id)) {
    const fromRawData = extractRiftboundSetIdFromRawData(card.rawData);
    if (fromRawData) {
      return fromRawData;
    }

    const fromCardId = extractRiftboundSetCode(card.id);
    if (fromCardId) {
      return fromCardId;
    }
  }

  if (card.id.startsWith('tcgdex-')) {
    const withoutPrefix = card.id.slice('tcgdex-'.length);
    const lastDashIndex = withoutPrefix.lastIndexOf('-');

    if (lastDashIndex > 0) {
      return withoutPrefix.slice(0, lastDashIndex);
    }
  }

  const pokemonTcgMatch = card.id.match(/^([a-z0-9]+)-\d+$/i);

  if (pokemonTcgMatch) {
    return pokemonTcgMatch[1];
  }

  return slugifySetName(card.set);
}

export function isTcgDexSetId(setId: string, cards: CollectionCard[]): boolean {
  return cards.some((card) => card.id.startsWith('tcgdex-') && deriveSetIdFromCard(card) === setId);
}
