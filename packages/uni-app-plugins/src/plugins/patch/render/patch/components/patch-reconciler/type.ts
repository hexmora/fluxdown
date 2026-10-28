import type { IRenderPatchItem } from '@fluxdown/core';
import type { IReactiveState } from 'stative';

import type { UniRenderNode } from '../../../../../../typings/render';

export interface PatchReconcilerProps {
  patchKey: string;

  patches: IReactiveState<IRenderPatchItem<UniRenderNode>[]>;

  text?: string;
}
