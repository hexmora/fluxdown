import type { ParagraphProps } from '@fluxdown/taro-plugins/base';

import { BaseSlotPlugin } from '@fluxdown/taro-plugins/base';
import { PRESET_LITE_PLUGINS } from '@fluxdown/taro-plugins/lite';
import { ParagraphSlotPlugin } from '@fluxdown/taro-plugins/plugins/paragraph';
import { Text } from '@tarojs/components';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';

import type { FluxdownRef } from '../packs/full';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';
import { FluxdownRaw } from '../packs/raw';

const CustomParagraph = ({ children }: ParagraphProps) => {
  return <Text data-testid="custom-paragraph">Custom: {children}</Text>;
};

class CustomParagraphPlugin extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'test-taro-paragraph';

  readonly type = 'Paragraph';

  readonly Component = CustomParagraph;
}

afterEach(async () => {
  cleanup();

  await act(async () => {});
});

describe('Fluxdown Taro', () => {
  test('renders common Markdown with real Taro components', () => {
    const text = [
      '# Heading',
      '',
      'A **strong** and *emphasized* [link](https://example.com) with `code`.',
      '',
      '> quote',
      '',
      '1. first',
      '2. second',
      '',
      '---',
      '',
      '| A | B |',
      '| - | - |',
      '| 1 | 2 |',
    ].join('\n');

    const { container } = render(<Fluxdown text={text} />);

    expect(container.firstElementChild?.tagName).toBe('TARO-VIEW-CORE');

    expect(container.querySelector('[data-tag="h1"]')).toHaveTextContent('Heading');

    expect(container.querySelector('[data-tag="strong"]')?.tagName).toBe('TARO-TEXT-CORE');

    expect(container.querySelector('[data-tag="em"]')).toHaveTextContent('emphasized');

    expect(container.querySelector('taro-navigator-core')).toHaveAttribute(
      'url',
      'https://example.com',
    );

    expect(container.querySelector('[data-tag="code"]')).toHaveTextContent('code');

    expect(container.querySelector('[data-tag="blockquote"]')).toHaveTextContent('quote');

    expect(container.querySelectorAll('[data-tag="li"]')).toHaveLength(2);

    expect(container.querySelector('[data-tag="hr"]')).toBeInTheDocument();

    expect(container.querySelector('[data-tag="table"]')).toHaveTextContent('AB12');
  });

  test('preserves the root while updating container props and text', () => {
    const { container, rerender } = render(
      <Fluxdown className="consumer-root" style={{ color: 'red' }} text="first" />,
    );

    const root = container.firstElementChild;

    expect(root).toHaveClass('fluxdown-taro-root', 'consumer-root');

    expect(root).toHaveStyle({ color: 'rgb(255, 0, 0)' });

    rerender(<Fluxdown className="updated-root" style={{ color: 'blue' }} text="second" />);

    expect(container.firstElementChild).toBe(root);

    expect(root).toHaveClass('updated-root');

    expect(root).not.toHaveClass('consumer-root');

    expect(root).toHaveStyle({ color: 'rgb(0, 0, 255)' });

    expect(root).toHaveTextContent('second');
  });

  test('combines theme tokens with Taro string styles and reacts to theme changes', () => {
    const { container, rerender } = render(
      <Fluxdown style="padding:12px;--fluxdown-taro-colors-accent:purple" text="theme" />,
    );

    const root = container.querySelector<HTMLElement>('.fluxdown-taro-root');

    expect(root).toHaveStyle({ padding: '12px' });

    expect(root?.style.getPropertyValue('--fluxdown-taro-colors-fg')).toBe('#202123');

    expect(root?.style.getPropertyValue('--fluxdown-taro-colors-accent')).toBe('purple');

    rerender(
      <Fluxdown theme={['dark', { tokens: { colors: { accent: '#123456' } } }]} text="theme" />,
    );

    expect(container.firstElementChild).toBe(root);

    expect(root?.style.getPropertyValue('--fluxdown-taro-colors-fg')).toBe('#ececf1');

    expect(root?.style.getPropertyValue('--fluxdown-taro-colors-accent')).toBe('#123456');

    expect(root?.style.padding).toBe('');
  });

  test('keeps Full additions out of Lite and a supplied Raw preset', () => {
    const full = render(<Fluxdown text="Hello :smile:" />);

    const lite = render(<FluxdownLite text="Hello :smile:" />);

    const raw = render(<FluxdownRaw plugins={PRESET_LITE_PLUGINS} text="Hello :smile:" />);

    expect(full.container).toHaveTextContent('Hello 😄');

    expect(lite.container).toHaveTextContent('Hello :smile:');

    expect(raw.container).toHaveTextContent('Hello :smile:');

    expect(raw.container.querySelector('[data-tag="p"]')?.tagName).toBe('TARO-VIEW-CORE');
  });

  test('allows a supplied slot to replace the disabled preset', () => {
    render(
      <Fluxdown
        plugins={{
          slots: [[ParagraphSlotPlugin, { disabled: true }], CustomParagraphPlugin],
        }}
        text="paragraph"
      />,
    );

    expect(screen.getByTestId('custom-paragraph')).toHaveTextContent('Custom: paragraph');

    expect(screen.getByTestId('custom-paragraph').tagName).toBe('TARO-TEXT-CORE');
  });

  test('leaves a single empty Taro root for blank Markdown', () => {
    const { container } = render(<Fluxdown text={'\n \n'} />);

    expect(container.children).toHaveLength(1);

    expect(container.firstElementChild).toBeEmptyDOMElement();
  });

  test('keeps the closure ref stable and destroys it on unmount', async () => {
    const ref = createRef<FluxdownRef>();

    const { container, rerender, unmount } = render(<Fluxdown ref={ref} text="alpha" />);

    const closure = ref.current;

    const first = container.querySelector('[data-tag="p"]');

    expect(closure?.value).toBeDefined();

    rerender(<Fluxdown ref={ref} text={'alpha\n\nbeta'} />);

    await waitFor(() => {
      expect(container).toHaveTextContent('alphabeta');
    });

    expect(ref.current).toBe(closure);

    expect(container.querySelector('[data-tag="p"]')).toBe(first);

    unmount();

    await waitFor(() => {
      expect(closure?.value.closed).toBe(true);
    });
  });
});
