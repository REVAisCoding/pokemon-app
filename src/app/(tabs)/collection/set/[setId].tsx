import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { SetDetailScreen } from '@/components/collection/set-detail-screen';
import { PokemonColors } from '@/constants/pokemon-theme';
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
        <ActivityIndicator color={PokemonColors.primary} />
      </View>
    );
  }

  return <SetDetailScreen set={set} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PokemonColors.screenBackground,
  },
});
