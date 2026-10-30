/**
 * @jsxImportSource stative
 */

import { type JSXDescriptor, once, useCreate } from 'stative';

import type { SmoothCursorInputs } from './type';

import { BlockRevisions, CursorPosition, type SmoothPosition, SmoothTicks } from './states';

export * from './type';

export const SmoothCursor = /*#__PURE__*/ once(function SmoothCursor<T>({
  source,
  enabled,
  driver,
  interpolation,
}: SmoothCursorInputs<T>): JSXDescriptor<SmoothPosition> {
  const revisions = useCreate(<BlockRevisions<T> source={source} />);

  return (
    <CursorPosition
      enabled={enabled}
      driver={driver}
      interpolation={interpolation}
      revisions={revisions}
      ticks={<SmoothTicks enabled={enabled} revisions={revisions} driver={driver} />}
    />
  );
});
