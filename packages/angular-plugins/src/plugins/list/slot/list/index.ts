import type { ListProps } from '@fluxdown/angular-plugins/typings';

import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { ListRenderer } from './renderer';

export class ListSlotPlugin extends BaseSlotPlugin<'List'> {
  static readonly key = 'slot-list';

  readonly Component = ListRenderer;

  readonly type = 'List';

  readonly tagName = ({ type }: ListProps) => (type === 'ordered' ? 'ol' : 'ul');
}
