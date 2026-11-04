export interface ThemeTokens {
  /**
   * Foreground, background, border, and interaction colors.
   */
  colors: {
    fg: string;

    fgMuted: string;

    bg: string;

    border: string;

    accent: string;

    /** Available to host slots; built-in native links have no hover state. */
    accentHover: string;

    surfaceMuted: string;

    surfaceSubtle: string;

    borderEmphasis: string;
  };

  /**
   * Shared font families, sizes, line heights, and weights.
   */
  typography: {
    fontSans: string;

    fontMono: string;

    /** Compatibility token; native text rasterization is controlled by the host. */
    fontSmoothing: string;

    fontSize: {
      xs: string;

      sm: string;

      md: string;
    };

    lineHeight: {
      sm: number | string;

      md: number | string;

      lg: number | string;
    };

    fontWeight: {
      normal: number | string;

      medium: number | string;

      bold: number | string;
    };
  };

  /**
   * Typography and spacing for each heading level.
   */
  heading: Record<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', HeadingThemeTokens>;

  /**
   * Vertical spacing around paragraphs.
   */
  paragraph: {
    marginTop: string;

    marginBottom: string;
  };

  /**
   * Font size and line height for fenced code blocks.
   */
  code: {
    fontSize: string;

    lineHeight: number | string;
  };

  /**
   * Presentation of inline code outside preformatted blocks.
   */
  inlineCode: {
    paddingBlock: string;

    paddingInline: string;

    border: string;

    borderRadius: string;

    background: string;

    fontFamily: string;

    fontSize: string;

    /** Native text supports normal and nowrap; other values use normal. */
    whiteSpace: string;
  };

  /**
   * Dimensions, spacing, and borders of thematic breaks.
   */
  divider: {
    height: string;

    marginBlock: string;

    marginInline: string;

    border: string;

    borderBlockEnd: string;

    background: string;
  };

  /**
   * Spacing, border, and typography of the footnotes section.
   */
  footnotes: {
    marginTop: string;

    paddingTop: string;

    borderTop: string;

    color: string;

    fontSize: string;
  };

  /**
   * Colors for syntax highlighting token categories.
   */
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

  /**
   * Border radii shared by slot containers and controls.
   */
  radius: {
    sm: string;

    md: string;

    lg: string;
  };

  /**
   * Spacing scale for margins, padding, and gaps.
   */
  spacing: {
    xs: string;

    sm: string;

    md: string;

    lg: string;

    xl: string;
  };
}

export interface HeadingThemeTokens {
  fontSize: string;

  fontWeight: number;

  lineHeight: number | string;

  marginTop: string;

  marginBottom: string;
}

export interface ThemeConfig {
  tokens: ThemeTokens;
}

export type PartialThemeConfig<T = ThemeConfig> = {
  [K in keyof T]?: T[K] extends object ? PartialThemeConfig<T[K]> : T[K];
};

export type PresetKeys = 'light' | 'dark';

export type Theme = PresetKeys | PartialThemeConfig | [PresetKeys, PartialThemeConfig];
