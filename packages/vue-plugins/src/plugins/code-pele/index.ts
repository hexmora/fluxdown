import type { IPluginItem } from '@fluxdown/vue-base-plugins/typings';

import { CodePeleSlotPlugin } from './slot';

export * from './slot';

export const CodePelePlugin: IPluginItem = {
  slots: [CodePeleSlotPlugin],
};
