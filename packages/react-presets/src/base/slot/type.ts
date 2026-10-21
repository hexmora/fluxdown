import type {
  SlotProps as BaseSlotProps,
  NamedSlotType,
  SlotBaseProps as SharedSlotBaseProps,
  SlotPositionType,
  SlotType,
} from '@fluxdown/react-base-presets/base';
import type { IBasePluginConfig, IPluggable } from '@fluxdown/types';
import type { ComponentType, CSSProperties, MouseEvent, PropsWithChildren } from 'react';

import { BaseSlotPlugin as SharedBaseSlotPlugin } from '@fluxdown/react-base-presets/base';

export type {
  CodeBlockBaseContent,
  CodeBlockHandleCopyFunction,
  CodeHeaderAction,
  CodeHeaderActions,
  ListType,
  NamedSlotType,
  SlotPositionType,
  SlotType,
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

export type SlotBaseProps<
  T extends object = {},
  HasChildren extends boolean = false,
  HasNode extends boolean = false,
> = PlatformSlot<SharedSlotBaseProps<T, HasChildren, HasNode>>;

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

export interface ISlotPlugin<T extends SlotType> {
  readonly config: IBasePluginConfig;

  readonly Component: SlotPositionType<SlotProps[T]>;

  destroy(): void;

  readonly type: T;
}

// Keep the shared constructor identity while exposing the DOM slot contract.
export type BaseSlotPlugin<T extends SlotType> = ISlotPlugin<T>;

export const BaseSlotPlugin = SharedBaseSlotPlugin as abstract new <
  T extends SlotType,
>() => BaseSlotPlugin<T>;

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

export interface SlotFallbackContextValue {
  Component: RuntimeSlotInputComponent | null;

  props: SlotInputProps;

  type: NamedSlotType;
}

export interface SlotProviderProps extends PropsWithChildren {
  plugins: readonly AnySlotPluggable[];
}

export interface SlotRendererProps {
  props: SlotInputProps;

  type: SlotType;
}
