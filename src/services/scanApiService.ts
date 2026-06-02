import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { type ScannedCard } from '@/constants/scan-data';
import { type CardGameType } from '@/types/cardGame';
import { fetchWithTimeout } from '@/utils/fetch-with-timeout';

const SCAN_REQUEST_TIMEOUT_MS = 90_000;

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

function parseScanApiErrorDetail(detail: unknown): string | undefined {
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const firstMessage = detail.find(
      (entry): entry is { msg?: string } =>
        typeof entry === 'object' && entry !== null && typeof entry.msg === 'string',
    )?.msg;

    if (firstMessage) {
      return firstMessage;
    }
  }

  return undefined;
}

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

  const response = await fetchWithTimeout(
    `${scanApiUrl}/scan-card`,
    {
      method: 'POST',
      body: formData,
    },
    SCAN_REQUEST_TIMEOUT_MS,
  );

  if (!response) {
    throw new Error(
      'A análise demorou demais ou não foi possível conectar ao servidor de scan. Tente novamente.',
    );
  }

  if (!response.ok) {
    let message = 'Não foi possível analisar a carta. Tente novamente.';

    try {
      const payload = (await response.json()) as { detail?: unknown };
      const parsedDetail = parseScanApiErrorDetail(payload.detail);

      if (parsedDetail) {
        message = parsedDetail;
      }
    } catch {
      // Keep default message when response body is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as ScanCardResponse;
}
