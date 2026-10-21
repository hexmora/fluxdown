import { HeadingRenderPlugin } from '@fluxdown/react-base-presets/plugins/heading';

import type { IPluginItem } from '../../typings';

import { HeadingSlotPlugin } from '../../slot/heading';

export { HeadingRenderPlugin } from '@fluxdown/react-base-presets/plugins/heading';
export { HeadingSlotPlugin } from '../../slot/heading';

export const HeadingPlugin: IPluginItem = {
  renders: [HeadingRenderPlugin],
  slots: [HeadingSlotPlugin],
};
