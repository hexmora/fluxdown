import type { ThemeTokens } from '../../../typings/theme';

export const BASE_TOKENS: Omit<ThemeTokens, 'colors' | 'syntax'> = {
  typography: {
    fontSans: '',
    fontMono: 'monospace',
    fontSize: { xs: 12, sm: 14, md: 16 },
    lineHeight: { sm: 1.4, md: 1.65, lg: 1.8 },
    fontWeight: { normal: '400', medium: '700', bold: '700' },
  },

  heading: {
    h1: { fontSize: 32, fontWeight: '700', lineHeight: 1.25, marginTop: 32, marginBottom: 16 },
    h2: { fontSize: 24, fontWeight: '700', lineHeight: 1.3, marginTop: 28, marginBottom: 14 },
    h3: { fontSize: 20, fontWeight: '700', lineHeight: 1.4, marginTop: 24, marginBottom: 12 },
    h4: { fontSize: 18, fontWeight: '700', lineHeight: 1.4, marginTop: 20, marginBottom: 10 },
    h5: { fontSize: 16, fontWeight: '700', lineHeight: 1.5, marginTop: 16, marginBottom: 8 },
    h6: { fontSize: 14, fontWeight: '700', lineHeight: 1.5, marginTop: 16, marginBottom: 8 },
  },

  paragraph: { marginTop: 0, marginBottom: 16 },
  code: { fontSize: 14, lineHeight: 1.65 },
  radius: { sm: 4, md: 8, lg: 14 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
};
