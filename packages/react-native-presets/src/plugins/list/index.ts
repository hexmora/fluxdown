import { ListRenderPlugin } from '@fluxdown/react-base-presets/plugins/list';

import type { IPluginItem } from '../../typings';

import { ListSlotPlugin } from '../../slot/list';

export { ListRenderPlugin } from '@fluxdown/react-base-presets/plugins/list';
export { ListSlotPlugin } from '../../slot/list';

export const ListPlugin: IPluginItem = {
  renders: [ListRenderPlugin],
  slots: [ListSlotPlugin],
};
