import type { Root as HastRoot } from 'hast';

import type { FadeConcurrency } from './concurrency';
import type { ShadCharacter, ShadRootConfig } from './type';

import { createEntranceRoot } from '../../../../utils';
import {
  SHAD_DATA_ATTR,
  SHAD_DEFAULT_DURATION,
  SHAD_DEFAULT_LENGTH,
  SHAD_FADE_VALUE,
  SHAD_TAG_NAME,
} from './consts';

export * from './concurrency';
export * from './consts';
export * from './type';

const toFinite = (value: number, fallback: number) =>
  Number.isFinite(value) ? Math.max(0, value) : fallback;

/**
 * Give each newly visible character its own opacity fade, independent of reveal progress.
 * Batches that arrive while many characters are fading get shorter fades.
 */
export const createShadRoot = (
  root: HastRoot,
  previous: ShadCharacter[],
  { initial, start, length: _length, duration: _duration }: ShadRootConfig,
  concurrency: FadeConcurrency,
) => {
  const length = Math.floor(toFinite(_length, SHAD_DEFAULT_LENGTH));

  const duration = toFinite(_duration, SHAD_DEFAULT_DURATION);

  return createEntranceRoot(root, previous, {
    // A zero length disables the fade: new characters appear settled.
    initial: initial || length === 0,
    start,
    duration: (added) => concurrency.allocate(start, added, length, duration),
    wrap: (text, entrance, fade, index) => ({
      type: 'element',
      tagName: SHAD_TAG_NAME,
      properties: {
        [SHAD_DATA_ATTR]: SHAD_FADE_VALUE,
        dataShadStart: entrance,
        dataShadDuration: fade,
      },
      data: { renderKey: `shad:${index}:${entrance}` },
      children: [text],
    }),
    isWrapper: (element, entrance, fade) =>
      element.properties[SHAD_DATA_ATTR] === SHAD_FADE_VALUE &&
      element.properties.dataShadStart === entrance &&
      element.properties.dataShadDuration === fade,
  });
};
