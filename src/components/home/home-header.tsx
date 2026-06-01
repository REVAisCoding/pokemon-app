import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';

type HomeHeaderProps = {
  userName: string;
  subtitle: string;
};

export function HomeHeader({ userName, subtitle }: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.greeting}>Olá, {userName}! 👋</ThemedText>
      <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    color: PokemonColors.textSecondary,
  },
});
