import type { UniRenderNode } from '@fluxdown/uni-app-plugins/typings';
import type { IReactiveState } from 'stative';

export interface RootReconcilerProps {
  value: IReactiveState<UniRenderNode[]>;
}
