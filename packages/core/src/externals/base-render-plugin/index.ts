import type { IBasePluginConfig, IPluggableConfig, RenderPluginContext } from '@fluxdown/types';

import { Destructible } from 'stative';

import { IRenderPlugin, IRenderPluginMatchParams, IRenderPluginRenderParams } from './type';

export * from './type';

export abstract class BaseRenderPlugin<E, P, R, C = {}>
  extends Destructible
  implements IRenderPlugin<E, P, R, C>
{
  config: IBasePluginConfig = {};

  static enabled(_context: RenderPluginContext): boolean {
    return true;
  }

  static prepareConfig(
    _context: RenderPluginContext,
    _outerConfig: IPluggableConfig<unknown>,
  ): IPluggableConfig<unknown> | null {
    return null;
  }

  abstract match(params: IRenderPluginMatchParams<E, P>): boolean;

  abstract render(params: IRenderPluginRenderParams<E, P, R, C>): R;
}
