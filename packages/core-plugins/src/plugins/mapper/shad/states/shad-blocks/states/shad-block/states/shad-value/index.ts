import { once, useClearable, useMap } from 'stative';

import type { ShadCharacter } from '../../../../../../utils';
import type { ShadValueInputs } from './type';

import { createShadRoot } from '../../../../../../utils';

export * from './type';

export const ShadValue = /*#__PURE__*/ once(function ShadValue({
  source,
  current,
  initial,
  clock,
  concurrency,
  length: _length,
  duration: _duration,
}: ShadValueInputs) {
  // Reapply the preceding mapper with this fork's range and keep its inputs alive independently.
  const previous = useClearable(source.fork({ range: current.range, meta: current.meta }));

  let characters: ShadCharacter[] = [];

  let first = true;

  return useMap([previous.value, _length, _duration], ([root, length, duration]) => {
    const result = createShadRoot(
      root,
      characters,
      { initial: first && initial, start: clock.value.value, length, duration },
      concurrency,
    );

    characters = result.characters;

    first = false;

    return result.root;
  });
});
