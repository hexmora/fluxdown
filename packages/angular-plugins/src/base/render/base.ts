import type {
  AngularRenderExtraParams,
  AngularRenderNode,
  IAngularRenderPlugin,
} from '@fluxdown/angular-plugins/typings';
import type { IBasePluginConfig } from '@fluxdown/types';
import type { ElementContent, Parent } from 'hast';

import { BaseRenderPlugin } from '@fluxdown/core';

export abstract class BaseAngularRenderPlugin
  extends BaseRenderPlugin<ElementContent, Parent, AngularRenderNode, AngularRenderExtraParams>
  implements IAngularRenderPlugin
{
  readonly config: IBasePluginConfig = {};
}
