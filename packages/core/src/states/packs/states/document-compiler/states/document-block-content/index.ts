import { isEqual } from 'lodash-es';
import { once, S, useCreate, useMap } from 'stative';

import type { DocumentBlockContentInputs } from './type';

import { CompiledBlockResult } from '../../../../../hast/block-compiler/states';
import { getRemarksConfig } from '../../../../../hast/block-compiler/states/compiled-block/utils';
import { markdownToHast } from '../../../../../hast/block-compiler/utils';
import { BlockPlugins } from './states';

export const DocumentBlockContent = /*#__PURE__*/ once(function DocumentBlockContent({
  item,
  idPrefix,
  count,
  key,
  config,
  plugins,
}: DocumentBlockContentInputs) {
  const settings = useMap([config, item], getRemarksConfig, isEqual);

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

  const source = useMap(
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
