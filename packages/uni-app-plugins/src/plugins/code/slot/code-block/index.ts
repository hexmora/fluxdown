import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import CodeBlockRenderer from './renderer/index.uvue';

declare global {
  interface UniSlotConfigs {
    'slot-code-block': IPluggableConfig<void>;
  }
}

export class CodeBlockSlotPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'slot-code-block';

  readonly Component = CodeBlockRenderer;

  readonly type = 'CodeBlock';
}
