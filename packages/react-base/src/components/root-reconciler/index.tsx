import type { ReactNode } from 'react';
import type { IReactiveState } from 'stative';

import { useStateValue } from '@fluxdown/react-base-presets/base';
import { Fragment, isValidElement, memo } from 'react';

export const RootReconciler = /*#__PURE__*/ memo(function RootReconciler({
  children,
}: {
  children: IReactiveState<ReactNode[]>;
}) {
  const value = useStateValue(children);

  return value.map((child, index) => (
    <Fragment key={isValidElement(child) ? (child.key ?? index) : index}>{child}</Fragment>
  ));
});
