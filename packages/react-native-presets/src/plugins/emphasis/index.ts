import { EmphasisRenderPlugin } from '@fluxdown/react-base-presets/plugins/emphasis';

import type { IPluginItem } from '../../typings';

import { EmphasisSlotPlugin } from '../../slot/emphasis';

export { EmphasisRenderPlugin } from '@fluxdown/react-base-presets/plugins/emphasis';
export { EmphasisSlotPlugin } from '../../slot/emphasis';

export const EmphasisPlugin: IPluginItem = {
  renders: [EmphasisRenderPlugin],
  slots: [EmphasisSlotPlugin],
};
