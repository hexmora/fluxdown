export interface HighlightTheme {
  name?: string;

  settings: {
    scope?: string | string[];

    settings: {
      foreground?: string;

      background?: string;

      fontStyle?: string;
    };
  }[];
}

export interface HighlightedToken {
  content: string;

  offset: number;

  color?: string;

  fontStyle?: number;
}

export type HighlightedCode = {
  code: string;

  language: string;

  theme: HighlightTheme;

  tokens: HighlightedToken[][];
};
