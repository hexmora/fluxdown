import type { TexProps } from '@fluxdown/angular-plugins/typings';

import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { TexMathjaxKatexRenderer } from './renderer';

export * from './renderer';

export class TexMathjaxKatexSlotPlugin extends BaseSlotPlugin<'Tex'> {
  static readonly key = 'slot-tex';

  readonly Component = TexMathjaxKatexRenderer;

  readonly type = 'Tex';

  readonly tagName = ({ mode }: TexProps) => (mode === 'display' ? 'div' : 'span');
}
