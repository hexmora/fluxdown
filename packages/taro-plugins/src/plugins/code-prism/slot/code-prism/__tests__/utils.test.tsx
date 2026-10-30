import { render } from '@testing-library/react';

import { highlightCode } from '../renderer/utils';

describe('Prism highlighting runtime', () => {
  test('applies JavaScript extras on the first highlight without another language loading them', async () => {
    const code = 'console.log(window.location);';

    const highlighted = await highlightCode(code, ' JS ');

    const { container } = render(<code>{highlighted}</code>);

    expect(container.querySelector('.token.method')).toHaveTextContent('log');

    expect(container.querySelector('.token.dom')).toHaveTextContent('window');

    expect(container.querySelector('code')?.textContent).toBe(code);
  });

  test('applies CSS extras to selectors and colors', async () => {
    const code = 'a:hover { color: red; }';

    const highlighted = await highlightCode(code, 'css');

    const { container } = render(<code>{highlighted}</code>);

    expect(container.querySelector('.token.pseudo-class')).toHaveTextContent(':hover');

    expect(container.querySelector('.token.color')).toHaveTextContent('red');

    expect(container.querySelector('code')?.textContent).toBe(code);
  });

  test('runs template hooks while preserving markup and interpolations as source text', async () => {
    const code = 'const view = html`<div class="card">${value}</div>`;';

    const highlighted = await highlightCode(code, 'javascript');

    const { container } = render(<code>{highlighted}</code>);

    expect(container.querySelector('.token.language-html .token.tag')).toHaveTextContent(
      '<div class="card">',
    );

    expect(container.querySelector('.token.interpolation')).toHaveTextContent('${value}');

    expect(container.querySelector('code')?.textContent).toBe(code);

    expect(container.querySelector('.card')).toBeNull();
  });

  test('returns plaintext for requests cancelled before starting or before tokenizing', async () => {
    await expect(highlightCode('const source = 42;', 'js', () => true)).resolves.toBeNull();

    let cancelled = false;

    const pending = highlightCode('const source = 42;', 'js', () => cancelled);

    cancelled = true;

    await expect(pending).resolves.toBeNull();
  });

  test.each([
    'unknown',
    '__proto__',
    'constructor',
    'extend',
    'javascript.keyword',
    'javascript[keyword]',
    '',
    'plaintext',
    ' TXT ',
  ])(
    'returns plaintext for %j without treating inherited values or helpers as grammars',
    async (language) => {
      await expect(highlightCode('<script>source</script>', language)).resolves.toBeNull();
    },
  );
});
