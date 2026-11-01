import type { HeadingProps } from '@fluxdown/angular-plugins/typings';

import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { HeadingRenderer } from './renderer';

export class HeadingSlotPlugin extends BaseSlotPlugin<'Heading'> {
  static readonly key = 'slot-heading';

  readonly Component = HeadingRenderer;

  readonly type = 'Heading';

  readonly tagName = ({ level }: HeadingProps) =>
    `h${Number.isInteger(level) && level >= 1 && level <= 6 ? level : 1}`;
}
