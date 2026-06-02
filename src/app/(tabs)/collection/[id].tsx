import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { CardDetailScreen } from '@/components/collection/card-detail-screen';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonColors } from '@/hooks/use-pokemon-colors';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
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
  const colors = usePokemonColors();
  const styles = usePokemonStyles(createStyles);
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
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <CardDetailScreen card={card} />;
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
