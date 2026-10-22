import { EmojiPlugin, EmojiRemarkPlugin } from '@fluxdown/react-presets/plugins/emoji';
import { FallbackPlugin } from '@fluxdown/react-presets/plugins/fallback';
import { render } from '@testing-library/react';

import type { IPluginItem } from '../packs/full';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';
import { FluxdownRaw } from '../packs/raw';

describe('EmojiPlugin', () => {
  test.each([
    { name: 'raw', Component: FluxdownRaw },
    { name: 'lite', Component: FluxdownLite },
  ])('requires explicit installation in $name and supports removal', ({ Component }) => {
    const text = ':rocket:';
    const { container, rerender } = render(<Component plugins={FallbackPlugin} text={text} />);

    expect(container.querySelector('p')).toHaveTextContent(':rocket:');

    rerender(<Component plugins={[EmojiPlugin, FallbackPlugin]} text={text} />);

    expect(container.querySelector('p')).toHaveTextContent('🚀');

    rerender(<Component plugins={FallbackPlugin} text={text} />);

    expect(container.querySelector('p')).toHaveTextContent(':rocket:');
  });

  test('keeps adjacent Pandoc math and shortcodes inside formulas intact in the lite pack', () => {
    const { container } = render(
      <FluxdownLite
        plugins={EmojiPlugin}
        build={{ tex: true }}
        text={String.raw`:rocket: \(x\) \(:rocket:\)`}
      />,
    );
    const formulas = container.querySelectorAll('[data-mode="inline"]');

    expect(Array.from(formulas, (formula) => formula.textContent)).toEqual(['x', ':rocket:']);
    expect(container.textContent).toBe('🚀 x :rocket:');
  });

  test.each([
    { name: 'Pandoc', open: String.raw`\(`, close: String.raw`\)` },
    { name: 'dollar', open: '$', close: '$' },
  ])('preserves shortcodes inside repaired $name math during streaming', ({ open, close }) => {
    const build = { tex: true };
    const streaming = { smooth: false, effect: false };
    const { container, rerender } = render(
      <FluxdownLite
        plugins={EmojiPlugin}
        build={build}
        streaming={streaming}
        text={`:rocket: ${open}:rock`}
      />,
    );

    expect(container.querySelector('[data-mode="inline"]')).toHaveTextContent(':rock');
    expect(container.textContent).toBe('🚀 :rock');

    rerender(
      <FluxdownLite
        plugins={EmojiPlugin}
        build={build}
        streaming={streaming}
        text={`:rocket: ${open}:rocket:`}
      />,
    );

    expect(container.querySelector('[data-mode="inline"]')).toHaveTextContent(':rocket:');
    expect(container.textContent).toBe('🚀 :rocket:');

    rerender(
      <FluxdownLite
        plugins={EmojiPlugin}
        build={build}
        streaming={streaming}
        text={`:rocket: ${open}:rocket:${close}`}
      />,
    );

    expect(container.querySelector('[data-mode="inline"]')).toHaveTextContent(':rocket:');
    expect(container.textContent).toBe('🚀 :rocket:');

    rerender(
      <FluxdownLite
        plugins={EmojiPlugin}
        build={build}
        streaming={false}
        text={`:rocket: ${open}:rocket:${close}`}
      />,
    );

    expect(container.querySelector('[data-mode="inline"]')).toHaveTextContent(':rocket:');
    expect(container.textContent).toBe('🚀 :rocket:');
  });

  describe.each([
    { name: 'lite with EmojiPlugin', Component: FluxdownLite, plugins: [EmojiPlugin] },
    { name: 'full', Component: Fluxdown, plugins: [] },
  ])('$name', ({ Component, plugins }) => {
    test('renders emoji in prose and link labels while preserving code and URLs', () => {
      const text = [
        '**:rocket:** [:white_check_mark:](https://example.com/:rocket:) :not_a_gemoji:',
        '',
        '`:rocket:`',
        '',
        '```text',
        ':white_check_mark:',
        '```',
      ].join('\n');
      const { container } = render(<Component plugins={plugins} text={text} />);
      const link = container.querySelector('a');

      expect(container.querySelector('strong')).toHaveTextContent('🚀');
      expect(link).toHaveTextContent('✅');
      expect(link).toHaveAttribute('href', 'https://example.com/:rocket:');
      expect(container.querySelector('p')).toHaveTextContent(':not_a_gemoji:');
      expect(container.querySelector('p code')).toHaveTextContent(':rocket:');
      expect(container.querySelector('pre code')).toHaveTextContent(':white_check_mark:');
    });

    test('recompiles existing text when tuple and scoped configuration disable or restore emoji', () => {
      const text = ':rocket:';
      const disabled: IPluginItem = { remarks: [[EmojiRemarkPlugin, { disabled: true }]] };
      const { container, rerender } = render(<Component plugins={plugins} text={text} />);

      expect(container.querySelector('p')).toHaveTextContent('🚀');

      rerender(<Component plugins={[...plugins, disabled]} text={text} />);

      expect(container.querySelector('p')).toHaveTextContent(':rocket:');

      rerender(<Component plugins={[disabled, EmojiPlugin]} text={text} />);

      expect(container.querySelector('p')).toHaveTextContent('🚀');

      const configured = { ...EmojiPlugin, config: { 'remark-emoji': { disabled: true } } };

      rerender(<Component plugins={[...plugins, configured]} text={text} />);

      expect(container.querySelector('p')).toHaveTextContent(':rocket:');

      rerender(<Component plugins={[configured, EmojiPlugin]} text={text} />);

      expect(container.querySelector('p')).toHaveTextContent('🚀');

      rerender(
        <Component
          plugins={{ ...EmojiPlugin, config: { 'remark-emoji': { disabled: false } } }}
          text={text}
        />,
      );

      expect(container.querySelector('p')).toHaveTextContent('🚀');

      rerender(<Component plugins={plugins} text={text} />);

      expect(container.querySelector('p')).toHaveTextContent('🚀');
    });

    test('converts a shortcode only when its closing colon arrives during streaming', () => {
      const streaming = { smooth: false, effect: false };
      const { container, rerender } = render(
        <Component plugins={plugins} streaming={streaming} text="Launch :" />,
      );

      expect(container.textContent).toBe('Launch :');

      rerender(<Component plugins={plugins} streaming={streaming} text="Launch :rock" />);

      expect(container.textContent).toBe('Launch :rock');

      rerender(<Component plugins={plugins} streaming={streaming} text="Launch :rocket" />);

      expect(container.textContent).toBe('Launch :rocket');

      rerender(<Component plugins={plugins} streaming={streaming} text="Launch :rocket:" />);

      expect(container.textContent).toBe('Launch 🚀');

      rerender(<Component plugins={plugins} streaming={streaming} text="Launch :rocket::+1:" />);

      expect(container.textContent).toBe('Launch 🚀👍');

      rerender(<Component plugins={plugins} streaming={false} text="Launch :rocket::+1:" />);

      expect(container.textContent).toBe('Launch 🚀👍');
    });
  });
});
