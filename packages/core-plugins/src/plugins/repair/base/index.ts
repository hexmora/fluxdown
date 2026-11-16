import type {
  IPluggableConfig,
  IRepairPlugin,
  RepairPluginCleanup,
  RepairPluginConfigContext,
  RepairPluginEnabledContext,
  RepairPluginHookType,
  RepairPluginRunner,
  RepairPluginSystemConfig,
} from '@fluxdown/types';
import type { Parent, RootContent } from 'mdast';

import { noop } from 'lodash-es';
import { Destructible } from 'stative';

export abstract class BaseRepairPlugin extends Destructible implements IRepairPlugin {
  readonly config: RepairPluginSystemConfig = {};

  abstract runner: RepairPluginRunner | RepairPluginRunner[];

  before: RepairPluginHookType = noop;

  after: RepairPluginHookType = noop;

  beforeEach: RepairPluginHookType = noop;

  afterEach: RepairPluginHookType = noop;

  static prepareConfig(
    _context: RepairPluginConfigContext,
    _outerConfig: IPluggableConfig<unknown>,
  ): IPluggableConfig<unknown> | null {
    return null;
  }

  static enabled(_context: RepairPluginEnabledContext): boolean {
    return true;
  }

  prepare(_node: Parent | RootContent): RepairPluginCleanup | void {}
}
