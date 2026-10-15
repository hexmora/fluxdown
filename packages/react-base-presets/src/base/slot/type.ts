import type { IBasePluginConfig, IPluggable } from '@fluxdown/types';
import type { Element, ElementContent, Parent } from 'hast';
import type { ComponentType, ReactNode } from 'react';

declare global {
  interface SlotConfigs {}
}

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
  | 'Node'
  | 'Shad'
  | 'Tex'
  | 'Fallback'
  | 'Wrapper';

type SlotChildrenProps<HasChildren extends boolean> = HasChildren extends true
  ? { children?: ReactNode }
  : {};

type SlotNodeProps<HasNode extends boolean> = HasNode extends true
  ? {
      current: ElementContent;

      parents: Parent[];

      render: (node: ElementContent) => ReactNode;
    }
  : {};

export type SlotPositionType<P> = ComponentType<P> | null;

type SlotBasePropsWithoutRaw<
  T extends object,
  HasChildren extends boolean,
  HasNode extends boolean,
> = {} & SlotChildrenProps<HasChildren> & SlotNodeProps<HasNode> & T;

export type SlotBaseProps<
  T extends object = {},
  HasChildren extends boolean = false,
  HasNode extends boolean = false,
> = {
  Raw: SlotPositionType<SlotBasePropsWithoutRaw<T, HasChildren, HasNode>>;
} & SlotBasePropsWithoutRaw<T, HasChildren, HasNode>;

export type BlockquoteProps = SlotBaseProps<{}, true, true>;

export type BreakLineProps = SlotBaseProps<{ current?: Element }>;

export interface CodeBlockBaseContent {
  code: string;

  language?: string;

  meta?: string;
}

/**
 * Handles code-copy actions; platform slots own clipboard interaction.
 */
export type CodeBlockHandleCopyFunction = (content: CodeBlockBaseContent) => void;

export enum CodeHeaderInnerActionKey {
  Copy = 'copy',
}

export interface CodeHeaderAction {
  key: CodeHeaderInnerActionKey | string;

  target: ComponentType | ReactNode;
}

export type CodeHeaderActions =
  | CodeHeaderAction[]
  | ((previous: CodeHeaderAction[]) => CodeHeaderAction[]);

export type CodeBlockProps = SlotBaseProps<
  CodeBlockBaseContent & {
    current?: Element;

    loading?: boolean;

    onCopy?: CodeBlockHandleCopyFunction;

    showHeader?: boolean;
  }
>;

export type CodeHeaderProps = SlotBaseProps<
  CodeBlockBaseContent & {
    actions?: CodeHeaderActions;

    left?: ReactNode;

    onCopy?: CodeBlockHandleCopyFunction;
  }
>;

export type CodeHighlighterProps = SlotBaseProps<CodeBlockBaseContent>;

export type EmphasisProps = SlotBaseProps<{}, true, true>;

export type HeadingProps = SlotBaseProps<{ level: number }, true, true>;

export type ImageProps = SlotBaseProps<
  {
    alt?: string;

    src: string;

    title?: string;
  },
  false,
  true
>;

export type LinkProps = SlotBaseProps<
  {
    href: string;

    title?: string;
  },
  true,
  true
>;

export type ListType = 'bullet' | 'ordered' | 'task';

export type ListProps = SlotBaseProps<{ type: ListType }, true, true>;

export type ParagraphProps = SlotBaseProps<{}, true, true>;

export type StrongProps = SlotBaseProps<{}, true, true>;

export type TableProps = SlotBaseProps<{ current?: Element }, true>;

export type TableCellProps = SlotBaseProps<
  {
    renderChildren: (node?: Parent) => ReactNode;
  },
  false,
  true
>;

export type NodeProps = SlotBaseProps<
  {
    renderChildren: (node?: Parent) => ReactNode;
  },
  false,
  true
>;

export type ShadProps = SlotBaseProps<{
  leading: ReactNode;

  active: ReactNode;

  isActive: boolean;
}>;

export type TexProps = SlotBaseProps<
  {
    mode?: 'display' | 'inline';

    tex: string;
  },
  false,
  true
>;

type FallbackOwnProps = {
  props?: unknown;

  error?: unknown;

  onReset?: () => void;
};

type FallbackPropsWithoutRaw = SlotBasePropsWithoutRaw<FallbackOwnProps, false, false> & {
  type: SlotType;
};

export type FallbackProps = {
  Raw: SlotPositionType<FallbackPropsWithoutRaw>;
} & FallbackPropsWithoutRaw;

type WrapperPropsWithoutRaw = SlotBasePropsWithoutRaw<{ props?: unknown }, true, false> & {
  type: SlotType;
};

export type WrapperProps = {
  Raw: SlotPositionType<WrapperPropsWithoutRaw>;
} & WrapperPropsWithoutRaw;

export interface SlotProps {
  Blockquote: BlockquoteProps;

  BreakLine: BreakLineProps;

  CodeBlock: CodeBlockProps;

  CodeHeader: CodeHeaderProps;

  CodeHighlighter: CodeHighlighterProps;

  Emphasis: EmphasisProps;

  Heading: HeadingProps;

  Image: ImageProps;

  Link: LinkProps;

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
}

export type SlotInputProps<T extends SlotType = SlotType> = {
  [K in T]: Omit<SlotProps[K], 'Raw'>;
}[T];

export interface ISlotPlugin<T extends SlotType> {
  readonly config: IBasePluginConfig;

  readonly Component: SlotPositionType<SlotProps[T]>;

  destroy(): void;

  readonly type: T;
}

export type ISlotPluggable<T extends SlotType, O = unknown> = IPluggable<ISlotPlugin<T>, O>;

export type AnySlotPlugin = {
  [T in SlotType]: ISlotPlugin<T>;
}[SlotType];

export type AnySlotPluggable<O = unknown> = IPluggable<AnySlotPlugin, O>;

export type Slots = {
  [T in SlotType]: ISlotPlugin<T>[];
};

export type RuntimeSlotProps = SlotProps[SlotType];

export type RuntimeSlotComponent = ComponentType<RuntimeSlotProps>;

export type RuntimeSlotInputComponent = ComponentType<SlotInputProps>;

export type NamedSlotType = Exclude<
  SlotType,
  'Fallback' | 'Wrapper' | 'Node' | 'Shad' | 'TableCell'
>;

export interface SlotFallbackContextValue {
  Component: RuntimeSlotInputComponent | null;

  props: SlotInputProps;

  type: NamedSlotType;
}
