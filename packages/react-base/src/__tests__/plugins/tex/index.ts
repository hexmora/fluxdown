import type { TexProps } from '@fluxdown/react-base-presets/base';

import { BaseSlotPlugin } from '@fluxdown/react-base-presets/base';

export class MockTexSlotPlugin extends BaseSlotPlugin<'Tex'> {
  static readonly key = 'mock-slot-tex';

  readonly type = 'Tex';

  readonly Component = ({ tex }: TexProps) => tex;
}
