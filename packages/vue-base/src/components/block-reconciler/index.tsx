/** @jsxImportSource vue */

import { BlockLayoutProvider, useStateValue } from '@fluxdown/vue-base-plugins/base';
import { toState } from 'stative';
import { computed, defineComponent } from 'vue';

import type { BlockReconcilerProps } from './type';

import { useRender } from '../../context';
import { renderParentChildren } from './utils';

export const BlockReconciler = /*#__PURE__*/ defineComponent(
  (props: BlockReconcilerProps) => {
    const config = useRender();

    const root = useStateValue(() => props.block.value);

    const previous = useStateValue(() => toState(props.previous?.value ?? null));

    const layout = computed(() => ({
      first: props.first ?? false,
      last: props.last ?? false,
      previous: previous.value,
    }));

    const patches = computed(() => toState(props.patches));

    const plugins = useStateValue(() => toState(props.plugins));

    return () => {
      return (
        <BlockLayoutProvider value={layout.value}>
          {{
            default: () =>
              renderParentChildren(
                root.value,
                [root.value],
                patches.value,
                plugins.value,
                config.getProps,
              ),
          }}
        </BlockLayoutProvider>
      );
    };
  },
  {
    name: 'FluxdownBlockReconciler',
    props: ['block', 'patches', 'plugins', 'first', 'last', 'previous'],
    inheritAttrs: false,
  },
);
