import type { IPluginItem } from '../../typings';

import { ListRenderPlugin } from './render';

export * from './render';

export const ListPlugin: IPluginItem = {
  renders: [ListRenderPlugin],
};
