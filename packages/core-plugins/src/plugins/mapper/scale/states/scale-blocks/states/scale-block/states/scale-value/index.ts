import { getTime } from '@fluxdown/utils';
import { once, useClearable, useMap } from 'stative';

import type { ScaleCharacter } from '../../../../../../utils';
import type { ScaleValueInputs } from './type';

import { createScaleRoot } from '../../../../../../utils';

export const ScaleValue = /*#__PURE__*/ once(function ScaleValue({
  source,
  current,
  initial,
  duration: _duration,
  from: _from,
  blur: _blur,
}: ScaleValueInputs) {
  const previous = useClearable(source.fork({ range: current.range, meta: current.meta }));

  let characters: ScaleCharacter[] = [];

  let first = true;

  return useMap([previous.value, _duration, _from, _blur], ([root, duration, from, blur]) => {
    const result = createScaleRoot(root, characters, {
      initial: first && initial,
      start: getTime(),
      duration,
      from,
      blur,
    });

    characters = result.characters;

    first = false;

    return result.root;
  });
});
