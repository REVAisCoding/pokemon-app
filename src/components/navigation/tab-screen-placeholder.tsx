import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';

type TabScreenPlaceholderProps = {
  title: string;
  description?: string;
};

export function TabScreenPlaceholder({ title, description }: TabScreenPlaceholderProps) {
  const styles = usePokemonStyles(createStyles);
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {description ? <ThemedText style={styles.description}>{description}</ThemedText> : null}
      </SafeAreaView>
    </ThemedView>
  );
}

function createStyles(colors: PokemonColorPalette) {
  return {
  container: {
    flex: 1,
    backgroundColor: colors.screenBackground,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: Spacing.one,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
  },
};
}
