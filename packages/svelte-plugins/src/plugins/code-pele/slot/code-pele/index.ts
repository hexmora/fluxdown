import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { CodePeleRenderer } from './code-pele-renderer';

export * from './code-pele-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-code-pele': IPluggableConfig<void>;
  }
}

export class CodePeleSlotPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'slot-code-pele';

  readonly Component = CodePeleRenderer;

  readonly type = 'CodeBlock';
}
