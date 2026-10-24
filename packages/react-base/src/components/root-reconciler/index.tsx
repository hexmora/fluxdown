import { useStateValue } from '@fluxdown/react-hooks';
import { Fragment, isValidElement, memo } from 'react';

import type { RootReconcilerProps } from './type';

export const RootReconciler = /*#__PURE__*/ memo(function RootReconciler({
  children,
}: RootReconcilerProps) {
  const value = useStateValue(children);

  return value.map((child, index) => (
    <Fragment key={isValidElement(child) ? (child.key ?? index) : index}>{child}</Fragment>
  ));
});
