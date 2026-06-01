import { useEffect, useState } from 'react';

import { fetchSetMetadata, type SetMetadata } from '@/services/setMetadataService';
import { type CollectionSetGroup } from '@/types/collection-set';

export function useEnrichedSetGroup(set: CollectionSetGroup): CollectionSetGroup {
  const [metadata, setMetadata] = useState<SetMetadata | null>(null);

  useEffect(() => {
    if (set.setLogo && set.setSymbol) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const fetchedMetadata = await fetchSetMetadata(set.setId, set.cards);

      if (!cancelled && fetchedMetadata) {
        setMetadata(fetchedMetadata);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [set.setId, set.setLogo, set.setSymbol, set.cards]);

  if (!metadata) {
    return set;
  }

  const printedTotal = set.printedTotal ?? metadata.printedTotal ?? metadata.total;
  const completionPercentage =
    printedTotal != null && printedTotal > 0
      ? Math.min(100, Math.round((set.uniqueCardsOwned / printedTotal) * 100))
      : set.completionPercentage;

  return {
    ...set,
    setLogo: set.setLogo ?? metadata.setLogo,
    setSymbol: set.setSymbol ?? metadata.setSymbol,
    printedTotal,
    completionPercentage,
  };
}

export function useEnrichedSetGroups(sets: CollectionSetGroup[]): CollectionSetGroup[] {
  const [enrichedById, setEnrichedById] = useState<Record<string, SetMetadata>>({});

  useEffect(() => {
    const setsMissingMetadata = sets.filter((set) => !set.setLogo && !set.setSymbol);

    if (setsMissingMetadata.length === 0) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const results = await Promise.all(
        setsMissingMetadata.map(async (set) => {
          const metadata = await fetchSetMetadata(set.setId, set.cards);
          return metadata ? ([set.setId, metadata] as const) : null;
        }),
      );

      if (cancelled) {
        return;
      }

      const nextEntries = results.filter(
        (entry): entry is readonly [string, SetMetadata] => entry !== null,
      );

      if (nextEntries.length === 0) {
        return;
      }

      setEnrichedById((current) => ({
        ...current,
        ...Object.fromEntries(nextEntries),
      }));
    })();

    return () => {
      cancelled = true;
    };
  }, [sets]);

  return sets.map((set) => {
    const metadata = enrichedById[set.setId];

    if (!metadata) {
      return set;
    }

    const printedTotal = set.printedTotal ?? metadata.printedTotal ?? metadata.total;
    const completionPercentage =
      printedTotal != null && printedTotal > 0
        ? Math.min(100, Math.round((set.uniqueCardsOwned / printedTotal) * 100))
        : set.completionPercentage;

    return {
      ...set,
      setLogo: set.setLogo ?? metadata.setLogo,
      setSymbol: set.setSymbol ?? metadata.setSymbol,
      printedTotal,
      completionPercentage,
    };
  });
}

export function getSetDisplayImage(set: CollectionSetGroup): string | undefined {
  return set.setLogo ?? set.setSymbol;
}

export function formatSetProgress(set: CollectionSetGroup): string {
  const ownedLabel = `${set.uniqueCardsOwned} únicas · ${set.totalCardsOwned} total`;

  if (set.completionPercentage != null) {
    return `${ownedLabel} · ${set.completionPercentage}%`;
  }

  return ownedLabel;
}

export function getSetAbbreviation(setName: string): string {
  const words = setName.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return '?';
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}
