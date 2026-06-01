import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';

export type CollectionViewMode = 'cards' | 'sets' | 'duplicates';

type CollectionViewToggleProps = {
  value: CollectionViewMode;
  onChange: (value: CollectionViewMode) => void;
};

const OPTIONS: { value: CollectionViewMode; label: string }[] = [
  { value: 'cards', label: 'Todas' },
  { value: 'sets', label: 'Sets' },
  { value: 'duplicates', label: 'Repetidas' },
];

export function CollectionViewToggle({ value, onChange }: CollectionViewToggleProps) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const selected = value === option.value;

        return (
          <Pressable
            key={option.value}
            style={({ pressed }) => [
              styles.option,
              selected && styles.optionSelected,
              pressed && styles.pressed,
            ]}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}>
            <ThemedText style={[styles.label, selected && styles.labelSelected]}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: PokemonColors.white,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: PokemonColors.border,
    marginBottom: Spacing.two,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
  optionSelected: {
    backgroundColor: PokemonColors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: PokemonColors.textSecondary,
  },
  labelSelected: {
    color: PokemonColors.white,
  },
  pressed: {
    opacity: 0.85,
  },
});
