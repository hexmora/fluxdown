import type { IPluginItem } from '../../typings';

import { HeadingRenderPlugin } from './render';

export * from './render';

export const HeadingPlugin: IPluginItem = {
  renders: [HeadingRenderPlugin],
};
