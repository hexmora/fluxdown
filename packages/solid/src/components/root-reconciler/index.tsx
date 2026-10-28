import type { JSX } from 'solid-js';
import type { IReactiveState } from 'stative';

import { createStateValue } from '@fluxdown/solid-plugins/base';
import { createMemo, For } from 'solid-js';

import type { SolidBlockElement } from '../../modules/solid-renderer';

import { BlockReconciler } from '../block-reconciler';

export interface RootReconcilerProps {
  value: IReactiveState<JSX.Element[]>;
}

export const RootReconciler = (props: RootReconcilerProps) => {
  const value = createStateValue(() => props.value);

  const blocks = createMemo(() => {
    const entries = value() as unknown as SolidBlockElement[];

    return new Map(entries.map((block) => [block.key, block]));
  });

  const keys = createMemo(() => [...blocks().keys()]);

  return (
    <For each={keys()}>
      {(key) => {
        return <BlockReconciler {...blocks().get(key)!} />;
      }}
    </For>
  );
};
