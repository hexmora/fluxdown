import type { IPluginItem } from '../../typings';

import { CodePeleSlotPlugin } from './slot';

export * from './slot';

export const CodePelePlugin: IPluginItem = {
  slots: [CodePeleSlotPlugin],
};
