import type { IBasePluginConfig, IPluggableConfig, RenderPluginContext } from '@fluxdown/types';
import type { ReactNode } from '@lynx-js/react';

import { Destructible } from 'stative';

import type {
  IReactLynxRenderPlugin,
  ReactLynxRenderMatchParams,
  ReactLynxRenderParams,
} from './type';

// Keep JSX render functions outside plugin classes: ReactLynx treats class render methods as components.
export abstract class BaseReactLynxRenderPlugin
  extends Destructible
  implements IReactLynxRenderPlugin
{
  readonly config: IBasePluginConfig = {};

  static enabled(_context: RenderPluginContext): boolean {
    return true;
  }

  static prepareConfig(
    _context: RenderPluginContext,
    _outerConfig: IPluggableConfig<unknown>,
  ): IPluggableConfig<unknown> | null {
    return null;
  }

  abstract match(params: ReactLynxRenderMatchParams): boolean;

  abstract render(params: ReactLynxRenderParams): ReactNode;
}
