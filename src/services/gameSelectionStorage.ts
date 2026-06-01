import AsyncStorage from '@react-native-async-storage/async-storage';

import { isCardGameId, type CardGameId } from '@/constants/card-games';

const SELECTED_GAME_STORAGE_PREFIX = '@pokemon_app/selected_game';

const LEGACY_GAME_ID_MAP: Record<string, CardGameId> = {
  'pokemon-tcg': 'pokemon',
  runeterra: 'riftbound',
};

function getStorageKey(userId: string) {
  return `${SELECTED_GAME_STORAGE_PREFIX}/${userId}`;
}

function normalizeStoredGameId(rawValue: string): CardGameId | null {
  const migrated = LEGACY_GAME_ID_MAP[rawValue] ?? rawValue;

  if (!isCardGameId(migrated)) {
    return null;
  }

  return migrated;
}

export async function loadSelectedGame(userId: string): Promise<CardGameId | null> {
  const rawValue = await AsyncStorage.getItem(getStorageKey(userId));

  if (!rawValue) {
    return null;
  }

  const gameId = normalizeStoredGameId(rawValue);

  if (!gameId) {
    return null;
  }

  if (gameId !== rawValue) {
    await AsyncStorage.setItem(getStorageKey(userId), gameId);
  }

  return gameId;
}

export async function saveSelectedGame(userId: string, gameId: CardGameId): Promise<void> {
  await AsyncStorage.setItem(getStorageKey(userId), gameId);
}

export async function clearSelectedGame(userId: string): Promise<void> {
  await AsyncStorage.removeItem(getStorageKey(userId));
}
