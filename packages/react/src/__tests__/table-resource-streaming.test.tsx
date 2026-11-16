import { act, cleanup, render } from '@testing-library/react';

import { Fluxdown } from '../packs/full';

const build = { tex: true, footnote: true, indentedCode: true, setextHeading: true };

const streaming = { smooth: false, repairEnding: true, effect: false };

type Segment = { raw: string; hidden?: boolean; text?: string };

const delivered = (segments: Segment[], length: number): string => {
  let remaining = length;

  let result = '';

  for (const segment of segments) {
    if (remaining <= 0) {
      break;
    }

    const count = Math.min(remaining, segment.raw.length);

    if (!segment.hidden) {
      if (segment.text === undefined) {
        result += segment.raw.slice(0, count);
      } else if (count === segment.raw.length) {
        result += segment.text;
      }
    }

    remaining -= count;
  }

  return result.replace(/\s/g, '');
};

afterEach(async () => {
  cleanup();

  await act(async () => {});
});

test.each([
  {
    name: 'demo 31: code, escaped pipes and a link',
    source: [
      '| 名称 | 示例 | 备注 |',
      '| --- | --- | --- |',
      '| **关键项** | `a * b` | 转义管道 \\| 保留 |',
      '| 普通项 | [文档](https://example.test) | 内容完成 |',
      '',
      '这一例同时观察表格尾格里的未闭合代码；最终所有代码与链接都会完整闭合。',
    ].join('\n'),
    cells: [
      {
        row: 0,
        column: 0,
        tag: 'strong',
        segments: [{ raw: '**', hidden: true }, { raw: '关键项' }, { raw: '**', hidden: true }],
      },
      {
        row: 0,
        column: 1,
        tag: 'code',
        segments: [{ raw: '`', hidden: true }, { raw: 'a * b' }, { raw: '`', hidden: true }],
      },
      {
        row: 0,
        column: 2,
        tag: '',
        segments: [{ raw: '转义管道 ' }, { raw: '\\|', text: '|' }, { raw: ' 保留' }],
      },
      {
        row: 1,
        column: 1,
        tag: 'a',
        segments: [
          { raw: '[', hidden: true },
          { raw: '文档' },
          { raw: '](https://example.test)', hidden: true },
        ],
      },
    ],
  },
  {
    name: 'demo 57: outer formatting around nested code and links',
    source: [
      '| 内容 | 对照 |',
      '| --- | --- |',
      '| **粗体与 `code`** | 普通文本 |',
      '| *斜体与 **粗体*** | [文档](https://example.test "说明") |',
      '| ~~删除线与 `code`~~ | 完成 |',
    ].join('\n'),
    cells: [
      {
        row: 0,
        column: 0,
        tag: 'strong',
        segments: [
          { raw: '**', hidden: true },
          { raw: '粗体与 ' },
          { raw: '`', hidden: true },
          { raw: 'code' },
          { raw: '`**', hidden: true },
        ],
      },
      {
        row: 1,
        column: 0,
        tag: 'em',
        segments: [
          { raw: '*', hidden: true },
          { raw: '斜体与 ' },
          { raw: '**', hidden: true },
          { raw: '粗体' },
          { raw: '***', hidden: true },
        ],
      },
      {
        row: 1,
        column: 1,
        tag: 'a',
        segments: [
          { raw: '[', hidden: true },
          { raw: '文档' },
          { raw: '](https://example.test "说明")', hidden: true },
        ],
      },
      {
        row: 2,
        column: 0,
        tag: 'del',
        segments: [
          { raw: '~~', hidden: true },
          { raw: '删除线与 ' },
          { raw: '`', hidden: true },
          { raw: 'code' },
          { raw: '`~~', hidden: true },
        ],
      },
    ],
  },
])('preserves each visible cell through every Unicode prefix of $name', (sample) => {
  const view = render(<Fluxdown build={build} streaming={streaming} text="" />);

  let source = '';

  for (const character of sample.source) {
    source += character;

    view.rerender(<Fluxdown build={build} streaming={streaming} text={source} />);

    for (const target of sample.cells) {
      const markup = target.segments.map((segment) => segment.raw).join('');

      const expected = delivered(target.segments, source.length - sample.source.indexOf(markup));

      const cell = view.container.querySelectorAll('tbody tr')[target.row]?.children[target.column];

      expect({ source, cell: cell?.textContent?.replace(/\s/g, '') ?? '' }).toEqual({
        source,
        cell: expected,
      });

      if (expected && target.tag) {
        expect({
          source,
          formatted: cell?.querySelector(target.tag)?.textContent?.replace(/\s/g, ''),
        }).toEqual({
          source,
          formatted: expected,
        });
      }
    }
  }

  view.rerender(<Fluxdown build={build} streaming={false} text={source} />);

  for (const target of sample.cells) {
    const cell = view.container.querySelectorAll('tbody tr')[target.row]?.children[target.column];

    expect(cell?.textContent?.replace(/\s/g, '')).toBe(delivered(target.segments, Infinity));
  }
});

test('restores an incomplete table link when ending repair or streaming stops', () => {
  const value = '[文档](https://example.test';

  const source = '| Value |\n| --- |\n| ' + value;

  const view = render(<Fluxdown build={build} streaming={streaming} text={source} />);

  expect(view.container.querySelector('td a')).toHaveTextContent('文档');

  view.rerender(
    <Fluxdown build={build} streaming={{ ...streaming, repairEnding: false }} text={source} />,
  );

  expect(view.container.querySelector('td')?.textContent).toBe(value);

  view.rerender(<Fluxdown build={build} streaming={streaming} text={source} />);

  expect(view.container.querySelector('td a')).toHaveTextContent('文档');

  view.rerender(<Fluxdown build={build} streaming={false} text={source} />);

  expect(view.container.querySelector('td')?.textContent).toBe(value);
});
