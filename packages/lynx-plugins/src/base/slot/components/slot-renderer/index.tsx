import { memo, useContext, useMemo } from '@lynx-js/react';

import type { SlotRendererProps } from './type';

import { useStatic } from '../../../hooks';
import { SlotsContext } from '../../context';
import { createSlotComposer, isNamedSlot } from '../../utils/compose';
import { SlotErrorBoundary } from '../slot-error-boundary';

export * from './type';

export const SlotRenderer = /*#__PURE__*/ memo(function SlotRenderer({
  props,
  type,
}: SlotRendererProps) {
  const slots = useContext(SlotsContext);

  const compose = useStatic(createSlotComposer);

  const plugins = slots?.[type];

  const wrappers = slots?.Wrapper;

  const fallbacks = slots?.Fallback;

  const Component = useMemo(() => compose(plugins ?? []), [compose, plugins]);

  const Wrapper = useMemo(() => compose(wrappers ?? []), [compose, wrappers]);

  const Fallback = useMemo(() => compose(fallbacks ?? []), [compose, fallbacks]);

  if (!slots) {
    throw new Error(`The ${type} slot must be rendered within a SlotProvider.`);
  }

  if (!Component) {
    return null;
  }

  const content = <Component {...props} />;

  if (!isNamedSlot(type)) {
    return content;
  }

  return (
    <SlotErrorBoundary Component={Fallback} props={props} renderer={Component} type={type}>
      {Wrapper ? (
        <Wrapper props={props} type={type}>
          {content}
        </Wrapper>
      ) : (
        content
      )}
    </SlotErrorBoundary>
  );
});
