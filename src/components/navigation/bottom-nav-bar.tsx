import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeIcon } from '@/components/home/home-icon';
import { ThemedText } from '@/components/themed-text';
import { TAB_BAR_CENTER_BUTTON_SIZE, TAB_ITEMS } from '@/constants/navigation';
import { TAB_BAR_HEIGHT } from '@/constants/theme';
import { PokemonColors } from '@/constants/pokemon-theme';

function getNestedRouteName(
  routes: BottomTabBarProps['state']['routes'],
  routeIndex: number,
): string | undefined {
  const route = routes[routeIndex];
  const nestedState = route?.state;

  if (!nestedState || nestedState.routes.length === 0) {
    return 'index';
  }

  const activeRoute = nestedState.routes[nestedState.index ?? nestedState.routes.length - 1];
  return activeRoute?.name;
}

export function BottomNavBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.bar}>
        {TAB_ITEMS.map((item) => {
          const routeIndex = state.routes.findIndex((route) => route.name === item.name);
          const isFocused = state.index === routeIndex;
          const color = isFocused ? PokemonColors.primary : PokemonColors.textMuted;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: state.routes[routeIndex]?.key,
              canPreventDefault: true,
            });

            if (item.isCenter && isFocused) {
              navigation.navigate('scan', { screen: 'index' });
              return;
            }

            if (item.name === 'collection') {
              if (!event.defaultPrevented) {
                const nestedRouteName = getNestedRouteName(state.routes, routeIndex);
                const isOnCollectionIndex = nestedRouteName === 'index';

                if (!isFocused || !isOnCollectionIndex) {
                  navigation.navigate('collection', { screen: 'index' });
                }
              }
              return;
            }

            if (!isFocused && !event.defaultPrevented) {
              if (item.name === 'scan') {
                navigation.navigate('scan', { screen: 'index' });
                return;
              }

              navigation.navigate(item.name);
            }
          };

          if (item.isCenter) {
            return (
              <View key={item.name} style={styles.centerSlot}>
                <Pressable
                  style={({ pressed }) => [
                    styles.centerButton,
                    isFocused && styles.centerButtonActive,
                    pressed && styles.pressed,
                  ]}
                  onPress={onPress}
                  accessibilityRole="button"
                  accessibilityLabel="Escanear carta">
                  <HomeIcon name={item.icon} fallback={item.fallback} size={24} color={PokemonColors.white} />
                </Pressable>
              </View>
            );
          }

          return (
            <Pressable
              key={item.name}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={item.label}>
              <HomeIcon name={item.icon} fallback={item.fallback} size={22} color={color} />
              <ThemedText style={[styles.label, { color }]}>{item.label}</ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: PokemonColors.white,
    borderTopWidth: 1,
    borderTopColor: PokemonColors.border,
  },
  bar: {
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingBottom: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  centerButton: {
    width: TAB_BAR_CENTER_BUTTON_SIZE,
    height: TAB_BAR_CENTER_BUTTON_SIZE,
    borderRadius: TAB_BAR_CENTER_BUTTON_SIZE / 2,
    backgroundColor: PokemonColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    shadowColor: PokemonColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  centerButtonActive: {
    backgroundColor: PokemonColors.primaryDark,
  },
  pressed: {
    opacity: 0.85,
  },
});
