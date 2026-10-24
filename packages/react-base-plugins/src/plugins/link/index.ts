import type { IPluginItem } from '../../typings';

import { LinkRenderPlugin } from './render';

export * from './render';

export const LinkPlugin: IPluginItem = {
  renders: [LinkRenderPlugin],
};
