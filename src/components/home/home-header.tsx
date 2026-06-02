import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';

type HomeHeaderProps = {
  userName: string;
  subtitle: string;
  onBackPress: () => void;
};

export function HomeHeader({ userName, subtitle, onBackPress }: HomeHeaderProps) {
  const styles = usePokemonStyles(createStyles);
  return (
    <View style={styles.container}>
      <View style={styles.greetingRow}>
        <ThemedText style={styles.greeting}>Olá, {userName}! 👋</ThemedText>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={onBackPress}
          accessibilityRole="button"
          accessibilityLabel="Voltar para escolha de jogos">
          <ThemedText style={styles.backButtonText}>Voltar</ThemedText>
        </Pressable>
      </View>
      <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
    </View>
  );
}

function createStyles(colors: PokemonColorPalette) {
  return {
  container: {
    marginBottom: Spacing.three,
  },
  greetingRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: Spacing.one,
    gap: Spacing.two,
  },
  backButton: {
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.one,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  greeting: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
};
}
