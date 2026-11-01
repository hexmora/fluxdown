import type { TexProps } from '@fluxdown/angular-plugins/typings';

import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { TexRenderer } from './renderer';

export * from './renderer';

export class TexSlotPlugin extends BaseSlotPlugin<'Tex'> {
  static readonly key = 'slot-tex';

  readonly Component = TexRenderer;

  readonly type = 'Tex';

  readonly tagName = ({ mode }: TexProps) => (mode === 'display' ? 'div' : 'span');
}
