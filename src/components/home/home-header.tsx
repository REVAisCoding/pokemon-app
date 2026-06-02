import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';

type HomeHeaderProps = {
  userName: string;
  subtitle: string;
  onBackPress: () => void;
};

export function HomeHeader({ userName, subtitle, onBackPress }: HomeHeaderProps) {
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

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
    gap: Spacing.two,
  },
  backButton: {
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.one,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: PokemonColors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  greeting: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: PokemonColors.textSecondary,
  },
});
