import type { PropsWithChildren } from 'react';
import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface MarkdownStyles {
  text?: StyleProp<TextStyle>;

  paragraph?: StyleProp<TextStyle>;

  heading1?: StyleProp<TextStyle>;

  heading2?: StyleProp<TextStyle>;

  heading3?: StyleProp<TextStyle>;

  heading4?: StyleProp<TextStyle>;

  heading5?: StyleProp<TextStyle>;

  heading6?: StyleProp<TextStyle>;

  strong?: StyleProp<TextStyle>;

  emphasis?: StyleProp<TextStyle>;

  link?: StyleProp<TextStyle>;

  image?: StyleProp<ImageStyle>;

  list?: StyleProp<ViewStyle>;

  listItem?: StyleProp<ViewStyle>;

  listMarker?: StyleProp<TextStyle>;

  table?: StyleProp<ViewStyle>;

  tableRow?: StyleProp<ViewStyle>;

  tableCell?: StyleProp<ViewStyle>;

  codeBlock?: StyleProp<ViewStyle>;

  codeHeader?: StyleProp<ViewStyle>;

  code?: StyleProp<TextStyle>;

  inlineCode?: StyleProp<TextStyle>;

  blockquote?: StyleProp<ViewStyle>;

  tex?: StyleProp<TextStyle>;

  breakLine?: StyleProp<ViewStyle>;
}

export interface NativeTheme {
  colors: {
    text: string;

    muted: string;

    background: string;

    border: string;

    borderEmphasis: string;

    surfaceMuted: string;

    link: string;

    codeBackground: string;

    quoteBackground: string;
  };

  syntax: {
    comment: string;

    keyword: string;

    string: string;

    number: string;

    function: string;

    variable: string;

    punctuation: string;

    inserted: string;

    deleted: string;
  };

  styles?: MarkdownStyles;
}

export type PartialThemeConfig = {
  colors?: Partial<NativeTheme['colors']>;

  syntax?: Partial<NativeTheme['syntax']>;

  styles?: MarkdownStyles;
};

export type PresetKeys = 'light' | 'dark';

export type Theme = PresetKeys | PartialThemeConfig | [PresetKeys, PartialThemeConfig];

export type ThemeConfig = NativeTheme;

export interface NativeThemeProviderProps extends PropsWithChildren {
  theme?: Theme;

  styles?: MarkdownStyles;

  selectable?: boolean;
}
