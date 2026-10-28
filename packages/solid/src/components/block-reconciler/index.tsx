import { createStateValue } from '@fluxdown/solid-plugins/base';
import { createMemo } from 'solid-js';
import { toState } from 'stative';

import type { BlockReconcilerProps } from './type';

import { useRender } from '../../context';
import { ChildrenReconciler } from './utils';

export const BlockReconciler = (props: BlockReconcilerProps) => {
  const config = useRender();

  const root = createStateValue(() => props.block.value);

  const patches = createMemo(() => toState(props.patches));

  const plugins = createStateValue(() => toState(props.plugins));

  return (
    <ChildrenReconciler
      node={root()}
      parents={[root()]}
      patches={patches()}
      plugins={plugins()}
      getProps={config.getProps}
    />
  );
};
