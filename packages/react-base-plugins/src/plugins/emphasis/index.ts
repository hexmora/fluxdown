import type { IPluginItem } from '../../typings';

import { EmphasisRenderPlugin } from './render';

export * from './render';

export const EmphasisPlugin: IPluginItem = {
  renders: [EmphasisRenderPlugin],
};
