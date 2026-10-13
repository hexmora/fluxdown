import { D, once, S, useMap } from 'stative';

import type { CompiledBlockInputs } from './type';

import { CompiledBlockContent } from './states';

export * from './type';

export const CompiledBlock = /*#__PURE__*/ once(
  ({ section, meta, isLast, compiler, ...inputs }: CompiledBlockInputs) => {
    const item = useMap(
      [section, meta, isLast],
      ([currentSection, currentMeta, currentIsLast]) => ({
        section: currentSection,
        meta: currentMeta,
        isLast: currentIsLast,
      }),
    );

    const idPrefix = useMap(inputs.config, (current) => current.idPrefix);

    return S([CompiledBlockContent, { ...inputs, item, idPrefix, compiler: D(compiler) }]);
  },
);
