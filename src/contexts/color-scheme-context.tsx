import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  loadDarkModePreference,
  saveDarkModePreference,
} from '@/services/colorSchemeStorage';

type ColorSchemeContextValue = {
  isDarkMode: boolean;
  isLoaded: boolean;
  setDarkMode: (enabled: boolean) => Promise<void>;
};

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

type ColorSchemeProviderProps = {
  children: ReactNode;
};

export function ColorSchemeProvider({ children }: ColorSchemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPreference = async () => {
      try {
        const storedValue = await loadDarkModePreference();

        if (isMounted) {
          setIsDarkMode(storedValue);
        }
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    void loadPreference();

    return () => {
      isMounted = false;
    };
  }, []);

  const setDarkMode = useCallback(async (enabled: boolean) => {
    setIsDarkMode(enabled);
    await saveDarkModePreference(enabled);
  }, []);

  const value = useMemo(
    () => ({
      isDarkMode,
      isLoaded,
      setDarkMode,
    }),
    [isDarkMode, isLoaded, setDarkMode],
  );

  return <ColorSchemeContext.Provider value={value}>{children}</ColorSchemeContext.Provider>;
}

export function useColorSchemePreference() {
  const context = useContext(ColorSchemeContext);

  if (!context) {
    throw new Error('useColorSchemePreference must be used within a ColorSchemeProvider');
  }

  return context;
}
