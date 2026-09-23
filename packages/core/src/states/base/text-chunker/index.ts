import { isEqual } from 'lodash-es';
import { once, useCombineMap, useDefaults } from 'stative';

import type { TextChunkerInputs } from './type';

import { buildBlockSections, chunkTextOfMarkdown } from './utils';

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

  return useCombineMap([texts, patches], buildBlockSections, isEqual);
});
