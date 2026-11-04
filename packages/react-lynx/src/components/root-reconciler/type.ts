import type { ReactNode } from '@lynx-js/react';
import type { IReactiveState } from 'stative';

export interface RootReconcilerProps {
  children: IReactiveState<ReactNode[]>;
}
