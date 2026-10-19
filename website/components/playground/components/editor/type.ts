import type { Locale } from '../../../type';
import type { ANIMATION_SPEEDS } from './consts';

export type EditorEffect = 'none' | 'shad' | 'scale';

export type AnimationSpeed = (typeof ANIMATION_SPEEDS)[number];

export type EditorProps = {
  lang: Locale;
};
