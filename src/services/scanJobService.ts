import { getCardGameConfig } from '@/config/cardGames';
import { type ScannedCard } from '@/constants/scan-data';
import { type CardGameType } from '@/types/cardGame';
import { fetchWithTimeout } from '@/utils/fetch-with-timeout';

import { getScanApiUrl, parseScanApiErrorDetail } from '@/services/scanApiService';

const SCAN_JOB_REQUEST_TIMEOUT_MS = 30_000;
const SCAN_JOB_POLL_TIMEOUT_MS = 15_000;

export type ScanJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type ScanJob = {
  id: string;
  status: ScanJobStatus;
  gameType: CardGameType;
  imageUrl?: string | null;
  detectedName?: string | null;
  resultCandidates?: ScannedCard[] | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ScanJobApiCandidate = {
  id: string;
  name: string;
  setName: string;
  number: string;
  type: string;
  imageUrl: string;
  accentColor: string;
  rarity?: string | null;
  estimatedValueBrl?: number | null;
};

type ScanJobApiResponse = {
  id: string;
  status: ScanJobStatus;
  gameType: CardGameType;
  imageUrl?: string | null;
  detectedName?: string | null;
  resultCandidates?: ScanJobApiCandidate[] | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapCandidate(candidate: ScanJobApiCandidate, gameType: CardGameType): ScannedCard {
  return {
    id: candidate.id,
    name: candidate.name,
    setName: candidate.setName,
    number: candidate.number,
    type: candidate.type,
    imageUrl: candidate.imageUrl,
    accentColor: candidate.accentColor || getCardGameConfig(gameType).themeColor,
    gameType,
    ...(candidate.rarity ? { rarity: candidate.rarity } : {}),
    ...(candidate.estimatedValueBrl != null
      ? { estimatedValueBrl: candidate.estimatedValueBrl }
      : {}),
  };
}

function mapScanJob(payload: ScanJobApiResponse): ScanJob {
  return {
    id: payload.id,
    status: payload.status,
    gameType: payload.gameType,
    imageUrl: payload.imageUrl,
    detectedName: payload.detectedName,
    resultCandidates: payload.resultCandidates?.map((candidate) =>
      mapCandidate(candidate, payload.gameType),
    ),
    errorMessage: payload.errorMessage,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
  };
}

async function parseApiError(response: Response, fallback: string): Promise<string> {
  try {
    const payload = (await response.json()) as { detail?: unknown };
    return parseScanApiErrorDetail(payload.detail) ?? fallback;
  } catch {
    return fallback;
  }
}

function buildAuthHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export class AsyncScanUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AsyncScanUnavailableError';
  }
}

export function isAsyncScanUnavailableError(error: unknown): boolean {
  return error instanceof AsyncScanUnavailableError;
}

export async function createScanJob(
  imageUri: string,
  gameType: CardGameType,
  accessToken: string,
): Promise<{ jobId: string }> {
  const formData = new FormData();

  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'card.jpg',
  } as unknown as Blob);
  formData.append('game_type', gameType);

  const response = await fetchWithTimeout(
    `${getScanApiUrl()}/scan-jobs`,
    {
      method: 'POST',
      headers: buildAuthHeaders(accessToken),
      body: formData,
    },
    SCAN_JOB_REQUEST_TIMEOUT_MS,
  );

  if (!response) {
    throw new Error('Não foi possível conectar ao servidor de scan. Tente novamente.');
  }

  if (!response.ok) {
    const message = await parseApiError(
      response,
      'Não foi possível iniciar o scan. Tente novamente.',
    );

    if (response.status === 503) {
      throw new AsyncScanUnavailableError(message);
    }

    throw new Error(message);
  }

  const payload = (await response.json()) as { jobId: string };

  if (!payload.jobId) {
    throw new Error('Resposta inválida ao criar o job de scan.');
  }

  return { jobId: payload.jobId };
}

export async function getScanJob(jobId: string, accessToken: string): Promise<ScanJob> {
  const response = await fetchWithTimeout(
    `${getScanApiUrl()}/scan-jobs/${encodeURIComponent(jobId)}`,
    {
      headers: buildAuthHeaders(accessToken),
    },
    SCAN_JOB_POLL_TIMEOUT_MS,
  );

  if (!response) {
    throw new Error('Não foi possível consultar o status do scan.');
  }

  if (response.status === 404) {
    throw new Error('Scan não encontrado.');
  }

  if (!response.ok) {
    const message = await parseApiError(
      response,
      'Não foi possível consultar o status do scan.',
    );
    throw new Error(message);
  }

  return mapScanJob((await response.json()) as ScanJobApiResponse);
}

export async function listActiveScanJobs(accessToken: string): Promise<ScanJob[]> {
  const response = await fetchWithTimeout(
    `${getScanApiUrl()}/scan-jobs`,
    {
      headers: buildAuthHeaders(accessToken),
    },
    SCAN_JOB_POLL_TIMEOUT_MS,
  );

  if (!response) {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as ScanJobApiResponse[];
  return payload.map(mapScanJob);
}

export async function confirmScanJob(jobId: string, accessToken: string): Promise<void> {
  const response = await fetchWithTimeout(
    `${getScanApiUrl()}/scan-jobs/${encodeURIComponent(jobId)}/confirm`,
    {
      method: 'POST',
      headers: buildAuthHeaders(accessToken),
    },
    SCAN_JOB_POLL_TIMEOUT_MS,
  );

  if (!response || !response.ok) {
    return;
  }
}

export const SCAN_JOB_POLL_INTERVAL_MS = 2500;
