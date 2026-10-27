import type { IRenderPatchItem } from '@fluxdown/core';
import type { IReactiveState } from 'stative';

import type { SvelteNode } from '../../../../../../base';

export interface PatchReconcilerProps {
  patchKey: string;

  patches: IReactiveState<IRenderPatchItem<SvelteNode>[]>;

  text?: string;
}
