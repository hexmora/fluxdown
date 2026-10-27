import { mount } from '@vue/test-utils';

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
  ])('tokenizes %s without inserting source markup', async (language, code, selector, expected) => {
    const tokens = await highlightCode(code, language);

    const wrapper = mount(() => {
      return <code>{tokens}</code>;
    });

    expect(wrapper.get(selector).text()).toContain(expected);

    expect(wrapper.text()).toBe(code);

    expect(wrapper.find('.card').exists()).toBe(false);

    wrapper.unmount();
  });

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
