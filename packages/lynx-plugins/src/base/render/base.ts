import type { IBasePluginConfig } from '@fluxdown/types';
import type { ReactNode } from '@lynx-js/react';

import { Destructible } from 'stative';

import type { ILynxRenderPlugin, LynxRenderMatchParams, LynxRenderParams } from './type';

// Keep JSX render functions outside plugin classes: ReactLynx treats class render methods as components.
export abstract class BaseLynxRenderPlugin extends Destructible implements ILynxRenderPlugin {
  readonly config: IBasePluginConfig = {};

  abstract match(params: LynxRenderMatchParams): boolean;

  abstract render(params: LynxRenderParams): ReactNode;
}
