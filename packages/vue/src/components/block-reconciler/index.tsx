import { useStateValue } from '@fluxdown/vue-plugins/base';
import { toState } from 'stative';
import { computed, defineComponent } from 'vue';

import type { BlockReconcilerProps } from './type';

import { useRender } from '../../context';
import { renderParentChildren } from './utils';

export const BlockReconciler = /*#__PURE__*/ defineComponent(
  (props: BlockReconcilerProps) => {
    const { getProps } = useRender();

    const root = useStateValue(() => props.block.value);

    const patches = computed(() => toState(props.patches));

    const plugins = useStateValue(() => toState(props.plugins));

    return () => {
      return renderParentChildren(root.value, [root.value], patches.value, plugins.value, getProps);
    };
  },
  { name: 'FluxdownBlockReconciler', props: ['block', 'patches', 'plugins'], inheritAttrs: false },
);
