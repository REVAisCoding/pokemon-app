/** Ajuste estes valores para controlar a intensidade do brilho no viewer. */
export const SHIMMER_CONFIG = {
  /** Opacidade base do gradiente holográfico (0–1). */
  baseOpacityMin: 0.22,
  baseOpacityMax: 0.42,
  /** Opacidade do highlight diagonal (0–1). */
  highlightOpacityMin: 0.14,
  highlightOpacityMax: 0.32,
  /** Quanto o brilho se desloca conforme o tilt (px por grau). */
  translateFactor: 2.8,
  /** Deslocamento extra do feixe de luz diagonal. */
  highlightTranslateFactor: 3.6,
} as const;
