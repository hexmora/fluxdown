import type { IReactiveState } from 'stative';
import type { VNodeChild } from 'vue';

import { useStateValue } from '@fluxdown/vue-plugins/base';
import { defineComponent } from 'vue';

export interface RootReconcilerProps {
  value: IReactiveState<VNodeChild[]>;
}

export const RootReconciler = /*#__PURE__*/ defineComponent(
  (props: RootReconcilerProps) => {
    const value = useStateValue(() => props.value);

    return () => {
      return value.value;
    };
  },
  { name: 'FluxdownRootReconciler', props: ['value'], inheritAttrs: false },
);
