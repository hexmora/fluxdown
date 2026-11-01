import { TestBed } from '@angular/core/testing';
import { AngularDomRenderer, RenderContext } from '@fluxdown/angular-plugins/base';

import { highlightCode } from '../renderer/utils';

afterEach(() => TestBed.resetTestingModule());

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

    TestBed.configureTestingModule({ providers: [RenderContext, AngularDomRenderer] });

    const host = document.createElement('code');

    const range = TestBed.inject(AngularDomRenderer).createRange(host);

    range.update(tokens);

    expect(host.querySelector(selector)?.textContent).toContain(expected);

    expect(host.textContent).toBe(code);

    expect(host.querySelector('.card')).toBeNull();

    range.destroy();
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
