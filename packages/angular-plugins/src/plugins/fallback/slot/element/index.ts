import type { ElementProps } from '@fluxdown/angular-plugins/typings';

import { BaseSlotPlugin } from '@fluxdown/angular-plugins/base';

import { ElementRenderer } from './renderer';

export class ElementSlotPlugin extends BaseSlotPlugin<'Element'> {
  static readonly key = 'slot-element';

  readonly Component = ElementRenderer;

  readonly type = 'Element';

  readonly tagName = ({ tagName }: ElementProps) => tagName;
}
