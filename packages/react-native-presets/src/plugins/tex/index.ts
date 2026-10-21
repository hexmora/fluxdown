import { BaseSlotPlugin } from '@fluxdown/react-base-presets/base';
import { TexRenderPlugin } from '@fluxdown/react-base-presets/plugins/tex';

import type { IPluginItem } from '../../typings';

import { Fallback } from '../../slot/tex/renderer/components/fallback';

export { TexRenderPlugin } from '@fluxdown/react-base-presets/plugins/tex';

export class TexSlotPlugin extends BaseSlotPlugin<'Tex'> {
  static readonly key = 'slot-tex';
  readonly type = 'Tex';
  readonly Component = Fallback;
}

export const TexPlugin: IPluginItem = {
  renders: [TexRenderPlugin],
  slots: [TexSlotPlugin],
};
