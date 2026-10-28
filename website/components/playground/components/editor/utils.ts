import type { PreviewStreaming } from '../../../demo/components/renderer-preview';
import type { EditorEffect } from './type';

export const getEditorEffect = (
  effect: EditorEffect,
): Exclude<PreviewStreaming, boolean>['effect'] => {
  if (effect === 'none') {
    return false;
  }

  if (effect === 'suffix-cursor' || effect === 'suffix-dot') {
    return ['suffix', { type: effect === 'suffix-cursor' ? 'cursor' : 'dot' }];
  }

  return effect;
};
