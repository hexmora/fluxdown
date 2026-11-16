import type { IPluggable, RenderPluginContext } from '@fluxdown/types';

import { memoReturns } from 'stative';

import type { IRenderPlugin } from '../../../../externals';
import type { RenderPluggablesInputs } from './type';

import { isPluggablesEqual, preparePluggables, toPluggable } from '../../../base';

export * from './type';

export const RenderPluggables = /*#__PURE__*/ memoReturns(function RenderPluggables<
  E,
  P,
  R,
  C = {},
>({
  extras,
  config,
}: RenderPluggablesInputs<E, P, R, C>): IPluggable<IRenderPlugin<E, P, R, C>, unknown>[] {
  const renders = toPluggable(extras);

  const context: RenderPluginContext = { config, renders };

  return preparePluggables(renders, context);
}, isPluggablesEqual);
