import AsyncStorage from '@react-native-async-storage/async-storage';

import { type CollectionCard } from '@/types/collection-card';
import { migrateStoredCard, normalizeCollectionCard } from '@/utils/collectionCardMigration';

const COLLECTION_STORAGE_PREFIX = '@pokemon_app/collection';

function getStorageKey(userId: string) {
  return `${COLLECTION_STORAGE_PREFIX}/${userId}`;
}

function parseStoredCollection(rawValue: string | null): CollectionCard[] {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(migrateStoredCard)
      .filter((card): card is CollectionCard => card !== null)
      .map(normalizeCollectionCard);
  } catch {
    return [];
  }
}

export async function loadCollectionFromStorage(userId: string): Promise<CollectionCard[]> {
  const rawValue = await AsyncStorage.getItem(getStorageKey(userId));
  return parseStoredCollection(rawValue);
}

export async function saveCollectionToStorage(
  userId: string,
  cards: CollectionCard[],
): Promise<void> {
  await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(cards));
}
