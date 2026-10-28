import { createMemo } from 'solid-js';

import type { PatchReconcilerProps } from './type';

import { createStateValue } from '../../../../../../base/primitives';

export const PatchReconciler = (props: PatchReconcilerProps) => {
  const patches = createStateValue(() => props.patches);

  const patch = createMemo(() => patches().find(({ key }) => key === props.patchKey)?.render);

  return <>{patch()?.(props.text)}</>;
};
