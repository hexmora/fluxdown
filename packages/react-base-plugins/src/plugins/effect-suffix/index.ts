import type { IPluginItem } from '../../typings';

import { EffectSuffixRenderPlugin } from './render';

export * from './render';

export const EffectSuffixPlugin: IPluginItem = {
  renders: [EffectSuffixRenderPlugin],
};
