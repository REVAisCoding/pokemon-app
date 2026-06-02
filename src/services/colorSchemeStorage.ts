import AsyncStorage from '@react-native-async-storage/async-storage';

const DARK_MODE_STORAGE_KEY = '@pokemon_app/dark_mode';

export async function loadDarkModePreference(): Promise<boolean> {
  const rawValue = await AsyncStorage.getItem(DARK_MODE_STORAGE_KEY);

  return rawValue === 'true';
}

export async function saveDarkModePreference(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(DARK_MODE_STORAGE_KEY, enabled ? 'true' : 'false');
}
