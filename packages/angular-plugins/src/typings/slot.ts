import type { InputSignal, Type } from '@angular/core';
import type { SuffixType } from '@fluxdown/core-plugins/plugins/mapper/suffix';
import type { IBasePluginConfig, IPluggable, IPluggableConfig } from '@fluxdown/types';
import type { ElementContent, Parent } from 'hast';

import type { AngularRenderNode } from './node';

declare global {
  interface AngularSlotConfigs {
    'slot-blockquote': IPluggableConfig<void>;

    'slot-break-line': IPluggableConfig<void>;

    'slot-chunk': IPluggableConfig<void>;

    'slot-code-block': IPluggableConfig<void>;

    'slot-code-header': IPluggableConfig<void>;

    'slot-code-highlighter': IPluggableConfig<void>;

    'slot-code-pele': IPluggableConfig<void>;

    'slot-element': IPluggableConfig<void>;

    'slot-emphasis': IPluggableConfig<void>;

    'slot-heading': IPluggableConfig<void>;

    'slot-image': IPluggableConfig<void>;

    'slot-link': IPluggableConfig<void>;

    'slot-list': IPluggableConfig<void>;

    'slot-paragraph': IPluggableConfig<void>;

    'slot-scale': IPluggableConfig<void>;

    'slot-scale-word': IPluggableConfig<void>;

    'slot-shad': IPluggableConfig<void>;

    'slot-strong': IPluggableConfig<void>;

    'slot-suffix': IPluggableConfig<void>;

    'slot-table': IPluggableConfig<void>;

    'slot-table-cell': IPluggableConfig<void>;

    'slot-tex': IPluggableConfig<void>;
  }

  interface AngularSlotBaseAttributes {
    class?: string;

    style?: Record<string, string | number | undefined>;
  }

  interface AngularImageSlotAttributes {
    onClick?: (params: { event: MouseEvent }) => void;
  }

  interface AngularLinkSlotAttributes {
    onClick?: (params: { event: MouseEvent }) => void;
  }
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
  ? { children?: AngularRenderNode }
  : {};

type SlotNodeProps<HasNode extends boolean> = HasNode extends true
  ? {
      current: ElementContent;

      parents: Parent[];

      render: (node: ElementContent) => AngularRenderNode;
    }
  : {};

export type SlotPositionType<P> = ((props: P) => AngularRenderNode) | null;

export interface SlotComponent<P> {
  readonly props: InputSignal<P>;
}

type SlotBasePropsWithoutRaw<
  T extends object,
  HasChildren extends boolean,
  HasNode extends boolean,
> = AngularSlotBaseAttributes & SlotChildrenProps<HasChildren> & SlotNodeProps<HasNode> & T;

export type SlotBaseProps<
  T extends object = {},
  HasChildren extends boolean = false,
  HasNode extends boolean = false,
> = {
  Raw: SlotPositionType<SlotBasePropsWithoutRaw<T, HasChildren, HasNode>>;
} & SlotBasePropsWithoutRaw<T, HasChildren, HasNode>;

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

  target: AngularRenderNode;
}

export type CodeHeaderActions =
  | CodeHeaderAction[]
  | ((previous: CodeHeaderAction[]) => CodeHeaderAction[]);

export type CodeBlockProps = SlotBaseProps<
  CodeBlockBaseContent & {
    loading?: boolean;

    onCopy?: CodeBlockHandleCopyFunction;

    showHeader?: boolean;

    suffix?: AngularRenderNode;
  }
>;

export type CodeHeaderProps = SlotBaseProps<
  CodeBlockBaseContent & {
    actions?: CodeHeaderActions;

    left?: AngularRenderNode;

    onCopy?: CodeBlockHandleCopyFunction;
  }
>;

export type CodeHighlighterProps = SlotBaseProps<
  CodeBlockBaseContent & {
    suffix?: AngularRenderNode;
  }
>;

export type EmphasisProps = SlotBaseProps<{}, true, true>;

export type HeadingProps = SlotBaseProps<{ level: number }, true, true>;

export type ImageProps = SlotBaseProps<
  AngularImageSlotAttributes & {
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
  AngularLinkSlotAttributes & {
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

export type ShadProps = SlotBaseProps<{
  leading: AngularRenderNode;
  active: AngularRenderNode;
  isActive: boolean;
  maskWidth: number;
  /** Grapheme offset of the shaded tail within its parent. */
  offset?: number;
}>;

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

export type SlotInputProps<T extends SlotType = SlotType> = {
  [K in T]: Omit<SlotProps[K], 'Raw'>;
}[T];

export interface ISlotPlugin<T extends SlotType> {
  readonly config: IBasePluginConfig;

  readonly Component: Type<SlotComponent<SlotProps[T]>> | null;

  readonly tagName?: string | ((props: SlotProps[T]) => string);

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
