import { ScrollView, View } from 'react-native';

import { SetCardItem } from '@/components/home/set-card-item';
import { SectionHeader } from '@/components/home/section-header';
import { ThemedText } from '@/components/themed-text';
import { useEnrichedSetGroups } from '@/hooks/use-enriched-set-groups';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';
import { Spacing } from '@/constants/theme';
import { type CollectionSetGroup } from '@/types/collection-set';

type MySetsSectionProps = {
  sets: CollectionSetGroup[];
  onSeeAllPress?: () => void;
  onSetPress?: (setId: string) => void;
};

export function MySetsSection({ sets, onSeeAllPress, onSetPress }: MySetsSectionProps) {
  const styles = usePokemonStyles(createStyles);
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

function createStyles(colors: PokemonColorPalette) {
  return {
  container: {
    marginBottom: Spacing.three,
  },
  listContent: {
    paddingRight: Spacing.three,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: Spacing.four,
    alignItems: 'center' as const,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center' as const,
  },
};
}
