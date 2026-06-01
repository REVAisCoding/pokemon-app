import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';

type ScanErrorScreenProps = {
  cardName?: string | null;
  message?: string;
};

export function ScanErrorScreen({
  cardName,
  message = 'Não foi possível identificar a carta a partir da foto.',
}: ScanErrorScreenProps) {
  const router = useRouter();

  const handleTryAgain = () => {
    router.replace('/scan' as Href);
  };

  const handleSearchManually = () => {
    router.replace({
      pathname: '/search',
      params: { initialQuery: cardName?.trim() ?? '' },
    } as Href);
  };

  const description =
    cardName?.trim()
      ? `Não encontramos resultados para "${cardName.trim()}". Tente escanear novamente ou busque manualmente.`
      : message;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        <View style={styles.card}>
          <View style={styles.iconRing}>
            <ThemedText style={styles.iconText}>!</ThemedText>
          </View>

          <ThemedText style={styles.title}>Carta não encontrada</ThemedText>
          <ThemedText style={styles.subtitle}>{description}</ThemedText>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              onPress={handleTryAgain}
              accessibilityRole="button"
              accessibilityLabel="Tentar novamente">
              <ThemedText style={styles.primaryButtonText}>Tentar novamente</ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              onPress={handleSearchManually}
              accessibilityRole="button"
              accessibilityLabel="Buscar manualmente">
              <ThemedText style={styles.secondaryButtonText}>Buscar manualmente</ThemedText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PokemonColors.screenBackground,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    backgroundColor: PokemonColors.white,
    borderRadius: 24,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    shadowColor: PokemonColors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    marginBottom: Spacing.three,
  },
  iconText: {
    fontSize: 36,
    fontWeight: '700',
    color: PokemonColors.statOrange,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
    marginBottom: Spacing.one,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: PokemonColors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.four,
  },
  actions: {
    width: '100%',
    gap: Spacing.two,
  },
  primaryButton: {
    backgroundColor: PokemonColors.primary,
    borderRadius: 999,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: PokemonColors.white,
  },
  secondaryButton: {
    backgroundColor: PokemonColors.white,
    borderRadius: 999,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PokemonColors.border,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: PokemonColors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
});
