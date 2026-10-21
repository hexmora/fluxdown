import type { IPluginItem } from '../../typings';

import { FallbackRenderPlugin } from './render';

export * from './render';

export const FallbackPlugin: IPluginItem = {
  renders: [FallbackRenderPlugin],
};
