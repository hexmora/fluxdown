import type { EffectItem } from 'fluxdown';

import type { EditorEffect } from './type';

export const getEditorEffect = (effect: EditorEffect): false | EffectItem => {
  if (effect === 'none') {
    return false;
  }

  if (effect === 'suffix-cursor' || effect === 'suffix-dot') {
    return ['suffix', { type: effect === 'suffix-cursor' ? 'cursor' : 'dot' }];
  }

  return effect;
};
