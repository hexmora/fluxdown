import { FallbackRenderPlugin } from '@fluxdown/react-base-presets/plugins/fallback';

import type { IPluginItem } from '../../typings';

import { NodeSlotPlugin } from '../../slot/node';

export { FallbackRenderPlugin } from '@fluxdown/react-base-presets/plugins/fallback';
export { NodeSlotPlugin } from '../../slot/node';

export const FallbackPlugin: IPluginItem = {
  renders: [FallbackRenderPlugin],
  slots: [NodeSlotPlugin],
};
