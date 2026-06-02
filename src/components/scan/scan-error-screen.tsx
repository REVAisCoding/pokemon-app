import { type Href, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';

type ScanErrorScreenProps = {
  cardName?: string | null;
  message?: string;
};

export function ScanErrorScreen({
  cardName,
  message = 'Não foi possível identificar a carta a partir da foto.',
}: ScanErrorScreenProps) {
  const styles = usePokemonStyles(createStyles);
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

function createStyles(colors: PokemonColorPalette) {
  return {
  container: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  content: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: Spacing.four,
  },
  card: {
    width: '100%' as const,
    maxWidth: 320,
    alignItems: 'center' as const,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    marginBottom: Spacing.three,
  },
  iconText: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: colors.statOrange,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: Spacing.one,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: Spacing.four,
  },
  actions: {
    width: '100%' as const,
    gap: Spacing.two,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: Spacing.three,
    alignItems: 'center' as const,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: Spacing.three,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
};
}
