import { combineMapClosure, once, useClearable, useMap, useSwitchMap } from 'stative';

import type { ShadValueInputs } from './type';

import { createShadRoot } from '../../../../../../utils';

export const ShadValue = /*#__PURE__*/ once(function ShadValue({
  source,
  current,
  tail,
  progress,
}: ShadValueInputs) {
  // Reapply the preceding mapper with this fork's range and keep its inputs alive independently.
  const previous = useClearable(source.fork({ range: current.range, meta: current.meta }));

  const active = useMap(tail, (lastBlock) => source === lastBlock);

  return useSwitchMap(active, (isTail) =>
    isTail
      ? combineMapClosure([previous.value, progress], ([root, position]) =>
          position.length > 0 ? createShadRoot(root, position) : root,
        )
      : previous.value,
  );
});
