/* eslint-disable @typescript-eslint/no-invalid-void-type */
import type {
  IBasePluginConfig,
  IPluggableConfig,
  IRehypePlugin,
  RehypePluginContext,
} from '@fluxdown/types';
import type { Root as HastRoot } from 'hast';
import type { Plugin } from 'unified';

import { Destructible } from 'stative';

export abstract class BaseRehypePlugin<P = void> extends Destructible implements IRehypePlugin<P> {
  config: IBasePluginConfig = {};

  abstract plugin: Plugin<P extends void ? [] : [P], HastRoot, HastRoot>;

  static enabled(_context: RehypePluginContext): boolean {
    return true;
  }

  static prepareConfig(
    _context: RehypePluginContext,
    _outerConfig: IPluggableConfig<unknown>,
  ): IPluggableConfig<unknown> | null {
    return null;
  }
}
