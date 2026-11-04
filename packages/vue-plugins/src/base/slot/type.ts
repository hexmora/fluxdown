import type { IPluggable } from '@fluxdown/types';
import type {
  SlotBaseProps as SharedSlotBaseProps,
  ISlotPlugin as SharedSlotPlugin,
  SlotProps as SharedSlotProps,
  SlotType,
} from '@fluxdown/vue-base-plugins/base';
import type { FunctionalComponent, HTMLAttributes, StyleValue } from 'vue';

import type { ImageClickParams, LinkClickParams } from './attributes';

export interface SlotBaseAttributes {
  class?: HTMLAttributes['class'];

  style?: StyleValue;
}

export interface ImageSlotAttributes {
  onClick?: (params: ImageClickParams) => void;
}

export interface LinkSlotAttributes {
  onClick?: (params: LinkClickParams) => void;
}

interface ExtraProps {
  Image: ImageSlotAttributes;

  Link: LinkSlotAttributes;
}

export type SlotProps = SharedSlotProps<SlotBaseAttributes, ExtraProps>;

export type BlockquoteProps = SlotProps['Blockquote'];

export type BreakLineProps = SlotProps['BreakLine'];

export type CodeBlockProps = SlotProps['CodeBlock'];

export type CodeHeaderProps = SlotProps['CodeHeader'];

export type CodeHighlighterProps = SlotProps['CodeHighlighter'];

export type EmphasisProps = SlotProps['Emphasis'];

export type HeadingProps = SlotProps['Heading'];

export type ImageProps = SlotProps['Image'];

export type LinkProps = SlotProps['Link'];

export type ListProps = SlotProps['List'];

export type ParagraphProps = SlotProps['Paragraph'];

export type StrongProps = SlotProps['Strong'];

export type TableProps = SlotProps['Table'];

export type TableCellProps = SlotProps['TableCell'];

export type ElementProps = SlotProps['Element'];

export type ChunkProps = SlotProps['Chunk'];

export type ScaleProps = SlotProps['Scale'];

export type ScaleWordProps = SlotProps['ScaleWord'];

export type ShadProps = SlotProps['Shad'];

export type SuffixProps = SlotProps['Suffix'];

export type TexProps = SlotProps['Tex'];

export type FallbackProps = SlotProps['Fallback'];

export type WrapperProps = SlotProps['Wrapper'];

export type SlotBaseProps<
  T extends object = {},
  HasChildren extends boolean = false,
  HasNode extends boolean = false,
> = SharedSlotBaseProps<T, HasChildren, HasNode, SlotBaseAttributes>;

export type SlotInputProps<T extends SlotType = SlotType> = {
  [K in T]: Omit<SlotProps[K], 'Raw'>;
}[T];

export type ISlotPlugin<T extends SlotType> = SharedSlotPlugin<T, SlotProps[T]>;

export type ISlotPluggable<T extends SlotType, O = unknown> = IPluggable<ISlotPlugin<T>, O>;

export type AnySlotPlugin = {
  [T in SlotType]: ISlotPlugin<T>;
}[SlotType];

export type AnySlotPluggable<O = unknown> = IPluggable<AnySlotPlugin, O>;

export type Slots = {
  [T in SlotType]: ISlotPlugin<T>[];
};

export type RuntimeSlotProps = SlotProps[SlotType];

export type RuntimeSlotInputComponent = FunctionalComponent<SlotInputProps>;
