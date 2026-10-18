import { BreakLineRenderPlugin } from '@fluxdown/react-base-presets/plugins/break-line';

import type { IPluginItem } from '../../typings';

import { BreakLineSlotPlugin } from '../../slot/break-line';

export { BreakLineRenderPlugin } from '@fluxdown/react-base-presets/plugins/break-line';
export { BreakLineSlotPlugin } from '../../slot/break-line';

export const BreakLinePlugin: IPluginItem = {
  renders: [BreakLineRenderPlugin],
  slots: [BreakLineSlotPlugin],
};
