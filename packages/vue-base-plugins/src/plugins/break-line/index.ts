import type { IPluginItem } from '../../typings';

import { BreakLineRenderPlugin } from './render';

export * from './render';

export const BreakLinePlugin: IPluginItem = {
  renders: [BreakLineRenderPlugin],
};
