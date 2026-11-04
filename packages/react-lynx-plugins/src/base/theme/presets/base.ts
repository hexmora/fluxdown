import type { ThemeTokens } from '../type';

import { PREFIX } from '../../consts';

export const BASE_TOKENS: Omit<ThemeTokens, 'colors' | 'syntax'> = {
  typography: {
    fontSans:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    fontMono: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
    fontSmoothing: 'antialiased',
    fontSize: { xs: '12px', sm: '14px', md: '16px' },
    lineHeight: { sm: 1.4, md: 1.65, lg: 1.8 },
    fontWeight: { normal: 400, medium: 600, bold: 650 },
  },
  heading: {
    h1: {
      fontSize: '32px',
      fontWeight: 650,
      lineHeight: 1.25,
      marginTop: '32px',
      marginBottom: '16px',
    },
    h2: {
      fontSize: '24px',
      fontWeight: 650,
      lineHeight: 1.3,
      marginTop: '28px',
      marginBottom: '14px',
    },
    h3: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: 1.4,
      marginTop: '24px',
      marginBottom: '12px',
    },
    h4: {
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: 1.4,
      marginTop: '20px',
      marginBottom: '10px',
    },
    h5: {
      fontSize: '16px',
      fontWeight: 600,
      lineHeight: 1.5,
      marginTop: '16px',
      marginBottom: '8px',
    },
    h6: {
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: 1.5,
      marginTop: '16px',
      marginBottom: '8px',
    },
  },
  paragraph: { marginTop: '0', marginBottom: '16px' },
  code: { fontSize: '14px', lineHeight: 1.65 },
  inlineCode: {
    paddingBlock: '0.15em',
    paddingInline: '0.35em',
    border: `1px solid var(--${PREFIX}-colors-border)`,
    borderRadius: `var(--${PREFIX}-radius-sm)`,
    background: `var(--${PREFIX}-colors-surface-muted)`,
    fontFamily: `var(--${PREFIX}-typography-font-mono)`,
    fontSize: '0.875em',
    whiteSpace: 'normal',
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
  radius: { sm: '4px', md: '8px', lg: '14px' },
  spacing: { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px' },
};
