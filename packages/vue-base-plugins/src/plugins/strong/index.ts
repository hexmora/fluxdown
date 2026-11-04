import type { IPluginItem } from '../../typings';

import { StrongRenderPlugin } from './render';

export * from './render';

export const StrongPlugin: IPluginItem = {
  renders: [StrongRenderPlugin],
};
