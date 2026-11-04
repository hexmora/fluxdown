import type { IRenderPatchItem } from '@fluxdown/core';
import type { IReactiveState } from 'stative';
import type { VNodeChild } from 'vue';

export interface PatchReconcilerProps {
  patchKey: string;

  patches: IReactiveState<IRenderPatchItem<VNodeChild>[]>;

  text?: string;
}
