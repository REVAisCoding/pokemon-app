import { type ScannedCard } from '@/constants/scan-data';

let pendingImageUri: string | null = null;
let pendingCandidates: ScannedCard[] | null = null;
let pendingExtractedName: string | null = null;

export function setPendingScanImage(imageUri: string) {
  pendingImageUri = imageUri;
}

export function consumePendingScanImage(): string | null {
  const imageUri = pendingImageUri;
  pendingImageUri = null;
  return imageUri;
}

export function setPendingScanCandidates(cards: ScannedCard[], extractedName: string | null) {
  pendingCandidates = cards;
  pendingExtractedName = extractedName;
}

export function consumePendingScanCandidates(): {
  cards: ScannedCard[];
  extractedName: string | null;
} | null {
  if (!pendingCandidates) {
    return null;
  }

  const result = {
    cards: pendingCandidates,
    extractedName: pendingExtractedName,
  };

  pendingCandidates = null;
  pendingExtractedName = null;

  return result;
}
