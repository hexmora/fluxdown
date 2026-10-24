import type { ReactNode } from 'react';
import type { IReactiveState } from 'stative';

export interface RootReconcilerProps {
  children: IReactiveState<ReactNode[]>;
}
