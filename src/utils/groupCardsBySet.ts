import { type CollectionCard } from '@/types/collection-card';
import { type CollectionSetGroup } from '@/types/collection-set';
import { deriveSetIdFromCard } from '@/utils/deriveSetIdFromCard';
import { parseSetTotalFromNumber } from '@/utils/parseSetTotalFromNumber';

function resolvePrintedTotal(cards: CollectionCard[]): number | undefined {
  const explicitTotals = cards
    .map((card) => card.setPrintedTotal)
    .filter((total): total is number => total != null && total > 0);

  if (explicitTotals.length > 0) {
    return Math.max(...explicitTotals);
  }

  const parsedTotals = cards
    .map((card) => parseSetTotalFromNumber(card.number))
    .filter((total): total is number => total != null && total > 0);

  if (parsedTotals.length === 0) {
    return undefined;
  }

  return Math.max(...parsedTotals);
}

function resolveSetMetadata(cards: CollectionCard[]): Pick<
  CollectionSetGroup,
  'setLogo' | 'setSymbol' | 'setId'
> {
  const setId = cards.map(deriveSetIdFromCard).find(Boolean) ?? deriveSetIdFromCard(cards[0]);
  const cardWithLogo = cards.find((card) => card.setLogo);
  const cardWithSymbol = cards.find((card) => card.setSymbol);

  return {
    setId,
    ...(cardWithLogo?.setLogo ? { setLogo: cardWithLogo.setLogo } : {}),
    ...(cardWithSymbol?.setSymbol ? { setSymbol: cardWithSymbol.setSymbol } : {}),
  };
}

function resolveSetName(cards: CollectionCard[]): string {
  const nameCounts = new Map<string, number>();

  for (const card of cards) {
    const name = card.set.trim();

    if (name) {
      nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1);
    }
  }

  if (nameCounts.size === 0) {
    return deriveSetIdFromCard(cards[0]);
  }

  let bestName = '';
  let bestCount = 0;

  for (const [name, count] of nameCounts) {
    if (count > bestCount || (count === bestCount && name.length > bestName.length)) {
      bestName = name;
      bestCount = count;
    }
  }

  return bestName;
}

export function groupCardsBySet(cards: CollectionCard[]): CollectionSetGroup[] {
  const groups = new Map<string, CollectionCard[]>();

  for (const card of cards) {
    const groupKey = deriveSetIdFromCard(card);
    const existing = groups.get(groupKey) ?? [];
    groups.set(groupKey, [...existing, card]);
  }

  const setGroups = Array.from(groups.values()).map((setCards) => {
    const setName = resolveSetName(setCards);
    const { setId, setLogo, setSymbol } = resolveSetMetadata(setCards);
    const printedTotal = resolvePrintedTotal(setCards);
    const uniqueCardsOwned = setCards.length;
    const totalCardsOwned = setCards.reduce((total, card) => total + card.quantity, 0);
    const completionPercentage =
      printedTotal != null && printedTotal > 0
        ? Math.min(100, Math.round((uniqueCardsOwned / printedTotal) * 100))
        : undefined;

    return {
      setId,
      setName,
      setLogo,
      setSymbol,
      totalCardsOwned,
      uniqueCardsOwned,
      cards: setCards,
      completionPercentage,
      printedTotal,
    };
  });

  return setGroups.sort((left, right) => left.setName.localeCompare(right.setName, 'pt-BR'));
}

export function findSetGroupById(
  sets: CollectionSetGroup[],
  setId: string,
): CollectionSetGroup | undefined {
  return sets.find((set) => set.setId === setId);
}
