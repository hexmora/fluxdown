/** @jsxImportSource vue */

import type { IReactiveState } from 'stative';
import type { VNodeChild } from 'vue';

import { useStateValue } from '@fluxdown/vue-base-plugins/base';
import { cloneVNode, defineComponent, Fragment, isVNode } from 'vue';

import { BlockReconciler } from '../block-reconciler';

export interface RootReconcilerProps {
  value: IReactiveState<VNodeChild[]>;
}

export const RootReconciler = /*#__PURE__*/ defineComponent(
  (props: RootReconcilerProps) => {
    const value = useStateValue(() => props.value);

    return () => {
      return value.value.map((child, index) => {
        const previous = value.value[index - 1];

        const block =
          isVNode(child) && child.type === BlockReconciler
            ? cloneVNode(child, {
                first: index === 0,
                last: index === value.value.length - 1,
                previous: isVNode(previous) ? previous.props?.block : undefined,
              })
            : child;

        return <Fragment key={isVNode(child) ? (child.key ?? index) : index}>{block}</Fragment>;
      });
    };
  },
  { name: 'FluxdownRootReconciler', props: ['value'], inheritAttrs: false },
);
