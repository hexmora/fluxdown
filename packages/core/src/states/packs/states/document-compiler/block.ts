import { isEqual } from 'lodash-es';
import { once, S, useCombineMap, useCreate, useMap } from 'stative';

import type { BlockContentInputs } from '../../../hast/block-compiler/states/compiled-block/type';
import type { DocumentPlugins } from '../document-plugins';

import { CompiledBlockResult } from '../../../hast/block-compiler/states/compiled-block/result';
import { getRemarksConfig } from '../../../hast/block-compiler/states/compiled-block/utils';
import { markdownToHast } from '../../../hast/block-compiler/utils';
import { BlockPlugins } from './plugins';

type Inputs = BlockContentInputs & { plugins: DocumentPlugins };

export const DocumentBlockContent = /*#__PURE__*/ once(function DocumentBlockContent({
  item,
  idPrefix,
  count,
  key,
  config,
  plugins,
}: Inputs) {
  const settings = useCombineMap([config, item], getRemarksConfig, isEqual);

  const remarks = plugins.createRemarkScope(settings);

  const rehypes = plugins.createRehypeScope();

  const selected = useCreate(
    S([
      BlockPlugins,
      {
        settings,
        plugins,
        remarks,
        rehypes,
      },
    ]),
  );

  const text = useMap(item, (current) => current.section.text);

  const source = useCombineMap(
    [text, selected, idPrefix],
    ([currentText, [currentRemarks, currentRehypes], prefix]) =>
      markdownToHast({
        text: currentText,
        remarks: currentRemarks,
        rehypes: currentRehypes,
        idPrefix: prefix,
      }),
    isEqual,
  );

  return S([CompiledBlockResult, { item, count, key, source }]);
});
