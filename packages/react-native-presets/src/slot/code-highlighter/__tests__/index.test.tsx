import { render, screen, waitFor } from '@testing-library/react-native';

import { DARK_THEME, LIGHT_THEME, NativeThemeProvider } from '../../../base';
import { CodeHighlighterRenderer } from '../renderer';

describe('native code highlighting', () => {
  test('preserves source and root props while highlighting with the web light palette', async () => {
    const code = 'const answer = 42;\n\n';

    render(
      <NativeThemeProvider selectable>
        <CodeHighlighterRenderer
          Raw={null}
          code={code}
          language="TS"
          testID="code"
          nativeID="source"
          accessibilityLabel="Example code"
          style={{ maxHeight: 300 }}
        />
      </NativeThemeProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText('const')).toHaveStyle({
        color: LIGHT_THEME.syntax.keyword.toUpperCase(),
      }),
    );

    expect(screen.getByText('42')).toHaveStyle({ color: LIGHT_THEME.syntax.number.toUpperCase() });

    expect(screen.getByTestId('code')).toHaveTextContent(code, { normalizer: (text) => text });

    expect(screen.getByTestId('code')).toHaveStyle({ maxHeight: 300, padding: 16, fontSize: 14 });

    expect(screen.getByTestId('code')).toHaveProp('nativeID', 'source');

    expect(screen.getByTestId('code')).toHaveProp('accessibilityLabel', 'Example code');

    expect(screen.getByTestId('code')).toHaveProp('selectable', true);
  });

  test('uses dark syntax colors and preserves unspecified colors in a partial override', async () => {
    const view = render(
      <NativeThemeProvider theme="dark">
        <CodeHighlighterRenderer Raw={null} code="const answer = 42" language="js" />
      </NativeThemeProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText('const')).toHaveStyle({
        color: DARK_THEME.syntax.keyword.toUpperCase(),
      }),
    );

    view.rerender(
      <NativeThemeProvider theme={['dark', { syntax: { keyword: '#ff0000' } }]}>
        <CodeHighlighterRenderer Raw={null} code="const answer = 42" language="js" />
      </NativeThemeProvider>,
    );

    await waitFor(() => expect(screen.getByText('const')).toHaveStyle({ color: '#FF0000' }));

    expect(screen.getByText('42')).toHaveStyle({ color: DARK_THEME.syntax.number.toUpperCase() });
  });

  test('shows the current plaintext immediately when code or language changes', async () => {
    const view = render(
      <CodeHighlighterRenderer Raw={null} code="const before = 1" language="js" testID="code" />,
    );

    await waitFor(() => expect(screen.getByText('const')).toBeOnTheScreen());

    view.rerender(
      <CodeHighlighterRenderer
        Raw={null}
        code={'<script>source</script>\n'}
        language="unknown-language"
        testID="code"
      />,
    );

    expect(screen.getByTestId('code')).toHaveTextContent('<script>source</script>\n', {
      normalizer: (text) => text,
    });

    expect(screen.queryByText('const')).toBeNull();
  });
});
