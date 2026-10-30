import { render } from '@testing-library/react';
import { castArray } from 'lodash-es';
import components from 'prismjs/components.json';

import { highlightCode } from '../renderer/utils';

interface LanguageComponent {
  alias?: string | string[];
}

describe('Prism extended languages', () => {
  test('loads every Prism language and alias and their aliases', async () => {
    await highlightCode('const view = <div />;', 'tsx');

    const { default: Prism } = await import('prismjs');

    // These components extend other grammars or install helpers instead of a language.
    const extensions = [
      'meta',
      'css-extras',
      'js-extras',
      'js-templates',
      'markup-templating',
      'php-extras',
      'xml-doc',
    ];

    const languages = Object.entries(components.languages) as [string, LanguageComponent][];

    for (const [id, component] of languages) {
      if (extensions.includes(id)) {
        continue;
      }

      for (const name of [id, ...castArray(component.alias ?? [])]) {
        expect({ name, loaded: Object.hasOwn(Prism.languages, name) }).toEqual({
          name,
          loaded: true,
        });

        expect(typeof Prism.languages[name]).toBe('object');
      }
    }
  });

  test.each([
    {
      language: 'TSX',
      code: 'const Card = () => <div>{answer}</div>;',
      selector: '.token.tag',
      token: '<div>',
    },
    {
      language: 'cpp',
      code: 'int main() { return 42; }',
      selector: '.token.keyword',
      token: 'int',
    },
    {
      language: 'py',
      code: 'def greet(name):\n    return "Hello " + name',
      selector: '.token.keyword',
      token: 'def',
    },
    {
      language: 'yml',
      code: 'enabled: true\nitems:\n  - first',
      selector: '.token.key',
      token: 'enabled',
    },
    {
      language: 'twig',
      code: '<p>{{ user.name }}</p>',
      selector: '.token.language-twig',
      token: '{{ user.name }}',
    },
    {
      language: 'php',
      code: '<p><?php echo $name; ?></p>',
      selector: '.token.language-php .token.keyword',
      token: 'echo',
    },
  ])(
    'renders $language tokens while preserving the source',
    async ({ language, code, selector, token }) => {
      const highlighted = await highlightCode(code, language);

      const { container } = render(<code>{highlighted}</code>);

      expect(container.querySelector(selector)?.textContent).toBe(token);

      expect(container.querySelector('code')?.textContent).toBe(code);

      expect(container.querySelector('div, p')).toBeNull();
    },
  );
});
