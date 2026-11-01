import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base/slot/base';
import { CodePeleRenderer } from './renderer';

declare global {
  interface UniSlotConfigs {
    'slot-code-pele': IPluggableConfig<void>;
  }
}

export class CodePeleSlotPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'slot-code-pele';

  readonly Component = CodePeleRenderer;

  readonly type = 'CodeBlock';
}
