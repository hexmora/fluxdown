import { isEqual } from 'lodash-es';
import { once, useCombineMap, useDefaults } from 'stative';

import type { IBlockSection, TextChunkerInputs } from './type';

import { chunkPatchesByTexts, chunkTextOfMarkdown, isSectionEqual } from './utils';

export * from './type';

export const TextChunker = /*#__PURE__*/ once(function TextChunker({
  config: _config,
  patches,
  text,
}: TextChunkerInputs) {
  const config = useDefaults(_config, { indentedCode: true, setextHeading: true, tex: true });

  const texts = useCombineMap([text, config], ([currentText, currentConfig]) =>
    chunkTextOfMarkdown(currentText, currentConfig),
  );

  return useCombineMap(
    [texts, patches],
    ([currentTexts, currentPatches], previous): IBlockSection[] => {
      const patchGroups =
        currentPatches.length > 0 ? chunkPatchesByTexts(currentPatches, currentTexts) : null;

      return currentTexts.map((sectionText, index) => {
        const section = { text: sectionText, patches: patchGroups?.[index] ?? [] };

        const previousSection = previous?.[1][index];

        if (previousSection && isSectionEqual(previousSection, section)) {
          return previousSection;
        }

        return section;
      });
    },
    isEqual,
  );
});
