import { PluginPriority } from '@fluxdown/types';
import { sortBy } from 'lodash-es';

import { EmojiRemarkPlugin } from '../emoji';
import { SyntaxMathRemarkPlugin } from '../syntax-math';
import { collectTextValues, parseMarkdown, stripPositions, walkMdast } from './utils';

describe('EmojiRemarkPlugin', () => {
  test('converts GitHub shortcodes and aliases, including adjacent emoji', () => {
    const tree = parseMarkdown(':rocket: :white_check_mark: :x: :warning: :memo: :+1::-1:', [
      new EmojiRemarkPlugin(),
    ]);

    expect(collectTextValues(tree).join('')).toBe('🚀 ✅ ❌ ⚠️ 📝 👍👎');
  });

  test('preserves unknown names and incomplete shortcodes', () => {
    const tree = parseMarkdown(':not_a_gemoji: :ROCKET: :rocket', [new EmojiRemarkPlugin()]);

    expect(collectTextValues(tree).join('')).toBe(':not_a_gemoji: :ROCKET: :rocket');
  });

  test('leaves inline and fenced code unchanged', () => {
    const text = [':rocket: `:rocket:`', '', '```text', ':white_check_mark:', '```'].join('\n');
    const tree = parseMarkdown(text, [new EmojiRemarkPlugin()]);

    expect(stripPositions(tree)).toMatchObject({
      children: [
        {
          type: 'paragraph',
          children: expect.arrayContaining([{ type: 'inlineCode', value: ':rocket:' }]),
        },
        { type: 'code', lang: 'text', value: ':white_check_mark:' },
      ],
    });

    expect(collectTextValues(tree).join('')).toBe('🚀 ');
  });

  test('converts link labels without rewriting destinations, titles, or image alt text', () => {
    const tree = parseMarkdown(
      '[:rocket:](https://example.com/:rocket: ":memo:") ![:rocket:](https://example.com/:rocket:.png)',
      [new EmojiRemarkPlugin()],
    );

    expect(stripPositions(tree)).toMatchObject({
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: 'https://example.com/:rocket:',
              title: ':memo:',
              children: [{ type: 'text', value: '🚀' }],
            },
            { type: 'text', value: ' ' },
            {
              type: 'image',
              url: 'https://example.com/:rocket:.png',
              alt: ':rocket:',
            },
          ],
        },
      ],
    });
  });

  test.each([
    {
      name: 'closed Pandoc expressions',
      source: String.raw`:rocket: \(x\) \(:rocket:\)`,
      repairEnding: false,
      expected: ['x', ':rocket:'],
    },
    {
      name: 'an incomplete Pandoc expression',
      source: String.raw`:rocket: \(:rocket:`,
      repairEnding: true,
      expected: [':rocket:'],
    },
    {
      name: 'an incomplete dollar expression',
      source: ':rocket: $:rocket:',
      repairEnding: true,
      expected: [':rocket:'],
    },
  ])(
    'preserves math parsing and shortcode source in $name',
    ({ source, repairEnding, expected }) => {
      const plugins = sortBy(
        [new EmojiRemarkPlugin(), new SyntaxMathRemarkPlugin({ repairEnding })],
        (plugin) => plugin.config.priority ?? PluginPriority.Default,
      );
      const tree = parseMarkdown(source, plugins);
      const math: string[] = [];

      walkMdast(tree, (node) => {
        if (node.type === 'inlineMath' || node.type === 'math') {
          math.push(node.value);
        }
      });

      expect(math).toEqual(expected);
      expect(collectTextValues(tree).join('')).toContain('🚀');
      expect(collectTextValues(tree).join('')).not.toContain(':rocket:');
    },
  );
});
