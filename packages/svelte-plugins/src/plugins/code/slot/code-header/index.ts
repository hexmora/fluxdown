import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { CodeHeaderRenderer } from './code-header-renderer';

export * from './code-header-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-code-header': IPluggableConfig<void>;
  }
}

export class CodeHeaderSlotPlugin extends BaseSlotPlugin<'CodeHeader'> {
  static readonly key = 'slot-code-header';

  readonly Component = CodeHeaderRenderer;

  readonly type = 'CodeHeader';
}
