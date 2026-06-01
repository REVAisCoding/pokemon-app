import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CardDetailScreen } from '@/components/collection/card-detail-screen';
import { PokemonColors } from '@/constants/pokemon-theme';
import { useCardCollection } from '@/contexts/card-collection-context';

function resolveRouteId(rawId: string | string[] | undefined): string | undefined {
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!id?.trim()) {
    return undefined;
  }

  try {
    return decodeURIComponent(id.trim());
  } catch {
    return id.trim();
  }
}

export default function CollectionDetailRoute() {
  const { id: rawId } = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const { cards, isLoading } = useCardCollection();
  const id = resolveRouteId(rawId);
  const card = id ? cards.find((item) => item.id === id) : undefined;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!id || !card) {
      router.replace('/collection' as Href);
    }
  }, [card, id, isLoading, router]);

  if (isLoading || !id || !card) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={PokemonColors.primary} />
      </View>
    );
  }

  return <CardDetailScreen card={card} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PokemonColors.screenBackground,
  },
});
