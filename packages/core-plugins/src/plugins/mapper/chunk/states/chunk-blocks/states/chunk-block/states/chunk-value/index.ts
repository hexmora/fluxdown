import { once, useClearable, useMap } from 'stative';

import type { ChunkCharacter } from '../../../../../../utils';
import type { ChunkValueInputs } from './type';

import { createChunkRoot } from '../../../../../../utils';

export const ChunkValue = /*#__PURE__*/ once(function ChunkValue({
  source,
  current,
  initial,
  clock,
  duration: _duration,
}: ChunkValueInputs) {
  const previous = useClearable(source.fork({ range: current.range, meta: current.meta }));

  let characters: ChunkCharacter[] = [];

  let first = true;

  return useMap([previous.value, _duration], ([root, duration]) => {
    const result = createChunkRoot(root, characters, {
      initial: first && initial,
      start: clock.value.value,
      duration,
    });

    characters = result.characters;

    first = false;

    return result.root;
  });
});
