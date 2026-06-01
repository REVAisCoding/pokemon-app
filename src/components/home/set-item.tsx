import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CollectionSet } from '@/constants/home-data';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';

type SetItemProps = {
  set: CollectionSet;
};

export function SetItem({ set }: SetItemProps) {
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

const styles = StyleSheet.create({
  container: {
    width: 88,
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  abbreviation: {
    fontSize: 18,
    fontWeight: '800',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: PokemonColors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  progress: {
    fontSize: 12,
    color: PokemonColors.textSecondary,
    textAlign: 'center',
  },
});
