import type { SlotProps as BaseSlotProps, SlotType } from '@fluxdown/react-base-presets/base';
import type { ComponentType, CSSProperties, MouseEvent } from 'react';

export type {
  CodeBlockBaseContent,
  CodeBlockHandleCopyFunction,
  CodeHeaderAction,
  CodeHeaderActions,
  ListType,
} from '@fluxdown/react-base-presets/base';

export { CodeHeaderInnerActionKey } from '@fluxdown/react-base-presets/base';

interface PlatformProps {
  className?: string;

  style?: CSSProperties;
}

type InputProps<P, Extra extends object> = Omit<P, 'Raw'> &
  Omit<PlatformProps, keyof Extra> &
  Extra;

type PlatformSlot<P, Extra extends object = {}> = InputProps<P, Extra> & {
  Raw: ComponentType<InputProps<P, Extra>> | null;
};

export type BlockquoteProps = PlatformSlot<BaseSlotProps['Blockquote']>;

export type BreakLineProps = PlatformSlot<BaseSlotProps['BreakLine']>;

export type CodeBlockProps = PlatformSlot<BaseSlotProps['CodeBlock']>;

export type CodeHeaderProps = PlatformSlot<BaseSlotProps['CodeHeader']>;

export type CodeHighlighterProps = PlatformSlot<BaseSlotProps['CodeHighlighter']>;

export type EmphasisProps = PlatformSlot<BaseSlotProps['Emphasis']>;

export type HeadingProps = PlatformSlot<BaseSlotProps['Heading']>;

export type ListProps = PlatformSlot<BaseSlotProps['List']>;

export type ParagraphProps = PlatformSlot<BaseSlotProps['Paragraph']>;

export type StrongProps = PlatformSlot<BaseSlotProps['Strong']>;

export type TableProps = PlatformSlot<BaseSlotProps['Table']>;

export type TableCellProps = PlatformSlot<BaseSlotProps['TableCell']>;

export type NodeProps = PlatformSlot<BaseSlotProps['Node']>;

export type ShadProps = PlatformSlot<BaseSlotProps['Shad']>;

export type TexProps = PlatformSlot<BaseSlotProps['Tex']>;

export type FallbackProps = PlatformSlot<BaseSlotProps['Fallback']>;

export type WrapperProps = PlatformSlot<BaseSlotProps['Wrapper']>;

export interface ImageClickParams {
  event: MouseEvent<HTMLImageElement>;
}

export interface LinkClickParams {
  event: MouseEvent<HTMLAnchorElement>;
}

export type ImageProps = PlatformSlot<
  BaseSlotProps['Image'],
  {
    width?: number | string;

    height?: number | string;

    onClick?: (params: ImageClickParams) => void;
  }
>;

export type LinkProps = PlatformSlot<
  BaseSlotProps['Link'],
  {
    onClick?: (params: LinkClickParams) => void;
  }
>;

export interface SlotProps {
  Blockquote: BlockquoteProps;

  BreakLine: BreakLineProps;

  CodeBlock: CodeBlockProps;

  CodeHeader: CodeHeaderProps;

  CodeHighlighter: CodeHighlighterProps;

  Emphasis: EmphasisProps;

  Heading: HeadingProps;

  List: ListProps;

  Paragraph: ParagraphProps;

  Strong: StrongProps;

  Table: TableProps;

  TableCell: TableCellProps;

  Node: NodeProps;

  Shad: ShadProps;

  Tex: TexProps;

  Fallback: FallbackProps;

  Wrapper: WrapperProps;

  Image: ImageProps;

  Link: LinkProps;
}

export type SlotInputProps<T extends SlotType = SlotType> = {
  [K in T]: Omit<SlotProps[K], 'Raw'>;
}[T];
