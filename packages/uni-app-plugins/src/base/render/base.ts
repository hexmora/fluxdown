import type { IBasePluginConfig } from '@fluxdown/types';
import type { ElementContent, Parent } from 'hast';

import { BaseRenderPlugin } from '@fluxdown/core';

import type { UniRenderNode } from '../../typings/render';
import type { IUniRenderPlugin, UniRenderExtraParams } from './type';

export abstract class BaseUniRenderPlugin
  extends BaseRenderPlugin<ElementContent, Parent, UniRenderNode, UniRenderExtraParams>
  implements IUniRenderPlugin
{
  readonly config: IBasePluginConfig = {};
}
