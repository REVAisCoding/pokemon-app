import 'react-native-gesture-handler';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthRedirect } from '@/components/auth/auth-redirect';
import { AuthProvider } from '@/contexts/auth-context';
import { ExchangeRateProvider } from '@/contexts/exchange-rate-context';
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
        <Stack.Screen
          name="card-viewer"
          options={{
            presentation: 'modal',
            animation: 'fade',
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <GameSelectionProvider>
            <ExchangeRateProvider>
              <RootNavigator />
            </ExchangeRateProvider>
          </GameSelectionProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PokemonColors.screenBackground,
  },
});
