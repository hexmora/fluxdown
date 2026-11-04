import type { IBasePluginConfig } from '@fluxdown/types';
import type { ElementContent, Parent } from 'hast';
import type { VNodeChild } from 'vue';

import { BaseRenderPlugin } from '@fluxdown/core';

import type { IVueRenderPlugin, VueRenderExtraParams } from './type';

export abstract class BaseVueRenderPlugin
  extends BaseRenderPlugin<ElementContent, Parent, VNodeChild, VueRenderExtraParams>
  implements IVueRenderPlugin
{
  readonly config: IBasePluginConfig = {};
}
