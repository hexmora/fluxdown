import type { IBasePluginConfig } from '@fluxdown/types';
import type { ElementContent, Parent } from 'hast';

import { BaseRenderPlugin } from '@fluxdown/core';

import type { SvelteNode } from './node';
import type { ISvelteRenderPlugin, SvelteRenderExtraParams } from './type';

export abstract class BaseSvelteRenderPlugin
  extends BaseRenderPlugin<ElementContent, Parent, SvelteNode, SvelteRenderExtraParams>
  implements ISvelteRenderPlugin
{
  readonly config: IBasePluginConfig = {};
}
