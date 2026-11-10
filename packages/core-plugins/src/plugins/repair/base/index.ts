import type {
  IRepairPlugin,
  RepairPluginContext,
  RepairPluginHookType,
  RepairPluginRunner,
  RepairPluginSystemConfig,
} from '@fluxdown/types';

import { noop } from 'lodash-es';
import { Destructible } from 'stative';

export abstract class BaseRepairPlugin extends Destructible implements IRepairPlugin {
  declare context?: RepairPluginContext;

  readonly config: RepairPluginSystemConfig = {};

  abstract runner: RepairPluginRunner | RepairPluginRunner[];

  before: RepairPluginHookType = noop;

  after: RepairPluginHookType = noop;

  beforeEach: RepairPluginHookType = noop;

  afterEach: RepairPluginHookType = noop;
}
