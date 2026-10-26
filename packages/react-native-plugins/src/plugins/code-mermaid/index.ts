import type { IPluginItem } from '@fluxdown/react-base-plugins/typings';

import { CodeMermaidSlotPlugin } from './slot';

export * from './slot';

export const CodeMermaidPlugin: IPluginItem = {
  slots: [CodeMermaidSlotPlugin],
};
