import type { Element } from 'hast';
import type { Component } from 'vue';

import type { SlotType } from '../base/slot/type';

export type GetPropsFunction = (node?: Element) => Record<string, unknown>;

export interface UniSlotNode {
  type: SlotType;

  props: Record<string, unknown>;

  children?: UniRenderNode[];

  key?: string;
}

export interface UniComponentNode {
  component: Component;

  props: Record<string, unknown>;

  key?: string;
}

export type UniRenderNode =
  | string
  | number
  | null
  | UniSlotNode
  | UniComponentNode
  | UniRenderNode[];
