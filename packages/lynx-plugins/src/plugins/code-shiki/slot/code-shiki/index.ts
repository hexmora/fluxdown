import type { IPluggableConfig } from '@fluxdown/types';

import { BaseSlotPlugin } from '../../../../base';
import { CodeShikiRenderer } from './renderer';

declare global {
  interface LynxSlotConfigs {
    'slot-code-shiki': IPluggableConfig<void>;
  }
}

export class CodeShikiSlotPlugin extends BaseSlotPlugin<'CodeHighlighter'> {
  static readonly key = 'slot-code-shiki';

  readonly Component = CodeShikiRenderer;

  readonly type = 'CodeHighlighter';
}
