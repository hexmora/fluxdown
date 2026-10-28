import type { IRenderPatchItem } from '@fluxdown/core';
import type { JSX } from 'solid-js';
import type { IReactiveState } from 'stative';

export interface PatchReconcilerProps {
  patchKey: string;

  patches: IReactiveState<IRenderPatchItem<JSX.Element>[]>;

  text?: string;
}
