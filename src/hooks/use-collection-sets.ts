import { useMemo } from 'react';

import { useCardCollection } from '@/contexts/card-collection-context';
import { type CollectionSetGroup } from '@/types/collection-set';
import { groupCardsBySet } from '@/utils/groupCardsBySet';

export function useCollectionSets(): CollectionSetGroup[] {
  const { cards } = useCardCollection();

  return useMemo(() => groupCardsBySet(cards), [cards]);
}
