import { isEqual } from 'lodash-es';
import { once, S, useCombineMap, useCreate, useMap } from 'stative';

import type { BlockRemarksConfig } from '../../type';
import type { CompiledBlockInputs } from './type';

import { BlockItem } from '../../../block-item';
import { markdownToHast } from '../../utils';
import { isMetaEqual } from './utils';

export * from './type';

export const CompiledBlock = /*#__PURE__*/ once(
  ({
    section,
    meta: rawMeta,
    isLast,
    count,
    key,
    config,
    getRemarks,
    getRehypes,
  }: CompiledBlockInputs) => {
    const meta = useCombineMap(
      [rawMeta, section, count],
      ([currentMeta, { text }, blockCount]) => ({
        ...currentMeta,
        blockCount,
        key,
        sourceText: text,
      }),
      isMetaEqual,
    );

    const remarksContext = useCombineMap(
      [section, isLast],
      ([{ patches }, currentIsLast]) => ({
        patches,
        isLast: currentIsLast,
      }),
      isEqual,
    );

    const remarksConfig = useCombineMap(
      [config, remarksContext],
      ([
        { repairEnding, ...restConfig },
        { patches, isLast: currentIsLast },
      ]): BlockRemarksConfig => ({
        ...restConfig,
        repairEnding: repairEnding && currentIsLast,
        patches,
      }),
      isEqual,
    );

    const remarks = getRemarks({ config: remarksConfig });

    // Keep the factory per block so it can accept block-specific inputs in the future.
    const rehypes = getRehypes();

    const idPrefix = useMap(config, (current) => current.idPrefix);

    const source = useCombineMap(
      [section, remarks, rehypes, idPrefix],
      ([{ text }, currentRemarks, currentRehypes, currentPrefix]) =>
        markdownToHast({
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
