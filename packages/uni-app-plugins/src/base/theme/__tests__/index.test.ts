import { DARK_THEME, LIGHT_THEME, toThemeConfig } from '..';

describe('uni-app theme', () => {
  test('uses platform-independent defaults', () => {
    expect(toThemeConfig()).toBe(LIGHT_THEME);

    expect(toThemeConfig('dark')).toBe(DARK_THEME);
  });

  test('merges tokens without mutating the shared preset', () => {
    const result = toThemeConfig(['dark', { tokens: { colors: { accent: '#ff0000' } } }]);

    expect(result.tokens.colors.accent).toBe('#ff0000');

    expect(result.tokens.colors.fg).toBe(DARK_THEME.tokens.colors.fg);

    expect(DARK_THEME.tokens.colors.accent).not.toBe('#ff0000');
  });
});
