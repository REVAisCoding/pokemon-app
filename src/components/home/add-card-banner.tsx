import { Pressable, StyleSheet, View } from 'react-native';

import { HomeIcon } from '@/components/home/home-icon';
import { ThemedText } from '@/components/themed-text';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';

type AddCardBannerProps = {
  onScanPress?: () => void;
};

const PREVIEW_CARDS = [
  { id: '1', color: '#F7D046', rotate: '-12deg', offset: 18 },
  { id: '2', color: '#FF6B4A', rotate: '-4deg', offset: 8 },
  { id: '3', color: '#4A90D9', rotate: '6deg', offset: 0 },
] as const;

export function AddCardBanner({ onScanPress }: AddCardBannerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.copy}>
          <ThemedText style={styles.title}>Adicionar carta</ThemedText>
          <ThemedText style={styles.description}>
            Tire uma foto da sua carta para adicionar à coleção
          </ThemedText>

          <Pressable style={styles.button} onPress={onScanPress}>
            <HomeIcon name="camera" fallback="📷" color={PokemonColors.primary} />
            <ThemedText style={styles.buttonText}>Escanear carta</ThemedText>
          </Pressable>
        </View>

        <View style={styles.previewStack}>
          {PREVIEW_CARDS.map((card) => (
            <View
              key={card.id}
              style={[
                styles.previewCard,
                {
                  backgroundColor: card.color,
                  transform: [{ rotate: card.rotate }],
                  right: card.offset,
                },
              ]}
            />
          ))}
          <ThemedText style={styles.sparkle}>✦</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: Spacing.three,
    backgroundColor: PokemonColors.primary,
    experimental_backgroundImage: `linear-gradient(135deg, ${PokemonColors.bannerGradientStart}, ${PokemonColors.bannerGradientEnd})`,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    minHeight: 160,
  },
  copy: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: PokemonColors.white,
    marginBottom: Spacing.one,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.three,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one,
    backgroundColor: PokemonColors.white,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: PokemonColors.primary,
  },
  previewStack: {
    width: 92,
    height: 120,
    justifyContent: 'center',
  },
  previewCard: {
    position: 'absolute',
    width: 72,
    height: 96,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  sparkle: {
    position: 'absolute',
    top: 0,
    right: 0,
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
  },
});
