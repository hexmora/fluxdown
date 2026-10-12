import type { IRehypePlugin, IRemarkPlugin } from '@fluxdown/types';

import type { BlockCompilerItem } from '../../../../type';

type CompilerSources = [BlockCompilerItem, IRemarkPlugin[], IRehypePlugin[], string | undefined];

export const isInputsEqual = (left: CompilerSources, right: CompilerSources) => {
  const [{ section: leftSection }, leftRemarks, leftRehypes, leftPrefix] = left;

  const [{ section: rightSection }, rightRemarks, rightRehypes, rightPrefix] = right;

  return (
    leftSection === rightSection &&
    leftRemarks === rightRemarks &&
    leftRehypes === rightRehypes &&
    leftPrefix === rightPrefix
  );
};
