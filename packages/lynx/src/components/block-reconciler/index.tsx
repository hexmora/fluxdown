import { BlockLayoutProvider, useStateValue } from '@fluxdown/lynx-plugins/base';
import { memo, useMemo } from '@lynx-js/react';
import { toState } from 'stative';

import type { BlockReconcilerProps } from './type';

import { useRender } from '../../context';
import { renderParentChildren } from './utils';

export const BlockReconciler = /*#__PURE__*/ memo(function BlockReconciler({
  block,
  patches,
  plugins,
  first = false,
  last = false,
  previous,
}: BlockReconcilerProps) {
  const { getProps } = useRender();

  const root = useStateValue(block.value);

  const previousState = useMemo(() => toState(previous?.value ?? null), [previous]);

  const previousRoot = useStateValue(previousState);

  const layout = useMemo(
    () => ({ first, last, previous: previousRoot }),
    [first, last, previousRoot],
  );

  const patchState = useMemo(() => toState(patches), [patches]);

  const pluginState = useMemo(() => toState(plugins), [plugins]);

  const renderPlugins = useStateValue(pluginState);

  return (
    <BlockLayoutProvider value={layout}>
      {renderParentChildren(root, [root], patchState, renderPlugins, getProps)}
    </BlockLayoutProvider>
  );
});
