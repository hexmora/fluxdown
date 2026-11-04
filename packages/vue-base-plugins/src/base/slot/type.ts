import type { SuffixType } from '@fluxdown/core-plugins/plugins/mapper/suffix';
import type { IBasePluginConfig, IPluggable } from '@fluxdown/types';
import type { ElementContent, Parent } from 'hast';
import type { Component, FunctionalComponent, VNodeChild } from 'vue';

declare global {
  interface VueSlotConfigs {}
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
  | 'Element'
  | 'Chunk'
  | 'Scale'
  | 'ScaleWord'
  | 'Shad'
  | 'Suffix'
  | 'Tex'
  | 'Fallback'
  | 'Wrapper';

type SlotChildrenProps<HasChildren extends boolean> = HasChildren extends true
  ? { children?: VNodeChild }
  : {};

type SlotNodeProps<HasNode extends boolean> = HasNode extends true
  ? {
      current: ElementContent;

      parents: Parent[];

      render: (node: ElementContent) => VNodeChild;
    }
  : {};

export type SlotPositionType<P> =
  | FunctionalComponent<P>
  | Exclude<Component, FunctionalComponent>
  | null;

type SlotBasePropsWithoutRaw<
  T extends object,
  HasChildren extends boolean,
  HasNode extends boolean,
> = SlotChildrenProps<HasChildren> & SlotNodeProps<HasNode> & T;

export type SlotBaseProps<
  T extends object = {},
  HasChildren extends boolean = false,
  HasNode extends boolean = false,
  Attributes extends object = {},
> = {
  Raw: SlotPositionType<SlotBasePropsWithoutRaw<T, HasChildren, HasNode> & Attributes>;
} & SlotBasePropsWithoutRaw<T, HasChildren, HasNode> &
  Attributes;

export type BlockquoteProps = SlotBaseProps<{}, true, true>;

export type BreakLineProps = SlotBaseProps;

export interface CodeBlockBaseContent {
  code: string;

  language?: string;

  meta?: string;
}

/** Called after the default copy action successfully writes code to the clipboard. */
export type CodeBlockHandleCopyFunction = (content: CodeBlockBaseContent) => void;

export enum CodeHeaderInnerActionKey {
  Copy = 'copy',
}

export interface CodeHeaderAction {
  key: CodeHeaderInnerActionKey | string;

  target: Component | VNodeChild;
}

export type CodeHeaderActions =
  | CodeHeaderAction[]
  | ((previous: CodeHeaderAction[]) => CodeHeaderAction[]);

export type CodeBlockProps = SlotBaseProps<
  CodeBlockBaseContent & {
    loading?: boolean;

    onCopy?: CodeBlockHandleCopyFunction;

    showHeader?: boolean;

    suffix?: VNodeChild;
  }
>;

export type CodeHeaderProps = SlotBaseProps<
  CodeBlockBaseContent & {
    actions?: CodeHeaderActions;

    left?: VNodeChild;

    onCopy?: CodeBlockHandleCopyFunction;
  }
>;

export type CodeHighlighterProps = SlotBaseProps<
  CodeBlockBaseContent & {
    suffix?: VNodeChild;
  }
>;

export type EmphasisProps = SlotBaseProps<{}, true, true>;

export type HeadingProps = SlotBaseProps<{ level: number }, true, true>;

export type ImageProps = SlotBaseProps<
  {
    alt?: string;

    height?: number | string;

    src: string;

    title?: string;

    width?: number | string;
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

export type TableProps = SlotBaseProps<{}, true>;

export type TableCellProps = SlotBaseProps<{ tagName: 'td' | 'th'; align?: string }, true>;

export type ElementProps = SlotBaseProps<{ tagName: string }, true>;

export type ChunkProps = SlotBaseProps<{ start: number; duration: number }, true>;

export type ScaleProps = SlotBaseProps<
  { start: number; duration: number; from: number; blur: number },
  true
>;

export type ScaleWordProps = SlotBaseProps<{}, true>;

export type ShadProps = SlotBaseProps<{ start: number; duration: number }, true>;

export type SuffixProps = SlotBaseProps<{ type: SuffixType }, true>;

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

interface SlotContents {
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

  Element: ElementProps;

  Chunk: ChunkProps;

  Scale: ScaleProps;

  ScaleWord: ScaleWordProps;

  Shad: ShadProps;

  Suffix: SuffixProps;

  Tex: TexProps;

  Fallback: FallbackProps;

  Wrapper: WrapperProps;
}

type WithHostProps<Props, Attributes, ExtraProps> = Omit<
  Props,
  'Raw' | keyof Attributes | keyof ExtraProps
> &
  Attributes &
  ExtraProps;

export type SlotProps<
  Attributes extends object = {},
  ExtraProps extends Partial<Record<SlotType, object>> = {},
> = {
  [T in SlotType]: WithHostProps<
    SlotContents[T],
    Attributes,
    T extends keyof ExtraProps ? ExtraProps[T] : {}
  > & {
    Raw: SlotPositionType<
      WithHostProps<SlotContents[T], Attributes, T extends keyof ExtraProps ? ExtraProps[T] : {}>
    >;
  };
};

export type SlotInputProps<T extends SlotType = SlotType> = {
  [K in T]: Omit<SlotProps[K], 'Raw'>;
}[T];

export interface ISlotPlugin<T extends SlotType, Props extends object = SlotProps[T]> {
  readonly config: IBasePluginConfig;

  readonly Component: SlotPositionType<Props>;

  destroy(): void;

  readonly type: T;
}

export type ISlotPluggable<T extends SlotType, O = unknown> = IPluggable<ISlotPlugin<T>, O>;

export interface AnySlotPlugin {
  readonly config: IBasePluginConfig;

  readonly Component: Component | null;

  destroy(): void;

  readonly type: SlotType;
}

export type AnySlotPluggable<O = unknown> = IPluggable<AnySlotPlugin, O>;

export type Slots = Partial<Record<SlotType, AnySlotPlugin[]>>;

export type RuntimeSlotComponent = Component;

export type RuntimeSlotInputComponent = FunctionalComponent<SlotInputProps>;

export type RuntimeSlotProps = SlotProps[SlotType];

export type NamedSlotType = Exclude<SlotType, 'Fallback' | 'Wrapper'>;
