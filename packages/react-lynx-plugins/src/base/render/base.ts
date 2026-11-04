import type { IBasePluginConfig } from '@fluxdown/types';
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

  abstract match(params: ReactLynxRenderMatchParams): boolean;

  abstract render(params: ReactLynxRenderParams): ReactNode;
}
