import { SyntaxStrikethroughRemarkPlugin } from '@fluxdown/core-presets/plugins/remark/syntax-strikethrough';
import { CjkPlugin } from '@fluxdown/react-presets/plugins/cjk';
import { render } from '@testing-library/react';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';

describe('CJK presets', () => {
  test('keeps the default lite emphasis and autolink behavior without the plugin', () => {
    const text = '**中文。**后文 https://example.com。结束';
    const { container } = render(<FluxdownLite text={text} />);

    expect(container.querySelector('strong')).toBeNull();
    expect(container.querySelector('a')).toHaveTextContent('https://example.com。结束');
    expect(container.textContent).toBe(text);
  });

  test('restores default lite parsing when the explicitly installed plugin is removed', () => {
    const text = '**中文。**后文 https://example.com。结束';
    const { container, rerender } = render(<FluxdownLite plugins={CjkPlugin} text={text} />);

    expect(container.querySelector('strong')).toHaveTextContent('中文。');
    expect(container.querySelector('a')).toHaveTextContent('https://example.com');

    rerender(<FluxdownLite text={text} />);

    expect(container.querySelector('strong')).toBeNull();
    expect(container.querySelector('a')).toHaveTextContent('https://example.com。结束');
    expect(container.textContent).toBe(text);
  });

  test('combines default CJK parsing with emoji in full', () => {
    const { container } = render(<Fluxdown text="**中文。**后文 :rocket:" />);

    expect(container.querySelector('strong')).toHaveTextContent('中文。');
    expect(container.textContent).toBe('中文。后文 🚀');
  });
});

describe.each([
  { name: 'lite with explicit registration', Component: FluxdownLite, plugins: CjkPlugin },
  { name: 'full with default registration', Component: Fluxdown, plugins: undefined },
])('$name CJK plugin', ({ Component, plugins }) => {
  test('formats CJK emphasis and splits adjacent autolinks when enabled', () => {
    const { container } = render(
      <Component
        plugins={plugins}
        text="**中文。**后文 *日本語。*続き ~~한국어(설명)~~다음 https://example.com；https://test.com。结束"
      />,
    );

    expect(container.querySelector('strong')).toHaveTextContent('中文。');
    expect(container.querySelector('em')).toHaveTextContent('日本語。');
    expect(container.querySelector('del')).toHaveTextContent('한국어(설명)');
    expect([...container.querySelectorAll('a')].map((link) => link.getAttribute('href'))).toEqual([
      'https://example.com',
      'https://test.com',
    ]);
    expect(container.textContent).toBe(
      '中文。后文 日本語。続き 한국어(설명)다음 https://example.com；https://test.com。结束',
    );
  });

  test('preserves the single-tilde setting while enhancing strikethrough', () => {
    const { container } = render(
      <Component
        plugins={[
          ...(plugins ? [plugins] : []),
          { remarks: [[SyntaxStrikethroughRemarkPlugin, { singleTilde: false }]] },
        ]}
        text="~plain~ ~中文。~后文 ~~日本語。~~続き"
      />,
    );

    expect(container.querySelectorAll('del')).toHaveLength(1);
    expect(container.querySelector('del')).toHaveTextContent('日本語。');
    expect(container.textContent).toBe('~plain~ ~中文。~后文 日本語。続き');
  });

  test('keeps disabled strikethrough disabled while enabling CJK emphasis', () => {
    const { container } = render(
      <Component
        plugins={[
          ...(plugins ? [plugins] : []),
          { remarks: [[SyntaxStrikethroughRemarkPlugin, { disabled: true }]] },
        ]}
        text="**中文。**后文 ~~日本語。~~続き"
      />,
    );

    expect(container.querySelector('strong')).toHaveTextContent('中文。');
    expect(container.querySelector('del')).toBeNull();
    expect(container.textContent).toBe('中文。后文 ~~日本語。~~続き');
  });

  test('updates CJK formatting and link boundaries as text streams', () => {
    const streaming = { smooth: false, effect: false };
    const { container, rerender } = render(
      <Component plugins={plugins} streaming={streaming} text="**中文" />,
    );

    expect(container.querySelector('strong')).toHaveTextContent('中文');
    expect(container.textContent).toBe('中文');

    rerender(<Component plugins={plugins} streaming={streaming} text="**中文。" />);

    expect(container.querySelector('strong')).toHaveTextContent('中文。');
    expect(container.textContent).toBe('中文。');

    const prefixes = [
      ['**中文。**后文 https://example.com', '中文。后文 https://example.com'],
      ['**中文。**后文 https://example.com。https://', '中文。后文 https://example.com。https://'],
    ];

    for (const [text, expectedText] of prefixes) {
      rerender(<Component plugins={plugins} streaming={streaming} text={text} />);

      expect(container.querySelector('strong')).toHaveTextContent('中文。');
      expect(container.querySelectorAll('a')).toHaveLength(1);
      expect(container.querySelector('a')).toHaveAttribute('href', 'https://example.com');
      expect(container.textContent).toBe(expectedText);
    }

    const text = '**中文。**后文 https://example.com。https://test.com！结束';

    rerender(<Component plugins={plugins} streaming={streaming} text={text} />);

    expect([...container.querySelectorAll('a')].map((link) => link.getAttribute('href'))).toEqual([
      'https://example.com',
      'https://test.com',
    ]);
    expect(container.textContent).toBe('中文。后文 https://example.com。https://test.com！结束');

    rerender(<Component plugins={plugins} streaming={false} text={text} />);

    expect(container.querySelector('strong')).toHaveTextContent('中文。');
    expect([...container.querySelectorAll('a')].map((link) => link.getAttribute('href'))).toEqual([
      'https://example.com',
      'https://test.com',
    ]);
    expect(container.textContent).toBe('中文。后文 https://example.com。https://test.com！结束');
  });

  test('disables and re-enables CJK parsing through scoped plugin configuration', () => {
    const text = '**中文。**后文 https://example.com。结束';
    const disabled = { ...CjkPlugin, config: { 'remark-cjk': { disabled: true } } };
    const enabled = { ...CjkPlugin, config: { 'remark-cjk': { disabled: false } } };
    const { container, rerender } = render(<Component plugins={plugins} text={text} />);

    expect(container.querySelector('strong')).toHaveTextContent('中文。');

    rerender(<Component plugins={plugins ? [plugins, disabled] : disabled} text={text} />);

    expect(container.querySelector('strong')).toBeNull();
    expect(container.querySelector('a')).toHaveTextContent('https://example.com。结束');
    expect(container.textContent).toBe(text);

    rerender(<Component plugins={[disabled, CjkPlugin]} text={text} />);

    expect(container.querySelector('strong')).toHaveTextContent('中文。');
    expect(container.querySelector('a')).toHaveAttribute('href', 'https://example.com');

    rerender(<Component plugins={enabled} text={text} />);

    expect(container.querySelector('strong')).toHaveTextContent('中文。');
    expect(container.querySelector('a')).toHaveAttribute('href', 'https://example.com');
    expect(container.textContent).toBe('中文。后文 https://example.com。结束');

    rerender(<Component plugins={plugins} text={text} />);

    expect(container.querySelector('strong')).toHaveTextContent('中文。');
    expect(container.querySelector('a')).toHaveAttribute('href', 'https://example.com');
  });
});
