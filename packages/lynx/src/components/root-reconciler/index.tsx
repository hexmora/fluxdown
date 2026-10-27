import { useStateValue } from '@fluxdown/lynx-plugins/base';
import { cloneElement, Fragment, isValidElement, memo } from '@lynx-js/react';

import type { BlockReconcilerProps } from '../block-reconciler/type';
import type { RootReconcilerProps } from './type';

import { BlockReconciler } from '../block-reconciler';

export const RootReconciler = /*#__PURE__*/ memo(function RootReconciler({
  children,
}: RootReconcilerProps) {
  const value = useStateValue(children);

  return value.map((child, index) => {
    const previous = value[index - 1];

    const block =
      isValidElement<BlockReconcilerProps>(child) && child.type === BlockReconciler
        ? cloneElement(child, {
            first: index === 0,
            last: index === value.length - 1,
            previous: isValidElement<BlockReconcilerProps>(previous)
              ? previous.props.block
              : undefined,
          })
        : child;

    return <Fragment key={isValidElement(child) ? (child.key ?? index) : index}>{block}</Fragment>;
  });
});
