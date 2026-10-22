import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { CodePeleRenderer } from './renderer';

export * from './renderer';

declare global {
  interface SlotConfigs {
    'slot-code-pele': IPluggableConfig<void>;
  }
}

export class CodePeleSlotPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'slot-code-pele';

  readonly Component = CodePeleRenderer;

  readonly type = 'CodeBlock';
}
