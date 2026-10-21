import { LinkRenderPlugin } from '@fluxdown/react-base-presets/plugins/link';

import type { IPluginItem } from '../../typings';

import { LinkSlotPlugin } from '../../slot/link';

export { LinkRenderPlugin } from '@fluxdown/react-base-presets/plugins/link';
export { LinkSlotPlugin } from '../../slot/link';

export const LinkPlugin: IPluginItem = {
  renders: [LinkRenderPlugin],
  slots: [LinkSlotPlugin],
};
