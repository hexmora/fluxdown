import { isEqual } from 'lodash-es';
import { mapClosure, once, S, useMap, useMapEach } from 'stative';

import type { BlockCompilerInputs, BlockCompilerItem, IBlockCompiler } from './type';

import { CompiledBlock } from './states';

export * from './states';
export * from './type';

export const BlockCompiler = /*#__PURE__*/ once(
  ({ sections, config, getRemarks, getRehypes }: BlockCompilerInputs): IBlockCompiler => {
    let nextKey = 0;

    const count = useMap(sections, (current) => current.length);

    const items = useMap(sections, (currentSections) => {
      let charStart = 0;

      return currentSections.map((section, currentIndex): BlockCompilerItem => {
        const charEnd = charStart + section.text.length;

        const item = {
          section,
          meta: { charStart, charEnd, currentIndex },
          isLast: currentIndex === currentSections.length - 1,
        };

        charStart = charEnd;

        return item;
      });
    });

    return useMapEach(
      items,
      (item) =>
        S([
          CompiledBlock,
          {
            section: mapClosure(item, (current) => current.section, isEqual),
            meta: mapClosure(item, (current) => current.meta, isEqual),
            isLast: mapClosure(item, (current) => current.isLast),
            count,
            key: String(++nextKey),
            config,
            getRemarks,
            getRehypes,
          },
        ]),
      isEqual,
    );
  },
);
