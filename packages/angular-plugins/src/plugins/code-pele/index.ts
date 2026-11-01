import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

import { CodePeleSlotPlugin } from './slot';

export * from './slot';

export const CodePelePlugin: IPluginItem = {
  slots: [CodePeleSlotPlugin],
};
