import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';

import { AuthRedirect } from '@/components/auth/auth-redirect';
import { AuthProvider } from '@/contexts/auth-context';
import { GameSelectionProvider, useGameSelection } from '@/contexts/game-selection-context';
import { PokemonColors } from '@/constants/pokemon-theme';

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { isLoading } = useGameSelection();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PokemonColors.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthRedirect />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="game-select" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <GameSelectionProvider>
        <RootNavigator />
      </GameSelectionProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PokemonColors.screenBackground,
  },
});
