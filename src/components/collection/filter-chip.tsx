import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';

type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}>
      <ThemedText style={[styles.label, selected && styles.labelSelected]}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 999,
    backgroundColor: PokemonColors.white,
    borderWidth: 1,
    borderColor: PokemonColors.border,
    marginRight: Spacing.one,
  },
  chipSelected: {
    backgroundColor: PokemonColors.primary,
    borderColor: PokemonColors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: PokemonColors.textSecondary,
  },
  labelSelected: {
    color: PokemonColors.white,
  },
  pressed: {
    opacity: 0.85,
  },
});
