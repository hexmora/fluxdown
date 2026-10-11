import { once, S, useMap, useMapEach, useSelect } from 'stative';

import type { DocumentCompilerInputs } from './type';

import { getItems } from '../../../hast/block-compiler/utils';
import { DocumentBlockContent } from './states';

export const DocumentCompiler = /*#__PURE__*/ once(function DocumentCompiler({
  plugins,
  sections,
  config,
}: DocumentCompilerInputs) {
  let nextKey = 0;

  const count = useSelect(sections, (current) => current.length);

  const idPrefix = useMap(config, (current) => current.idPrefix);

  const items = useMap(sections, getItems);

  return useMapEach(items, (item) =>
    S([DocumentBlockContent, { item, idPrefix, count, key: String(++nextKey), config, plugins }]),
  );
});
