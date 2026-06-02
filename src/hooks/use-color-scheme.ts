import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useColorSchemePreference } from '@/contexts/color-scheme-context';

export function useColorScheme(): 'light' | 'dark' {
  const { isDarkMode, isLoaded } = useColorSchemePreference();
  const systemScheme = useSystemColorScheme();

  if (!isLoaded) {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }

  return isDarkMode ? 'dark' : 'light';
}
