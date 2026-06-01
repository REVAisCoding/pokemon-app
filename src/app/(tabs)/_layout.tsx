import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { BottomNavBar } from '@/components/navigation/bottom-nav-bar';
import { CardCollectionProvider } from '@/contexts/card-collection-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <CardCollectionProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Tabs
          tabBar={(props) => <BottomNavBar {...props} />}
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
          }}>
          <Tabs.Screen name="index" options={{ title: 'Início' }} />
          <Tabs.Screen name="collection" options={{ title: 'Coleção' }} />
          <Tabs.Screen
            name="scan"
            options={{ title: 'Escanear', tabBarStyle: { display: 'none' } }}
          />
          <Tabs.Screen name="search" options={{ title: 'Buscar' }} />
          <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
        </Tabs>
      </ThemeProvider>
    </CardCollectionProvider>
  );
}
