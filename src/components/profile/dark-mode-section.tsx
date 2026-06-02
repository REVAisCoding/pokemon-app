import { Switch, View } from 'react-native';

import { ProfileSection } from '@/components/profile/profile-section';
import { ThemedText } from '@/components/themed-text';
import { type PokemonColorPalette } from '@/constants/pokemon-theme';
import { useColorSchemePreference } from '@/contexts/color-scheme-context';
import { usePokemonStyles } from '@/hooks/use-pokemon-styles';

export function DarkModeSection() {
  const { isDarkMode, setDarkMode } = useColorSchemePreference();
  const styles = usePokemonStyles(createStyles);

  return (
    <ProfileSection label="Aparência">
      <View style={styles.row}>
        <View style={styles.copy}>
          <ThemedText style={styles.value}>Modo escuro</ThemedText>
          <ThemedText style={styles.hint}>Aplica o tema escuro em todo o app</ThemedText>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={(enabled) => void setDarkMode(enabled)}
          accessibilityRole="switch"
          accessibilityLabel="Ativar modo escuro"
          accessibilityState={{ checked: isDarkMode }}
        />
      </View>
    </ProfileSection>
  );
}

function createStyles(colors: PokemonColorPalette) {
  return {
    row: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      gap: 16,
    },
    copy: {
      flex: 1,
    },
    value: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: colors.textPrimary,
    },
    hint: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
      lineHeight: 18,
    },
  };
}
