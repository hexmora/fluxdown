import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { CodeBlockRenderer } from './code-block-renderer';

export * from './code-block-renderer';

declare global {
  interface SvelteSlotConfigs {
    'slot-code-block': IPluggableConfig<void>;
  }
}

export class CodeBlockSlotPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'slot-code-block';

  readonly Component = CodeBlockRenderer;

  readonly type = 'CodeBlock';
}
