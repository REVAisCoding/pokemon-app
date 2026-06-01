import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';

type ProfileSectionProps = {
  label: string;
  children: ReactNode;
};

export function ProfileSection({ label, children }: ProfileSectionProps) {
  return (
    <View style={styles.card}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PokemonColors.white,
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: PokemonColors.textSecondary,
    marginBottom: Spacing.one,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
