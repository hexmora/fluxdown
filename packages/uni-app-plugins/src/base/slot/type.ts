import type { IBasePluginConfig, IPluggable } from '@fluxdown/types';
import type { ElementContent, Parent } from 'hast';
import type { Component } from 'vue';

import type { UniRenderNode } from '../../typings/render';

export type SlotType =
  | 'Blockquote'
  | 'BreakLine'
  | 'CodeBlock'
  | 'CodeHeader'
  | 'CodeHighlighter'
  | 'Emphasis'
  | 'Heading'
  | 'Image'
  | 'Link'
  | 'List'
  | 'Paragraph'
  | 'Strong'
  | 'Table'
  | 'TableCell'
  | 'Element'
  | 'Chunk'
  | 'Scale'
  | 'ScaleWord'
  | 'Shad'
  | 'Suffix'
  | 'Tex';

export interface ISlotPlugin<T extends SlotType = SlotType> {
  readonly config: IBasePluginConfig;

  readonly Component: Component | null;

  readonly props?: Record<string, unknown>;

  readonly type: T;

  renderInline?(props: SlotBaseProps & Record<string, unknown>): UniRenderNode[] | null;

  destroy(): void;
}

export type ISlotPluggable<T extends SlotType = SlotType, O = unknown> = IPluggable<
  ISlotPlugin<T>,
  O
>;

export type AnySlotPlugin = ISlotPlugin;

export type AnySlotPluggable<O = unknown> = ISlotPluggable<SlotType, O>;

export type Slots = Partial<Record<SlotType, ISlotPlugin[]>>;

export interface SlotBaseProps {
  children?: UniRenderNode[];

  current?: ElementContent;

  parents?: Parent[];

  render?: (node: ElementContent) => UniRenderNode;
}
