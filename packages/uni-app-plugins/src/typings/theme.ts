export interface ThemeTokens {
  colors: {
    fg: string;
    fgMuted: string;
    bg: string;
    border: string;
    accent: string;
    accentHover: string;
    surfaceMuted: string;
    surfaceSubtle: string;
    borderEmphasis: string;
  };

  typography: {
    fontSans: string;
    fontMono: string;
    fontSize: { xs: number; sm: number; md: number };
    lineHeight: { sm: number; md: number; lg: number };
    fontWeight: {
      normal: 'normal' | 'bold' | '400' | '500' | '600' | '700';
      medium: 'normal' | 'bold' | '400' | '500' | '600' | '700';
      bold: 'normal' | 'bold' | '400' | '500' | '600' | '700';
    };
  };

  heading: Record<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', HeadingThemeTokens>;

  paragraph: { marginTop: number; marginBottom: number };

  code: { fontSize: number; lineHeight: number };

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

  radius: { sm: number; md: number; lg: number };

  spacing: { xs: number; sm: number; md: number; lg: number; xl: number };
}

export interface HeadingThemeTokens {
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '400' | '500' | '600' | '700';
  lineHeight: number;
  marginTop: number;
  marginBottom: number;
}

export interface ThemeConfig {
  tokens: ThemeTokens;
}

export type PartialThemeConfig<T = ThemeConfig> = {
  [K in keyof T]?: T[K] extends object ? PartialThemeConfig<T[K]> : T[K];
};

export type PresetKeys = 'light' | 'dark';

export type Theme = PresetKeys | PartialThemeConfig | [PresetKeys, PartialThemeConfig];
