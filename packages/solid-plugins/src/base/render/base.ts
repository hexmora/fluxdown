import type { IBasePluginConfig } from '@fluxdown/types';
import type { ElementContent, Parent } from 'hast';
import type { JSX } from 'solid-js';

import { BaseRenderPlugin } from '@fluxdown/core';

import type { ISolidRenderPlugin, SolidRenderExtraParams } from './type';

export abstract class BaseSolidRenderPlugin
  extends BaseRenderPlugin<ElementContent, Parent, JSX.Element, SolidRenderExtraParams>
  implements ISolidRenderPlugin
{
  readonly config: IBasePluginConfig = {};
}
