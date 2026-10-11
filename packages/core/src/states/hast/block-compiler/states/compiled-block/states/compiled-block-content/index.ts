import { isEqual } from 'lodash-es';
import { once, S, useMap } from 'stative';

import type { CompiledBlockContentInputs } from './type';

import { CompiledBlockResult } from '..';
import { markdownToHast } from '../../../../utils';
import { getRemarksConfig } from '../../utils';

export * from './type';

export const CompiledBlockContent = /*#__PURE__*/ once(
  ({ item, idPrefix, count, key, config, getRemarks, getRehypes }: CompiledBlockContentInputs) => {
    const remarksConfig = useMap([config, item], getRemarksConfig, isEqual);

    const remarks = getRemarks({ config: remarksConfig });

    // Public factories remain per block, including custom side effects and ownership.
    const rehypes = getRehypes();

    const text = useMap(item, (current) => current.section.text);

    const source = useMap(
      [text, remarks, rehypes, idPrefix],
      ([currentText, currentRemarks, currentRehypes, currentPrefix]) =>
        markdownToHast({
          text: currentText,
          remarks: currentRemarks,
          rehypes: currentRehypes,
          idPrefix: currentPrefix,
        }),
      isEqual,
    );

    return S([CompiledBlockResult, { item, count, key, source }]);
  },
);
