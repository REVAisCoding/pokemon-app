import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { useGameSelection } from '@/contexts/game-selection-context';

export function AuthRedirect() {
  const { session, isLoading } = useAuth();
  const { selectedGame, isLoading: isGameSelectionLoading } = useGameSelection();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || isGameSelectionLoading) {
      return;
    }

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';
    const onGameSelect = segments[0] === 'game-select';

    if (!session && !inAuthGroup) {
      router.replace('/login');
      return;
    }

    if (!session) {
      return;
    }

    if (inAuthGroup) {
      router.replace(selectedGame ? '/' : '/game-select');
      return;
    }

    if (!selectedGame && !onGameSelect) {
      router.replace('/game-select');
    }
  }, [session, isLoading, isGameSelectionLoading, selectedGame, segments, router]);

  return null;
}
