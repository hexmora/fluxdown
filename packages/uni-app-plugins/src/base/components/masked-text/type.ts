import type { CSSProperties } from 'vue';

export interface MaskedTextProps {
  text: string;

  textStyle: CSSProperties;

  maskText: string;

  trailingText?: string;
}

export interface Band {
  key: string;

  left: number;

  width: number;

  opacity: number;
}

export interface BandInputs {
  width: number;

  maskWidth: number;

  maskEnd: number;

  padding: number;

  pixelRatio: number;
}
