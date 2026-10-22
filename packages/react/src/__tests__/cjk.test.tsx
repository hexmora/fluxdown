import { SyntaxStrikethroughRemarkPlugin } from '@fluxdown/core-presets/remark';
import { CjkPlugin } from '@fluxdown/react-presets/plugins/cjk';
import { render } from '@testing-library/react';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';

describe.each([
  { name: 'lite', Component: FluxdownLite },
  { name: 'full', Component: Fluxdown },
])('$name CJK plugin', ({ Component }) => {
  test('keeps the default emphasis and autolink behavior without the plugin', () => {
    const text = '**中文。**后文 https://example.com。结束';
    const { container } = render(<Component text={text} />);

    expect(container.querySelector('strong')).toBeNull();
    expect(container.querySelector('a')).toHaveTextContent('https://example.com。结束');
    expect(container.textContent).toBe(text);
  });

  test('formats CJK emphasis and splits adjacent autolinks when enabled', () => {
    const { container } = render(
      <Component
        plugins={CjkPlugin}
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
          CjkPlugin,
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
        plugins={[CjkPlugin, { remarks: [[SyntaxStrikethroughRemarkPlugin, { disabled: true }]] }]}
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
      <Component plugins={CjkPlugin} streaming={streaming} text="**中文" />,
    );

    expect(container.querySelector('strong')).toHaveTextContent('中文');
    expect(container.textContent).toBe('中文');

    rerender(<Component plugins={CjkPlugin} streaming={streaming} text="**中文。" />);

    expect(container.querySelector('strong')).toHaveTextContent('中文。');
    expect(container.textContent).toBe('中文。');

    const prefixes = [
      ['**中文。**后文 https://example.com', '中文。后文 https://example.com'],
      ['**中文。**后文 https://example.com。https://', '中文。后文 https://example.com。https://'],
    ];

    for (const [text, expectedText] of prefixes) {
      rerender(<Component plugins={CjkPlugin} streaming={streaming} text={text} />);

      expect(container.querySelector('strong')).toHaveTextContent('中文。');
      expect(container.querySelectorAll('a')).toHaveLength(1);
      expect(container.querySelector('a')).toHaveAttribute('href', 'https://example.com');
      expect(container.textContent).toBe(expectedText);
    }

    const text = '**中文。**后文 https://example.com。https://test.com！结束';

    rerender(<Component plugins={CjkPlugin} streaming={streaming} text={text} />);

    expect([...container.querySelectorAll('a')].map((link) => link.getAttribute('href'))).toEqual([
      'https://example.com',
      'https://test.com',
    ]);
    expect(container.textContent).toBe('中文。后文 https://example.com。https://test.com！结束');

    rerender(<Component plugins={CjkPlugin} streaming={false} text={text} />);

    expect(container.querySelector('strong')).toHaveTextContent('中文。');
    expect([...container.querySelectorAll('a')].map((link) => link.getAttribute('href'))).toEqual([
      'https://example.com',
      'https://test.com',
    ]);
    expect(container.textContent).toBe('中文。后文 https://example.com。https://test.com！结束');
  });

  test('restores default parsing when the plugin is removed', () => {
    const text = '**中文。**后文 https://example.com。结束';
    const { container, rerender } = render(<Component plugins={CjkPlugin} text={text} />);

    expect(container.querySelector('strong')).toHaveTextContent('中文。');
    expect(container.querySelector('a')).toHaveTextContent('https://example.com');

    rerender(<Component text={text} />);

    expect(container.querySelector('strong')).toBeNull();
    expect(container.querySelector('a')).toHaveTextContent('https://example.com。结束');
    expect(container.textContent).toBe(text);
  });

  test('disables and re-enables CJK parsing through plugin configuration', () => {
    const text = '**中文。**后文 https://example.com。结束';
    const { container, rerender } = render(<Component plugins={CjkPlugin} text={text} />);

    expect(container.querySelector('strong')).toHaveTextContent('中文。');

    rerender(
      <Component
        plugins={{ ...CjkPlugin, config: { 'remark-cjk': { disabled: true } } }}
        text={text}
      />,
    );

    expect(container.querySelector('strong')).toBeNull();
    expect(container.querySelector('a')).toHaveTextContent('https://example.com。结束');
    expect(container.textContent).toBe(text);

    rerender(<Component plugins={CjkPlugin} text={text} />);

    expect(container.querySelector('strong')).toHaveTextContent('中文。');
    expect(container.querySelector('a')).toHaveAttribute('href', 'https://example.com');
    expect(container.textContent).toBe('中文。后文 https://example.com。结束');
  });
});
