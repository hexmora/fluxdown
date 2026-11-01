import type { Element } from 'hast';
import type { Component } from 'vue';

import type { SlotType } from '../base/slot/type';

export type GetPropsFunction = (node?: Element) => Record<string, unknown>;

export type InlineEffect =
  | { type: 'scale'; start: number; duration: number; from: number; blur: number }
  | { type: 'chunk'; start: number; duration: number }
  | {
      type: 'shad';
      maskText: string;
      trailingText: string;
    };

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

export interface UniTextNode {
  text: string;

  effect?: InlineEffect;
}

export type UniRenderNode =
  | string
  | number
  | null
  | UniSlotNode
  | UniComponentNode
  | UniTextNode
  | UniRenderNode[];
