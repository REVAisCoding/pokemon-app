import { type ReactNode } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';

type ProfileSectionProps = {
  label: string;
  children: ReactNode;
};

export function ProfileSection({ label, children }: ProfileSectionProps) {
  const styles = usePokemonStyles(createStyles);
  return (
    <View style={styles.card}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {children}
    </View>
  );
}

function createStyles(colors: PokemonColorPalette) {
  return {
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: Spacing.one,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
  },
};
}
