import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { CardViewerScreen } from '@/components/card-viewer/card-viewer-screen';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonColors } from '@/hooks/use-pokemon-colors';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';

export default function CardViewerRoute() {
  const colors = usePokemonColors();
  const styles = usePokemonStyles(createStyles);
  const { imageUrl, name, rarity, gameType } = useLocalSearchParams<{
    imageUrl?: string | string[];
    name?: string | string[];
    rarity?: string | string[];
    gameType?: string | string[];
  }>();
  const router = useRouter();

  const resolvedImageUrl = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;
  const resolvedName = Array.isArray(name) ? name[0] : name;
  const resolvedRarity = Array.isArray(rarity) ? rarity[0] : rarity;
  const resolvedGameType = Array.isArray(gameType) ? gameType[0] : gameType;

  useEffect(() => {
    if (!resolvedImageUrl) {
      router.back();
    }
  }, [resolvedImageUrl, router]);

  if (!resolvedImageUrl) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <CardViewerScreen
      imageUrl={resolvedImageUrl}
      name={resolvedName}
      rarity={resolvedRarity}
      gameType={
        resolvedGameType === 'pokemon' ||
        resolvedGameType === 'riftbound' ||
        resolvedGameType === 'magic' ||
        resolvedGameType === 'onepiece'
          ? resolvedGameType
          : undefined
      }
    />
  );
}

function createStyles(colors: PokemonColorPalette) {
  return {
  loading: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#0D0D14',
  },
};
}
