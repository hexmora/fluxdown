import type { CSSProperties } from 'vue';

export interface ScaleTextProps {
  text: string;

  textStyle: CSSProperties;

  start: number;

  duration: number;

  from: number;

  blur: number;
}
