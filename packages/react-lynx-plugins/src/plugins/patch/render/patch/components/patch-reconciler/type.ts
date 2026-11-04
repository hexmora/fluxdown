import type { IRenderPatchItem } from '@fluxdown/core';
import type { ReactNode } from '@lynx-js/react';
import type { IReactiveState } from 'stative';

export interface PatchReconcilerProps {
  patchKey: string;

  patches: IReactiveState<IRenderPatchItem<ReactNode>[]>;

  text?: string;
}
