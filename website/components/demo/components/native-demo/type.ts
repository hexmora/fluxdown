import type { StreamingConfig } from 'fluxdown';

export type NativeDemoPack = 'full' | 'lite' | 'raw';

export type NativeDemoEffect = 'none' | 'shad' | 'scale' | 'chunk' | 'cursor' | 'dot' | 'combined';

export type NativeDemoSample = 'paragraph' | 'formatting' | 'code' | 'math';

export type NativePreviewProps = {
  pack: NativeDemoPack;
  dark: boolean;
  streaming: boolean | StreamingConfig;
  text: string;
};
