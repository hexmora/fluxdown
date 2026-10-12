import { isEqual } from 'lodash-es';
import { once, S, useCreate, useMap, useSelect } from 'stative';

import type { CompiledBlockContentInputs } from './type';

import { BlockItem } from '../../../../../block-item';
import { MarkdownCompiler } from '../../../../exports';
import { getRemarksConfig, isMetaEqual } from '../../utils';
import { isInputsEqual } from './utils';

export * from './type';

export const CompiledBlockContent = /*#__PURE__*/ once(
  ({
    item,
    idPrefix,
    count,
    key,
    config,
    getRemarks,
    getRehypes,
    compiler,
  }: CompiledBlockContentInputs) => {
    const meta = useSelect(
      [item, count],
      ([
        {
          meta: currentMeta,
          section: { text },
        },
        blockCount,
      ]) => ({
        ...currentMeta,
        blockCount,
        key,
        sourceText: text,
      }),
      isMetaEqual,
    );

    const remarksConfig = useMap([config, item], getRemarksConfig, isEqual);

    const remarks = getRemarks({ config: remarksConfig });

    // Keep the factory per block so it can accept block-specific inputs in the future.
    const rehypes = getRehypes();

    const source = useMap(
      [item, remarks, rehypes, idPrefix],
      (inputs, prev) => {
        if (prev) {
          const [values, root] = prev;

          if (isInputsEqual(inputs, values)) {
            return root;
          }
        }

        const [
          {
            section: { text },
          },
          currentRemarks,
          currentRehypes,
          currentPrefix,
        ] = inputs;

        return (compiler ?? MarkdownCompiler).build({
          text,
          remarks: currentRemarks,
          rehypes: currentRehypes,
          idPrefix: currentPrefix,
        });
      },
      isEqual,
    );

    const block = useCreate(S([BlockItem, { source, meta }]));

    // Emit the block instance while keeping compilation active.
    return useMap(source, () => block);
  },
);
