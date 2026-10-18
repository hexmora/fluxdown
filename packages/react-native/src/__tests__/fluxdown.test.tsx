import type {
  IReactRenderPluggable,
  ReactRenderMatchParams,
  ReactRenderParams,
} from '@fluxdown/react-base-presets/base';

import { SyntaxHtmlAllowedRemarkPlugin } from '@fluxdown/core-presets/remark';
import { BaseReactRenderPlugin } from '@fluxdown/react-base-presets/base';
import { PluginPriority } from '@fluxdown/types';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import { createRef, StrictMode } from 'react';
import { StyleSheet, Text } from 'react-native';

import type { FluxdownRef } from '../types';

import { Fluxdown } from '..';
import { Renderer } from '../modules/react-renderer';
import { expectNativeTextContainers, textContent } from './utils/native';

describe('Fluxdown native component', () => {
  test('instantiates the renderer when Hermes hides its constructor source', () => {
    const toString = Function.prototype.toString;

    const spy = jest
      .spyOn(Function.prototype, 'toString')
      .mockImplementation(function (this: unknown) {
        return this === Renderer ? 'function () { [native code] }' : toString.call(this);
      });

    try {
      render(<Fluxdown text="Hermes renderer" />);

      expect(screen.getByText('Hermes renderer')).toBeTruthy();
    } finally {
      spy.mockRestore();
    }
  });

  test('supplies native props to custom render plugins for current and explicit nodes', () => {
    class InspectRenderPlugin extends BaseReactRenderPlugin {
      static readonly key = 'native-inspect-props';

      readonly config = { priority: PluginPriority.Highest };

      match({ node }: ReactRenderMatchParams) {
        return node.type === 'element' && node.tagName === 'p';
      }

      render({ getProps, renderChildren }: ReactRenderParams) {
        return (
          <>
            <Text testID="current" {...getProps()}>
              {renderChildren()}
            </Text>
            <Text
              testID="explicit"
              {...getProps({
                type: 'element',
                tagName: 'span',
                properties: { id: 'explicit-id', ariaLabel: 'Explicit label', className: ['web'] },
                children: [],
              })}
            >
              explicit
            </Text>
          </>
        );
      }
    }

    render(
      <Fluxdown
        text={'<p id="current-id">mapped</p>'}
        plugins={[
          {
            remarks: [[SyntaxHtmlAllowedRemarkPlugin, { enabledTags: ['p'] }]],
            renders: [InspectRenderPlugin],
          },
        ]}
      />,
    );

    expect(screen.getByTestId('current')).toHaveProp('nativeID', 'user-content-current-id');

    expect(screen.getByTestId('explicit')).toHaveProp('nativeID', 'explicit-id');

    expect(screen.getByTestId('explicit')).toHaveProp('accessibilityLabel', 'Explicit label');

    expect(screen.getByTestId('explicit')).not.toHaveProp('className');
  });

  test('renders common Markdown with native text containers', () => {
    const text = [
      '# Heading',
      '',
      'A **strong** and *emphasized* [link](https://example.com) with `code`.',
      '',
      '> quote',
      '',
      '1. first',
      '2. second',
      '   - nested',
      '',
      '---',
      '',
      '```ts',
      'const answer = 42;',
      '```',
      '',
      '| A | B |',
      '| - | - |',
      '| 1 | 2 |',
    ].join('\n');

    const view = render(<Fluxdown text={text} />);

    expect(screen.getByRole('header', { name: 'Heading' })).toBeTruthy();

    expect(screen.getByRole('link', { name: 'link' })).toBeTruthy();

    const content = textContent(view.toJSON());

    expect(content).toContain('A strong and emphasized link with code.');

    expect(content).toContain('quote');

    expect(content).toContain('nested');

    expect(content).toContain('const answer = 42;');

    expect(content).toContain('AB12');

    expectNativeTextContainers(view.toJSON());
  });

  test('forwards native view props and style arrays, updating the same root', () => {
    const styles = StyleSheet.create({ root: { padding: 12 } });

    const firstLayout = jest.fn();

    const nextLayout = jest.fn();

    const view = render(
      <Fluxdown
        text="hello"
        testID="markdown"
        accessibilityLabel="Markdown content"
        onLayout={firstLayout}
        style={[styles.root, false, { backgroundColor: 'red' }]}
      />,
    );

    const root = screen.getByTestId('markdown');

    expect(root.props.accessibilityLabel).toBe('Markdown content');

    expect(root.props.onLayout).toBe(firstLayout);

    expect(StyleSheet.flatten(root.props.style)).toEqual({ padding: 12, backgroundColor: 'red' });

    view.rerender(
      <Fluxdown
        text="hello"
        testID="updated-markdown"
        onLayout={nextLayout}
        style={[styles.root, { backgroundColor: 'blue' }]}
      />,
    );

    expect(screen.getByTestId('updated-markdown')).toBe(root);

    expect(root.props.onLayout).toBe(nextLayout);

    expect(StyleSheet.flatten(root.props.style)).toEqual({ padding: 12, backgroundColor: 'blue' });
  });

  test('renders images, hard breaks, and readable Tex with native elements', () => {
    const view = render(
      <Fluxdown
        build={{ tex: true }}
        text={'![diagram](https://example.com/diagram.png)\n\nfirst  \nsecond\n\n$x+y$'}
      />,
    );

    const image = screen.getByRole('image', { name: 'diagram' });

    expect(image.props.source).toEqual({ uri: 'https://example.com/diagram.png' });

    expect(textContent(view.toJSON())).toContain('first\nsecond');

    expect(textContent(view.toJSON())).toContain('x+y');

    expectNativeTextContainers(view.toJSON());
  });

  test('keeps an empty native root for blank Markdown', () => {
    const view = render(<Fluxdown testID="root" text={'\n \n'} />);

    expect(view.toJSON()).toEqual(
      expect.objectContaining({
        type: 'View',
        props: expect.objectContaining({ testID: 'root' }),
        children: null,
      }),
    );
  });

  test('lets a custom render plugin run before the fallback renderer', () => {
    class CustomTextRenderPlugin {
      static readonly key = 'native-custom-text';

      readonly config = { priority: PluginPriority.Lowest };

      match({
        node,
      }: {
        node: {
          type: string;

          value?: string;
        };
      }) {
        return node.type === 'text' && node.value === 'custom-token';
      }

      render() {
        return <Text testID="custom-render">custom output</Text>;
      }

      destroy() {}
    }

    render(
      <Fluxdown
        text="custom-token"
        plugins={[{ renders: [CustomTextRenderPlugin as IReactRenderPluggable] }]}
      />,
    );

    expect(screen.getByTestId('custom-render')).toHaveTextContent('custom output');
  });

  test('keeps the core and completed native blocks stable as text grows', async () => {
    const ref = createRef<FluxdownRef>();

    const view = render(<Fluxdown ref={ref} text="alpha" />);

    const core = ref.current;

    const block = screen.getByText('alpha');

    view.rerender(<Fluxdown ref={ref} text={'alpha\n\nbeta'} />);

    await waitFor(() => expect(screen.getByText('beta')).toBeTruthy());

    expect(ref.current).toBe(core);

    expect(screen.getByText('alpha')).toBe(block);

    const growing = screen.getByText('beta');

    view.rerender(<Fluxdown ref={ref} text={'alpha\n\nbeta grows'} />);

    expect(screen.getByText('beta grows')).toBe(growing);

    const destroy = jest.spyOn(core!, 'destroy');

    view.unmount();

    await act(async () => {});

    expect(destroy).toHaveBeenCalledTimes(1);

    expect(core?.value.closed).toBe(true);
  });

  test('updates refs when memoized props stay equal', () => {
    const first = createRef<FluxdownRef>();

    const second = createRef<FluxdownRef>();

    const view = render(<Fluxdown ref={first} text="stable" />);

    const core = first.current;

    view.rerender(<Fluxdown ref={second} text="stable" />);

    expect(first.current).toBeNull();

    expect(second.current).toBe(core);
  });

  test('survives StrictMode effect replay and destroys the committed core once', async () => {
    const ref = createRef<FluxdownRef>();

    const view = render(
      <StrictMode>
        <Fluxdown ref={ref} text="strict-alpha" />
      </StrictMode>,
    );

    const core = ref.current;

    const destroy = jest.spyOn(core!, 'destroy');

    view.rerender(
      <StrictMode>
        <Fluxdown ref={ref} text="strict-beta" />
      </StrictMode>,
    );

    expect(screen.getByText('strict-beta')).toBeTruthy();

    expect(ref.current).toBe(core);

    expect(core?.value.closed).toBe(false);

    view.unmount();

    await act(async () => {});

    expect(destroy).toHaveBeenCalledTimes(1);
  });
});
