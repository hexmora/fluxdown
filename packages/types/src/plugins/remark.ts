import type { Root as MdastRoot } from 'mdast';
import type { IDestructible } from 'stative';
import type { Plugin } from 'unified';
import type { Node } from 'unist';

import type { RemarkPluginContext } from '../compiler';
import type { IPluginWithConfig } from './base';

export interface IRemarkPlugin<
  P = void,
  Input extends string | Node | undefined = MdastRoot,
  Output = Input,
>
  extends IPluginWithConfig, IDestructible {
  context?: RemarkPluginContext;

  isEnabled?: () => boolean;

  plugin: Plugin<P extends void ? [] : [P], Input, Output>;
}
