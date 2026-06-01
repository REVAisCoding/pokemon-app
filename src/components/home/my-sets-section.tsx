import { ScrollView, StyleSheet, View } from 'react-native';

import { SetCardItem } from '@/components/home/set-card-item';
import { SectionHeader } from '@/components/home/section-header';
import { ThemedText } from '@/components/themed-text';
import { useEnrichedSetGroups } from '@/hooks/use-enriched-set-groups';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Spacing } from '@/constants/theme';
import { type CollectionSetGroup } from '@/types/collection-set';

type MySetsSectionProps = {
  sets: CollectionSetGroup[];
  onSeeAllPress?: () => void;
  onSetPress?: (setId: string) => void;
};

export function MySetsSection({ sets, onSeeAllPress, onSetPress }: MySetsSectionProps) {
  const enrichedSets = useEnrichedSetGroups(sets);

  return (
    <View style={styles.container}>
      <SectionHeader title="Meus Sets" onActionPress={onSeeAllPress} />

      {enrichedSets.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            Seus sets aparecerão aqui quando você adicionar cartas
          </ThemedText>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}>
          {enrichedSets.map((set) => (
            <SetCardItem
              key={set.setId}
              set={set}
              onPress={onSetPress ? () => onSetPress(set.setId) : undefined}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
  },
  listContent: {
    paddingRight: Spacing.three,
  },
  emptyState: {
    backgroundColor: PokemonColors.white,
    borderRadius: 16,
    padding: Spacing.four,
    alignItems: 'center',
    shadowColor: PokemonColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: PokemonColors.textSecondary,
    textAlign: 'center',
  },
});
