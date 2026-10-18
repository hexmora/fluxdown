import { PatchRenderPlugin } from '@fluxdown/react-base-presets/plugins/patch';

import type { IPluginItem } from '../../typings';

export { PatchRenderPlugin } from '@fluxdown/react-base-presets/plugins/patch';

export const PatchPlugin: IPluginItem = {
  renders: [PatchRenderPlugin],
};
