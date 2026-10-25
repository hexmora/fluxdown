import type { IPluginItem } from '../../typings';

import { EffectScaleRenderPlugin } from './render';

export * from './render';

export const EffectScalePlugin: IPluginItem = {
  renders: [EffectScaleRenderPlugin],
};
