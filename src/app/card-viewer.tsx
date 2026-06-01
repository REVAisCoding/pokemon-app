import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CardViewerScreen } from '@/components/card-viewer/card-viewer-screen';
import { PokemonColors } from '@/constants/pokemon-theme';

export default function CardViewerRoute() {
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
        <ActivityIndicator color={PokemonColors.primary} />
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
        resolvedGameType === 'magic'
          ? resolvedGameType
          : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D0D14',
  },
});
