import { PREFIX } from '@fluxdown/vue-plugins/base';

import type { ThemeTokens } from '../../types';

export const BASE_TOKENS: Omit<ThemeTokens, 'colors' | 'syntax'> = {
  typography: {
    fontSans:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",

    fontMono: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",

    fontSmoothing: 'antialiased',

    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },

    lineHeight: { sm: 1.4, md: 1.65, lg: 1.8 },

    fontWeight: { normal: 400, medium: 600, bold: 650 },
  },

  heading: {
    h1: {
      fontSize: '2rem',

      fontWeight: 650,

      lineHeight: 1.25,

      marginTop: '2rem',

      marginBottom: '1rem',
    },

    h2: {
      fontSize: '1.5rem',

      fontWeight: 650,

      lineHeight: 1.3,

      marginTop: '1.75rem',

      marginBottom: '0.875rem',
    },

    h3: {
      fontSize: '1.25rem',

      fontWeight: 600,

      lineHeight: 1.4,

      marginTop: '1.5rem',

      marginBottom: '0.75rem',
    },

    h4: {
      fontSize: '1.125rem',

      fontWeight: 600,

      lineHeight: 1.4,

      marginTop: '1.25rem',

      marginBottom: '0.625rem',
    },

    h5: {
      fontSize: '1rem',

      fontWeight: 600,

      lineHeight: 1.5,

      marginTop: '1rem',

      marginBottom: '0.5rem',
    },

    h6: {
      fontSize: '0.875rem',

      fontWeight: 600,

      lineHeight: 1.5,

      marginTop: '1rem',

      marginBottom: '0.5rem',
    },
  },

  paragraph: { marginTop: '0', marginBottom: '1rem' },

  code: { fontSize: '0.875rem', lineHeight: 1.65 },

  inlineCode: {
    paddingBlock: '0.15em',

    paddingInline: '0.35em',

    border: `1px solid var(--${PREFIX}-colors-border)`,

    borderRadius: `var(--${PREFIX}-radius-sm)`,

    background: `var(--${PREFIX}-colors-surface-muted)`,

    fontFamily: `var(--${PREFIX}-typography-font-mono)`,

    fontSize: '0.875em',

    whiteSpace: 'break-spaces',
  },

  divider: {
    height: '1px',

    marginBlock: `var(--${PREFIX}-spacing-xl)`,

    marginInline: '0',

    border: '0',

    borderBlockEnd: `var(--${PREFIX}-divider-border)`,

    background: `var(--${PREFIX}-colors-border)`,
  },

  footnotes: {
    marginTop: `var(--${PREFIX}-spacing-xl)`,

    paddingTop: `var(--${PREFIX}-spacing-lg)`,

    borderTop: `1px solid var(--${PREFIX}-colors-border)`,

    color: `var(--${PREFIX}-colors-fg-muted)`,

    fontSize: `var(--${PREFIX}-typography-font-size-sm)`,
  },

  radius: { sm: '0.25rem', md: '0.5rem', lg: '0.875rem' },

  spacing: { xs: '0.25rem', sm: '0.5rem', md: '0.75rem', lg: '1rem', xl: '1.5rem' },
};
