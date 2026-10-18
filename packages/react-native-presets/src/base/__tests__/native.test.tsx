import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { getReactNativeProps, NativeThemeProvider, normalizePublicUrl, useNativeTheme } from '..';

const ThemeProbe = () => {
  const { colors, styles, selectable } = useNativeTheme();

  return (
    <Text
      testID="theme"
      selectable={selectable}
      style={[{ color: colors.text, backgroundColor: colors.background }, styles.paragraph]}
    >
      theme
    </Text>
  );
};

describe('native theme and property boundaries', () => {
  test('merges preset colors, theme styles, and explicit styles', () => {
    render(
      <NativeThemeProvider
        selectable
        theme={['dark', { colors: { text: 'red' }, styles: { paragraph: { fontSize: 18 } } }]}
        styles={{ paragraph: { fontSize: 20 } }}
      >
        <ThemeProbe />
      </NativeThemeProvider>,
    );

    expect(screen.getByTestId('theme')).toHaveStyle({
      color: 'red',
      backgroundColor: '#212121',
      fontSize: 20,
    });

    expect(screen.getByTestId('theme').props.selectable).toBe(true);
  });

  test('does not forward HTML event handlers or CSS to native views', () => {
    expect(
      getReactNativeProps({
        type: 'element',
        tagName: 'p',
        children: [],
        properties: {
          id: 'intro',
          ariaLabel: 'Introduction',
          onPress: 'bad()',
          style: 'color:red',
          className: ['hidden'],
        },
      }),
    ).toEqual({ nativeID: 'intro', accessibilityLabel: 'Introduction' });
  });

  test.each([
    'javascript:alert(1)',
    'data:text/html,hello',
    '/relative',
    '//host/path',
    'https:',
    'https://',
    'http://exa\nmple.com',
    'file:///tmp/private',
  ])('rejects unsafe or nonpublic native URL %s', (url) => {
    expect(normalizePublicUrl(url, { allowMailto: true, allowTel: true })).toBeUndefined();
  });

  test.each([
    'https://example.com/path',
    'http://example.com',
    'mailto:hello@example.com',
    'tel:+123456789',
  ])('accepts supported native URL %s', (url) => {
    expect(normalizePublicUrl(url, { allowMailto: true, allowTel: true })).toBe(url);
  });
});
