import { ScrollView, StyleSheet, View } from 'react-native';

import { SectionHeader } from '@/components/home/section-header';
import { SetItem } from '@/components/home/set-item';
import { CollectionSet } from '@/constants/home-data';
import { Spacing } from '@/constants/theme';

type SetsSectionProps = {
  sets: CollectionSet[];
  onSeeAllPress?: () => void;
};

export function SetsSection({ sets, onSeeAllPress }: SetsSectionProps) {
  return (
    <View style={styles.container}>
      <SectionHeader title="Coleções & Sets" onActionPress={onSeeAllPress} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}>
        {sets.map((set) => (
          <SetItem key={set.id} set={set} />
        ))}
      </ScrollView>
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
});
