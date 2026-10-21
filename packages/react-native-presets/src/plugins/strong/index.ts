import { StrongRenderPlugin } from '@fluxdown/react-base-presets/plugins/strong';

import type { IPluginItem } from '../../typings';

import { StrongSlotPlugin } from '../../slot/strong';

export { StrongRenderPlugin } from '@fluxdown/react-base-presets/plugins/strong';
export { StrongSlotPlugin } from '../../slot/strong';

export const StrongPlugin: IPluginItem = {
  renders: [StrongRenderPlugin],
  slots: [StrongSlotPlugin],
};
