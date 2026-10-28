import type { PreviewEffectItem } from '../../../../demo/components/renderer-preview';
import type { AnimationSpeed, EditorEffect, EditorTuning } from '../type';

import { CHUNK_DURATION, SHAD_DURATION } from '../consts';

/**
 * Streaming effect configuration with wall-clock durations stretched for `speed`.
 */
export const getEffectConfig = (
  effect: EditorEffect,
  speed: AnimationSpeed,
  tuning: EditorTuning,
): false | PreviewEffectItem => {
  switch (effect) {
    case 'none':
      return false;
    case 'shad':
      return ['shad', { length: tuning.fadeLength, duration: SHAD_DURATION / speed }];
    case 'scale':
      return ['scale', { duration: tuning.entranceDuration / speed }];
    case 'chunk':
      return ['chunk', { duration: CHUNK_DURATION / speed }];
    case 'suffix-cursor':
    case 'suffix-dot':
      return ['suffix', { type: effect === 'suffix-cursor' ? 'cursor' : 'dot' }];
  }
};
