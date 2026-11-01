import type { TexProps } from '@fluxdown/angular-plugins/typings';

import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { TexKatexRenderer } from './renderer';

export * from './renderer';

export class TexKatexSlotPlugin extends BaseSlotPlugin<'Tex'> {
  static readonly key = 'slot-tex';

  readonly Component = TexKatexRenderer;

  readonly type = 'Tex';

  readonly tagName = ({ mode }: TexProps) => (mode === 'display' ? 'div' : 'span');
}
