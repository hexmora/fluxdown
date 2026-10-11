import type { StateMapper } from 'stative';

import { isEqual } from 'lodash-es';

import type { BlockCompilerConfig, BlockCompilerItem, BlockRemarksConfig } from '../../type';

export const getRemarksConfig: StateMapper<
  [BlockCompilerConfig, BlockCompilerItem],
  BlockRemarksConfig
> = ([config, item], previous) => {
  const { patches } = item.section;

  if (previous) {
    const [[prevConfig, prevItem], result] = previous;

    const sameInputs = prevConfig === config && isEqual(result.patches, patches);

    if (sameInputs && prevItem.isLast === item.isLast) {
      return result;
    }

    if (sameInputs && !item.isLast) {
      return result.repairEnding ? { ...result, repairEnding: false } : result;
    }
  }

  const { repairEnding, ...restConfig } = config;

  return { ...restConfig, repairEnding: repairEnding && item.isLast, patches };
};
