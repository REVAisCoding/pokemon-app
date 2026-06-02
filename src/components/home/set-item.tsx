import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CollectionSet } from '@/constants/home-data';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';

type SetItemProps = {
  set: CollectionSet;
};

export function SetItem({ set }: SetItemProps) {
  const styles = usePokemonStyles(createStyles);
  return (
    <View style={styles.container}>
      <View style={[styles.icon, { backgroundColor: set.backgroundColor }]}>
        <ThemedText style={[styles.abbreviation, { color: set.labelColor }]}>{set.abbreviation}</ThemedText>
      </View>
      <ThemedText style={styles.name} numberOfLines={1}>
        {set.name}
      </ThemedText>
      <ThemedText style={styles.progress}>{set.progress}</ThemedText>
    </View>
  );
}

function createStyles(colors: PokemonColorPalette) {
  return {
  container: {
    width: 88,
    alignItems: 'center' as const,
    marginRight: Spacing.three,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: Spacing.two,
  },
  abbreviation: {
    fontSize: 18,
    fontWeight: '800' as const,
  },
  name: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    textAlign: 'center' as const,
    marginBottom: 2,
  },
  progress: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center' as const,
  },
};
}
