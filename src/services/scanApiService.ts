import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { type ScannedCard } from '@/constants/scan-data';
import { type CardGameType } from '@/types/cardGame';

const DEFAULT_SCAN_API_URL = 'http://localhost:8000';
const SCAN_API_PORT = '8000';

function getDevMachineHost(): string | null {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    Constants.expoConfig?.hostUri?.split(':')[0] ??
    null;

  if (!debuggerHost) {
    return null;
  }

  return debuggerHost.split(':')[0] ?? null;
}

function resolveScanApiUrl(configuredUrl: string): string {
  const normalizedUrl = configuredUrl.replace(/\/$/, '');

  if (!normalizedUrl.includes('localhost') && !normalizedUrl.includes('127.0.0.1')) {
    return normalizedUrl;
  }

  if (Platform.OS === 'android' && !Constants.isDevice) {
    return normalizedUrl.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  }

  const devHost = getDevMachineHost();
  if (devHost) {
    return normalizedUrl
      .replace('localhost', devHost)
      .replace('127.0.0.1', devHost);
  }

  return normalizedUrl;
}

export function getScanApiUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_SCAN_API_URL?.trim();

  if (configuredUrl) {
    return resolveScanApiUrl(configuredUrl);
  }

  const devHost = getDevMachineHost();
  if (devHost) {
    return `http://${devHost}:${SCAN_API_PORT}`;
  }

  return DEFAULT_SCAN_API_URL;
}

export type ExtractedCardInfo = {
  name: string | null;
  nameEnglish: string | null;
  number: string | null;
  set: string | null;
  language: string | null;
};

export type ScanCardResponse = {
  confidence: 'high' | 'medium' | 'low';
  extracted: ExtractedCardInfo;
  candidates: ScannedCard[];
};

export async function scanCardFromImage(
  imageUri: string,
  gameType: CardGameType = 'pokemon',
): Promise<ScanCardResponse> {
  const scanApiUrl = getScanApiUrl();
  const formData = new FormData();

  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'card.jpg',
  } as unknown as Blob);
  formData.append('game_type', gameType);

  let response: Response;

  try {
    response = await fetch(`${scanApiUrl}/scan-card`, {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new Error(
      `Não foi possível conectar ao backend de scan (${scanApiUrl}). Verifique se o servidor está rodando.`,
    );
  }

  if (!response.ok) {
    let message = 'Não foi possível analisar a carta. Tente novamente.';

    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload.detail) {
        message = payload.detail;
      }
    } catch {
      // Keep default message when response body is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as ScanCardResponse;
}
