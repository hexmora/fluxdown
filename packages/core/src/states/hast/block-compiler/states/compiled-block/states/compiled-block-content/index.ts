import { isEqual } from 'lodash-es';
import { once, S, useCreate, useMap } from 'stative';

import type { CompiledBlockContentInputs } from './type';

import { BlockItem } from '../../../../../block-item';
import { MarkdownCompiler } from '../../../../exports';
import { getRemarksConfig, isMetaEqual } from '../../utils';

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
    const meta = useMap(
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

    const section = useMap(item, (current) => current.section);

    const source = useMap(
      [section, remarks, rehypes, idPrefix],
      ([{ text }, currentRemarks, currentRehypes, currentPrefix]) =>
        (compiler ?? MarkdownCompiler).build({
          text,
          remarks: currentRemarks,
          rehypes: currentRehypes,
          idPrefix: currentPrefix,
        }),
      isEqual,
    );

    const block = useCreate(S([BlockItem, { source, meta }]));

    // Emit the block instance while keeping compilation active.
    return useMap(source, () => block);
  },
);
