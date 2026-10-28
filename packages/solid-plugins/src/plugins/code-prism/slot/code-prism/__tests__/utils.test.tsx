import { render, waitFor } from '@solidjs/testing-library';

import { CodePrismRenderer } from '../renderer';
import { highlightCode } from '../renderer/utils';

describe('Prism highlighting', () => {
  test.each([
    [' JS ', 'console.log(window.location);', '.token.method', 'log'],
    ['css', 'a:hover { color: red; }', '.token.pseudo-class', ':hover'],
    [
      'javascript',
      'const view = html`<div class="card">${value}</div>`;',
      '.token.interpolation',
      '${value}',
    ],
  ])(
    'tokenizes %s without inserting source markup',
    async (language, code, selector, expected) => {
      const wrapper = render(() => {
        return <CodePrismRenderer Raw={null} code={code} language={language} />;
      });

      // A cold transform of Prism's language bundle can exceed one second during parallel checks.
      await waitFor(
        () => expect(wrapper.container.querySelector(selector)?.textContent).toContain(expected),
        { timeout: 10_000 },
      );

      expect(wrapper.container.textContent).toBe(code);

      expect(wrapper.container.querySelector('.card')).toBeNull();

      wrapper.unmount();
    },
    15_000,
  );

  test.each([
    'unknown',
    '__proto__',
    'constructor',
    'extend',
    'javascript.keyword',
    '',
    'plaintext',
    ' TXT ',
  ])('falls back for %j', async (language) => {
    await expect(highlightCode('<script>source</script>', language)).resolves.toBeNull();
  });

  test('cancels queued tokenization', async () => {
    const controller = new AbortController();

    const pending = highlightCode('const value = 42;', 'js', controller.signal);

    controller.abort();

    await expect(pending).resolves.toBeNull();
  });
});
