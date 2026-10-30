import type { FluxdownProps } from '../../../src/packs/full';

export type StreamingPreviewProps = FluxdownProps & {
  effect: 'scale' | 'shad' | 'suffix' | 'chunk';
};
