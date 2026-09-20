import type { CSSProperties, ReactNode } from 'react';
import type { IReactiveState } from 'stative';

export interface RootReconcilerProps {
  children: IReactiveState<ReactNode[]>;

  className?: string;

  style?: CSSProperties;
}
