import type {
  ParagraphProps,
  ReactRenderMatchParams,
  ReactRenderParams,
} from '@fluxdown/react-native-plugins/base';
import type { TextStyle } from 'react-native';

import {
  BaseReactRenderPlugin,
  BaseSlotPlugin,
  InheritedText,
} from '@fluxdown/react-native-plugins/base';
import { FallbackPlugin } from '@fluxdown/react-native-plugins/plugins/fallback';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef, memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { FluxdownRef } from '../packs/full';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';
import { FluxdownRaw } from '../packs/raw';

class FramedParagraphPlugin extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'framed-paragraph';

  readonly type = 'Paragraph';

  readonly Component = ({ Raw, ...props }: ParagraphProps) => (
    <View testID="paragraph-frame">{Raw ? <Raw {...props} /> : null}</View>
  );
}

describe('React Native packs', () => {
  test.each([
    { name: 'lite', Component: FluxdownLite },
    { name: 'full', Component: Fluxdown },
  ])('$name renders Markdown with valid native text nesting', async ({ Component }) => {
    await render(
      <Component
        text={
          '# Heading\n\nA **strong** and *quiet* note with `code`.\n\n> A quote.\n\n- First\n  - Nested\n- Second\n\n---\n\n| Name | Value |\n| --- | --- |\n| Native | Ready |'
        }
      />,
    );

    expect(screen.getByRole('header', { name: 'Heading' })).toBeOnTheScreen();

    expect(screen.getByText('strong')).toBeOnTheScreen();

    expect(screen.getByText('Nested')).toBeOnTheScreen();

    expect(screen.getByText('Native')).toBeOnTheScreen();

    expect(screen.getByText('Ready')).toBeOnTheScreen();
  });

  test('removes only the first heading margin and follows native layout changes', async () => {
    await render(<FluxdownLite text={'# First\n\n## Second'} />);

    const first = screen.getByRole('header', { name: 'First' });

    const second = screen.getByRole('header', { name: 'Second' });

    expect(first).toHaveStyle({ marginTop: 32 });

    expect(second).toHaveStyle({ marginTop: 28 });

    await fireEvent.layout(first, { y: 32 });

    expect(first).toHaveStyle({ marginTop: 0 });

    await fireEvent.layout(first, { y: 0 });

    await fireEvent.layout(second, { y: 100 });

    expect(first).toHaveStyle({ marginTop: 0 });

    expect(second).toHaveStyle({ marginTop: 28 });

    await fireEvent.layout(first, { y: 40 });

    expect(first).toHaveStyle({ marginTop: 32 });

    await fireEvent.layout(first, { y: 72 });

    expect(first).toHaveStyle({ marginTop: 32 });
  });

  test('uses simple line breaking at paragraph hosts while allowing an explicit strategy', async () => {
    await render(<FluxdownLite text={'Paragraph **bold** text.\n\n- Inline list'} />);

    expect(screen.getByText('Paragraph bold text.').props.textBreakStrategy).toBe('simple');

    let list = screen.getByText('Inline list');

    while (list.props.textBreakStrategy === undefined && list.parent) {
      list = list.parent;
    }

    expect(list.props.textBreakStrategy).toBe('simple');

    await screen.rerender(
      <InheritedText textBreakStrategy="balanced">
        Custom <InheritedText>paragraph</InheritedText>
      </InheritedText>,
    );

    expect(screen.getByText('Custom paragraph').props.textBreakStrategy).toBe('balanced');
  });

  test('keeps natural word hosts with their trailing whitespace across appended text', async () => {
    const source = '中文  sentence settles 👩‍💻 é क्षि';

    await render(<FluxdownLite text={source} />);

    const sentence = screen.getByText('sentence');

    // Separate native text spans prevent a previous line's fallback-font
    // metrics from leaking into a Latin word when the shaded tail moves on.
    for (const word of ['中文  ', 'sentence ', 'settles ', '👩‍💻 ', 'é ', 'क्षि']) {
      expect(screen.getByText(word.trim()).children).toEqual([word]);
    }

    expect(screen.getByText(source)).toBeOnTheScreen();

    await screen.rerender(<FluxdownLite text={`${source} again`} />);

    expect(screen.getByText('sentence')).toBe(sentence);

    expect(screen.getByText('again').children).toEqual(['again']);

    expect(screen.getByText(`${source} again`)).toBeOnTheScreen();

    expect(screen.queryAllByText(/^\s+$/)).toHaveLength(0);
  });

  test('leaves custom text renderers in control of their text boundaries', async () => {
    class TextRenderPlugin extends BaseReactRenderPlugin {
      static readonly key = 'test-text-boundaries';

      match({ node }: ReactRenderMatchParams) {
        return node.type === 'text';
      }

      render({ node }: ReactRenderParams) {
        return node.type === 'text' ? (
          <Text testID="custom-text" style={{ color: 'red' }}>
            {node.value}
          </Text>
        ) : null;
      }
    }

    await render(
      <FluxdownLite plugins={{ renders: [TextRenderPlugin] }} text="中文 sentence settles" />,
    );

    expect(screen.getByTestId('custom-text').children).toEqual(['中文 sentence settles']);

    expect(screen.getByTestId('custom-text')).toHaveStyle({ color: 'red' });

    expect(screen.queryByText('sentence')).toBeNull();
  });

  test('preserves memoized text descendants for equal styles and updates changed typography', async () => {
    const styles: TextStyle[] = [];

    const Child = memo(function Child() {
      return (
        <InheritedText>
          {(style) => {
            styles.push(style);

            return <Text style={style}>child</Text>;
          }}
        </InheritedText>
      );
    });

    await render(
      <InheritedText style={{ color: 'red', fontSize: 16, fontVariant: ['tabular-nums'] }}>
        <Child />
      </InheritedText>,
    );

    await screen.rerender(
      <InheritedText
        style={{ color: 'red', fontSize: 16, fontVariant: ['tabular-nums'], marginBottom: 12 }}
      >
        <Child />
      </InheritedText>,
    );

    expect(styles).toHaveLength(1);

    await screen.rerender(
      <InheritedText style={{ color: 'blue', fontSize: 20, fontVariant: ['tabular-nums'] }}>
        <Child />
      </InheritedText>,
    );

    expect(styles).toHaveLength(2);

    expect(screen.getByText('child')).toHaveStyle({ color: 'blue', fontSize: 20 });
  });

  test('preserves task state and loose nested list content', async () => {
    await render(
      <FluxdownLite
        text={
          '- [x] Finished\n- [ ] Pending\n\n1. First paragraph.\n\n   A second paragraph.\n\n   - Nested item.'
        }
      />,
    );

    expect(screen.getByRole('checkbox', { checked: true })).toBeOnTheScreen();

    expect(screen.getByRole('checkbox', { checked: false })).toBeOnTheScreen();

    expect(screen.getByText('A second paragraph.')).toBeOnTheScreen();

    expect(screen.getByText('Nested item.')).toBeOnTheScreen();
  });

  test('does not render structural blockquote whitespace as native text', async () => {
    await render(<FluxdownLite text={'> First paragraph.\n>\n> Second paragraph.'} />);

    expect(screen.getByText('First paragraph.')).toBeOnTheScreen();

    expect(screen.getByText('Second paragraph.')).toBeOnTheScreen();

    expect(screen.queryAllByText(/^\s+$/)).toHaveLength(0);
  });

  test('retries an image source after rendering another image', async () => {
    const getSize = jest.spyOn(Image, 'getSize').mockImplementationOnce((_, _success, failure) => {
      failure?.(new Error('Image unavailable'));
    });

    await render(<FluxdownLite text="![First](https://example.com/first.png)" />);

    expect(screen.getByText('First')).toBeOnTheScreen();

    getSize.mockImplementation((_, success) => {
      success?.(200, 100);
    });

    await screen.rerender(<FluxdownLite text="![Second](https://example.com/second.png)" />);

    await screen.rerender(<FluxdownLite text="![First](https://example.com/first.png)" />);

    expect(screen.getByRole('image', { name: 'First' })).toBeOnTheScreen();

    getSize.mockRestore();
  });

  test('raw renders only its supplied plugins', async () => {
    await render(<FluxdownRaw plugins={[]} text="content" />);

    expect(screen.queryByText('content')).toBeNull();

    await screen.rerender(<FluxdownRaw plugins={FallbackPlugin} text="content" />);

    expect(screen.getByText('content')).toBeOnTheScreen();
  });

  test('lite keeps code and math readable without advanced engines', async () => {
    await render(
      <FluxdownLite build={{ tex: true }} text={'```ts\nconst value = 42;\n```\n\n$x + y$'} />,
    );

    expect(screen.getByText('const value = 42;')).toBeOnTheScreen();

    expect(screen.getByText('x + y')).toBeOnTheScreen();
  });

  test('full renders highlighting, formulas, and diagrams in native hosts', async () => {
    const appVersion = Object.getOwnPropertyDescriptor(navigator, 'appVersion');

    const userAgent = Object.getOwnPropertyDescriptor(navigator, 'userAgent');

    await render(
      <Fluxdown
        build={{ tex: true }}
        text={
          '```typescript\nconst answer = 42;\n```\n\n$E=mc^2$ and $y^2$\n\n```mermaid native-diagram\nflowchart LR\nA-->B\n```'
        }
      />,
    );

    expect(await screen.findByText('const answer = 42;')).toBeOnTheScreen();

    const equation = await screen.findByLabelText('E=mc^2');

    expect(equation).toBeOnTheScreen();

    expect(equation.props.width).toBeGreaterThan(50);

    expect(await screen.findByLabelText('y^2')).toBeOnTheScreen();

    expect(await screen.findByLabelText('native-diagram')).toBeOnTheScreen();

    expect(Object.getOwnPropertyDescriptor(navigator, 'appVersion')).toEqual(appVersion);

    expect(Object.getOwnPropertyDescriptor(navigator, 'userAgent')).toEqual(userAgent);
  });

  test('updates themes, style arrays, and slot overrides without replacing the core', async () => {
    const ref = createRef<FluxdownRef>();

    const text = '# Heading\n\nbody';

    await render(<FluxdownLite ref={ref} text={text} />);

    const closure = ref.current;

    await screen.rerender(
      <FluxdownLite
        plugins={{ slots: [FramedParagraphPlugin] }}
        ref={ref}
        style={[{ padding: 4 }, { padding: 20 }]}
        text={text}
        theme={['dark', { tokens: { heading: { h1: { fontSize: 36 } } } }]}
      />,
    );

    expect(ref.current).toBe(closure);

    expect(screen.getByTestId('paragraph-frame')).toBeOnTheScreen();

    expect(screen.getByRole('header', { name: 'Heading' })).toHaveStyle({ fontSize: 36 });

    expect(StyleSheet.flatten(screen.root?.props.style)).toMatchObject({ padding: 20 });

    await screen.rerender(<FluxdownLite ref={ref} text={text} />);

    expect(screen.queryByTestId('paragraph-frame')).toBeNull();

    expect(screen.getByRole('header', { name: 'Heading' })).toHaveStyle({ fontSize: 32 });

    expect(ref.current).toBe(closure);

    await screen.unmount();

    expect(ref.current).toBeNull();
  });
});
