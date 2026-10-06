import { once, S, useCombineMap, useMap } from 'stative';

import type { CompiledBlockInputs } from './type';

import { CompiledBlockContent } from './content';

export * from './type';

export const CompiledBlock = /*#__PURE__*/ once(
  ({ section, meta, isLast, ...inputs }: CompiledBlockInputs) => {
    const item = useCombineMap(
      [section, meta, isLast],
      ([currentSection, currentMeta, currentIsLast]) => ({
        section: currentSection,
        meta: currentMeta,
        isLast: currentIsLast,
      }),
    );

    const idPrefix = useMap(inputs.config, (current) => current.idPrefix);

    return S([CompiledBlockContent, { ...inputs, item, idPrefix }]);
  },
);
