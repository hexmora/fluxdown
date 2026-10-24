import type { IPluginItem } from '../../typings';

import { CodeRenderPlugin } from './render';

export * from './render';

export const CodePlugin: IPluginItem = {
  renders: [CodeRenderPlugin],
};
