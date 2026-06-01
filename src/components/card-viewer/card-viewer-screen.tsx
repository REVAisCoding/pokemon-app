import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InteractiveCard } from '@/components/card-viewer/interactive-card';
import { HomeIcon } from '@/components/home/home-icon';
import { ThemedText } from '@/components/themed-text';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';
import { type CardGameType } from '@/types/cardGame';
import { isRareCard } from '@/utils/cardRarity';

const CARD_ASPECT_RATIO = 0.72;

type CardViewerScreenProps = {
  imageUrl: string;
  name?: string;
  rarity?: string;
  gameType?: CardGameType;
};

export function CardViewerScreen({ imageUrl, name, rarity, gameType = 'pokemon' }: CardViewerScreenProps) {
  const router = useRouter();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const isShiny = useMemo(
    () =>
      isRareCard({
        id: 'viewer',
        gameType,
        name: name ?? '',
        imageUrl,
        quantity: 1,
        rarity,
      }),
    [gameType, imageUrl, name, rarity],
  );

  const cardWidth = Math.min(screenWidth * 0.78, 340);
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;
  const maxCardHeight = screenHeight * 0.68;
  const scale = cardHeight > maxCardHeight ? maxCardHeight / cardHeight : 1;
  const displayWidth = cardWidth * scale;
  const displayHeight = cardHeight * scale;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Fechar visualizador">
            <HomeIcon name="xmark" fallback="✕" size={18} color={PokemonColors.white} />
          </Pressable>
        </View>

        <View style={styles.cardStage}>
          <InteractiveCard
            imageUrl={imageUrl}
            width={displayWidth}
            height={displayHeight}
            isShiny={isShiny}
          />
          <ThemedText style={styles.hint}>Arraste para inclinar · solte para centralizar</ThemedText>
        </View>

        {name ? (
          <View style={styles.footer}>
            <ThemedText style={styles.cardName} numberOfLines={2}>
              {name}
            </ThemedText>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D14',
    experimental_backgroundImage:
      'radial-gradient(circle at 50% 35%, rgba(108, 99, 255, 0.28), rgba(13, 13, 20, 1) 65%)',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  cardStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  hint: {
    marginTop: Spacing.three,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.55)',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: PokemonColors.white,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
