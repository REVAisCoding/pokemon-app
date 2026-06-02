import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { SetDetailScreen } from '@/components/collection/set-detail-screen';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonColors } from '@/hooks/use-pokemon-colors';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { useCollectionSets } from '@/hooks/use-collection-sets';
import { findSetGroupById } from '@/utils/groupCardsBySet';

function resolveRouteSetId(rawSetId: string | string[] | undefined): string | undefined {
  const setId = Array.isArray(rawSetId) ? rawSetId[0] : rawSetId;

  if (!setId?.trim()) {
    return undefined;
  }

  try {
    return decodeURIComponent(setId.trim());
  } catch {
    return setId.trim();
  }
}

export default function CollectionSetDetailRoute() {
  const colors = usePokemonColors();
  const styles = usePokemonStyles(createStyles);
  const { setId: rawSetId } = useLocalSearchParams<{ setId?: string | string[] }>();
  const router = useRouter();
  const sets = useCollectionSets();
  const setId = resolveRouteSetId(rawSetId);
  const set = setId ? findSetGroupById(sets, setId) : undefined;

  useEffect(() => {
    if (!setId || !set) {
      router.replace('/collection' as Href);
    }
  }, [set, setId, router]);

  if (!setId || !set) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <SetDetailScreen set={set} />;
}

function createStyles(colors: PokemonColorPalette) {
  return {
  loading: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.screenBackground,
  },
};
}
