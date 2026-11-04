import type { IPluggable } from '@fluxdown/types';
import type {
  CodeBlockBaseContent,
  SlotBaseProps as SharedSlotBaseProps,
  ISlotPlugin as SharedSlotPlugin,
  SlotProps as SharedSlotProps,
  SlotType,
} from '@fluxdown/vue-base-plugins/base';
import type { BaseEvent, CSSProperties, StandardProps } from '@lynx-js/types';
import type { ElementContent, Parent } from 'hast';
import type { FunctionalComponent, VNodeChild } from 'vue';

export interface SlotBaseAttributes extends Omit<
  StandardProps,
  'style' | 'children' | 'ref' | 'key' | 'className'
> {
  [key: `data-${string}`]: string | number | boolean | undefined;

  class?: string;

  style?: CSSProperties;
}

export interface ImageSlotAttributes {
  onTap?: (params: { event: BaseEvent; src: string }) => void;
}

export interface LinkSlotAttributes {
  onTap?: (params: { event: BaseEvent; href: string }) => void;
}

/** The host performs the clipboard write; Lynx does not provide a universal clipboard API. */
export type CodeBlockHandleCopyFunction = (content: CodeBlockBaseContent) => void | Promise<void>;

type NodeProps = {
  current: ElementContent;

  parents: Parent[];

  render: (node: ElementContent) => VNodeChild;
};

interface ExtraProps {
  Image: ImageSlotAttributes;

  Link: LinkSlotAttributes;

  CodeBlock: NodeProps & { onCopy?: CodeBlockHandleCopyFunction };

  CodeHeader: { onCopy?: CodeBlockHandleCopyFunction };

  Table: NodeProps & { columns: number };

  TableCell: NodeProps;

  Element: NodeProps & { checked?: boolean; start?: number; columns?: number };
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

declare global {
  interface VueSlotConfigs {}
}

export type AnySlotPlugin = {
  [T in SlotType]: ISlotPlugin<T>;
}[SlotType];

export type AnySlotPluggable<O = unknown> = IPluggable<AnySlotPlugin, O>;

export type Slots = {
  [T in SlotType]: ISlotPlugin<T>[];
};

export type RuntimeSlotProps = SlotProps[SlotType];

export type RuntimeSlotInputComponent = FunctionalComponent<SlotInputProps>;
