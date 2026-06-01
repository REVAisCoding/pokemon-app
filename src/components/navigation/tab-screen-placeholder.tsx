import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { PokemonColors } from '@/constants/pokemon-theme';

type TabScreenPlaceholderProps = {
  title: string;
  description?: string;
};

export function TabScreenPlaceholder({ title, description }: TabScreenPlaceholderProps) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {description ? <ThemedText style={styles.description}>{description}</ThemedText> : null}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PokemonColors.screenBackground,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: PokemonColors.textPrimary,
    marginBottom: Spacing.one,
  },
  description: {
    fontSize: 14,
    color: PokemonColors.textSecondary,
  },
});
