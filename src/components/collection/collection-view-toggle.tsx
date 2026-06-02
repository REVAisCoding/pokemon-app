import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';

export type CollectionViewMode = 'cards' | 'sets' | 'duplicates' | 'rares';

type CollectionViewToggleProps = {
  value: CollectionViewMode;
  onChange: (value: CollectionViewMode) => void;
};

const OPTIONS: { value: CollectionViewMode; label: string }[] = [
  { value: 'cards', label: 'Todas' },
  { value: 'sets', label: 'Sets' },
  { value: 'duplicates', label: 'Repetidas' },
  { value: 'rares', label: 'Raras' },
];

export function CollectionViewToggle({ value, onChange }: CollectionViewToggleProps) {
  const styles = usePokemonStyles(createStyles);
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

function createStyles(colors: PokemonColorPalette) {
  return {
  container: {
    flexDirection: 'row' as const,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: Spacing.two,
  },
  option: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
  optionSelected: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.white,
  },
  pressed: {
    opacity: 0.85,
  },
};
}
