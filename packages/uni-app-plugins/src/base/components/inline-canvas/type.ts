import type { CSSProperties } from 'vue';

export interface InlineCanvasProps {
  text: string;

  textStyle: CSSProperties;

  start: number;

  duration: number;

  from: number;

  blur: number;

  maskText?: string;

  trailingText?: string;
}

export interface Size {
  width: number;

  height: number;
}
