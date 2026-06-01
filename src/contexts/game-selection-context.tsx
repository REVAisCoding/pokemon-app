import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { type CardGameId } from '@/constants/card-games';
import { useAuth } from '@/contexts/auth-context';
import {
  clearSelectedGame,
  loadSelectedGame,
  saveSelectedGame,
} from '@/services/gameSelectionStorage';

type GameSelectionContextValue = {
  selectedGame: CardGameId | null;
  isLoading: boolean;
  selectGame: (gameId: CardGameId) => Promise<void>;
  clearGameSelection: () => Promise<void>;
};

const GameSelectionContext = createContext<GameSelectionContextValue | null>(null);

type GameSelectionProviderProps = {
  children: ReactNode;
};

export function GameSelectionProvider({ children }: GameSelectionProviderProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [selectedGame, setSelectedGame] = useState<CardGameId | null>(null);
  const [loadedForUserId, setLoadedForUserId] = useState<string | null>(null);

  const userId = user?.id ?? null;
  const isLoading = isAuthLoading || (userId !== null && loadedForUserId !== userId);

  useEffect(() => {
    let isMounted = true;

    const loadSelection = async () => {
      if (!userId) {
        if (isMounted) {
          setSelectedGame(null);
          setLoadedForUserId(null);
        }

        return;
      }

      try {
        const storedGame = await loadSelectedGame(userId);

        if (isMounted) {
          setSelectedGame(storedGame);
          setLoadedForUserId(userId);
        }
      } catch {
        if (isMounted) {
          setSelectedGame(null);
          setLoadedForUserId(userId);
        }
      }
    };

    void loadSelection();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const selectGame = useCallback(
    async (gameId: CardGameId) => {
      if (!userId) {
        return;
      }

      await saveSelectedGame(userId, gameId);
      setSelectedGame(gameId);
      setLoadedForUserId(userId);
    },
    [userId],
  );

  const clearGameSelection = useCallback(async () => {
    if (!userId) {
      setSelectedGame(null);
      setLoadedForUserId(null);
      return;
    }

    await clearSelectedGame(userId);
    setSelectedGame(null);
    setLoadedForUserId(userId);
  }, [userId]);

  const value = useMemo(
    () => ({
      selectedGame,
      isLoading,
      selectGame,
      clearGameSelection,
    }),
    [selectedGame, isLoading, selectGame, clearGameSelection],
  );

  return <GameSelectionContext.Provider value={value}>{children}</GameSelectionContext.Provider>;
}

export function useGameSelection() {
  const context = useContext(GameSelectionContext);

  if (!context) {
    throw new Error('useGameSelection must be used within a GameSelectionProvider');
  }

  return context;
}
