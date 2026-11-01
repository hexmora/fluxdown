import type { CSSProperties } from 'vue';

import type { MEASUREMENT_NAMES } from './consts';

export interface MaskedTextProps {
  text: string;

  textStyle: CSSProperties;

  maskText: string;

  trailingText?: string;

  tail?: boolean;
}

export interface TextSize {
  width: number;

  height: number;
}

export interface MaskFrameInputs extends TextSize {
  maskWidth: number;

  maskEnd: number;

  padding: number;

  pixelRatio: number;
}

export interface MaskFrame extends TextSize {
  left: number;

  step: number;

  start: number;

  maskWidth: number;

  maskEnd: number;

  prefixWidth: number;

  activeWidth: number;
}

export type MeasurementName = (typeof MEASUREMENT_NAMES)[number];

export type Measurements = Record<MeasurementName, TextSize | null>;

export interface RevealedText {
  text: string;

  start: number;

  font: unknown[];
}
