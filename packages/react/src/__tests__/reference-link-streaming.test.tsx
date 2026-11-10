import { act, cleanup, render } from '@testing-library/react';

import { Fluxdown } from '../packs/full';

const build = { tex: true, footnote: true, indentedCode: true, setextHeading: true };

const streaming = { smooth: false, repairEnding: true, effect: false };

const compact = (value: string | null | undefined) => value?.replace(/\s/g, '') ?? '';

afterEach(async () => {
  cleanup();

  await act(async () => {});
});

describe('Fluxdown reference links across streamed blocks', () => {
  test('keeps both demo labels linked through every character of the late definition and title', () => {
    const segments = [
      { source: '先阅读 ' },
      { source: '[', hidden: true },
      { source: '安装手册', link: true },
      { source: '][manual]', hidden: true },
      { source: '，再查看 ' },
      { source: '[', hidden: true },
      { source: 'manual', link: true },
      { source: '][]', hidden: true },
      { source: '。定义尚未输入时先观察文字，随后补全地址。' },
      { source: '\n\n[manual]: https://example.test/manual "安装手册"\n\n', hidden: true },
      { source: '定义完成后，两处引用都应成为指向同一地址的链接。' },
    ];

    const view = render(<Fluxdown build={build} streaming={streaming} text="" />);

    const labels: string[] = [];

    let source = '';

    let expected = '';

    for (const segment of segments) {
      if (segment.link) {
        labels.push('');
      }

      for (const character of segment.source) {
        source += character;

        if (!segment.hidden) {
          expected += character;
        }

        if (segment.link) {
          labels[labels.length - 1] += character;
        }

        view.rerender(<Fluxdown build={build} streaming={streaming} text={source} />);

        expect({ source, text: compact(view.container.textContent) }).toEqual({
          source,
          text: compact(expected),
        });

        expect({
          source,
          labels: [...view.container.querySelectorAll('a')].map((link) => link.textContent),
        }).toEqual({ source, labels: labels.filter(Boolean) });
      }
    }

    view.rerender(<Fluxdown build={build} streaming={false} text={source} />);

    expect(compact(view.container.textContent)).toBe(compact(expected));

    for (const link of view.container.querySelectorAll('a')) {
      expect(link).toHaveAttribute('href', 'https://example.test/manual');

      expect(link).toHaveAttribute('title', '安装手册');
    }
  });

  test.each([
    {
      reference: '[first🚀][manual] and [manual][].',
      continuation: '\n\nOrdinary paragraph.\n\n[manual]: /manual "Title 🚀"',
      expected: 'first🚀 and manual.Ordinary paragraph.',
      labels: ['first🚀', 'manual'],
    },
    {
      reference: '[first🚀][Σ]',
      continuation: '\n\n[σ]: /manual "Title 🚀"',
      expected: 'first🚀',
      labels: ['first🚀'],
    },
    {
      reference: '[first🚀][multi line]',
      continuation: '\n\n[multi\nline]: /manual "Title 🚀"',
      expected: 'first🚀',
      labels: ['first🚀'],
    },
    {
      reference: '> [first🚀][manual]',
      continuation: '\n>\n> [manual]: /manual "Title 🚀"',
      expected: 'first🚀',
      labels: ['first🚀'],
    },
    {
      reference: '- [first🚀][manual]',
      continuation: '\n\n  [manual]: /manual "Title 🚀"',
      expected: 'first🚀',
      labels: ['first🚀'],
    },
  ])('keeps earlier references linked across chunks: $reference', (sample) => {
    const view = render(<Fluxdown build={build} streaming={streaming} text={sample.reference} />);

    let source = sample.reference;

    for (const character of sample.continuation) {
      source += character;

      view.rerender(<Fluxdown build={build} streaming={streaming} text={source} />);

      expect({
        source,
        labels: [...view.container.querySelectorAll('a')].map((link) => link.textContent),
      }).toEqual({ source, labels: sample.labels });
    }

    expect(compact(view.container.textContent)).toBe(compact(sample.expected));

    view.rerender(<Fluxdown build={build} streaming={false} text={source} />);

    expect(compact(view.container.textContent)).toBe(compact(sample.expected));

    for (const link of view.container.querySelectorAll('a')) {
      expect(link).toHaveAttribute('href', '/manual');
    }
  });

  test('restores an ordinary continuation of a provisional definition label', () => {
    const reference = '[label][manual]';

    const view = render(
      <Fluxdown build={build} streaming={streaming} text={reference + '\n\n[manual]'} />,
    );

    expect(view.container.textContent).toBe('label');

    const source = reference + '\n\n[manual] ordinary prose';

    view.rerender(<Fluxdown build={build} streaming={streaming} text={source} />);

    expect(view.container.querySelector('a')).toHaveTextContent('label');

    expect(view.container.textContent).toContain('[manual] ordinary prose');

    view.rerender(<Fluxdown build={build} streaming={false} text={source} />);

    expect(view.container.textContent).toContain(reference);

    expect(view.container.querySelector('a')).toBeNull();
  });

  test('keeps shared references stable before and inside a table with a quoted definition', () => {
    const introduction = '先看 [手册][guide]，再看 [第二🚀](https://example.test)。';

    const continuation =
      '\n\n| 内容 |\n| --- |\n| [手册][guide] 与 [示例](https://example.test) |' +
      '\n\n> [guide]: https://example.test/guide "手册"';

    const view = render(<Fluxdown build={build} streaming={streaming} text={introduction} />);

    let source = introduction;

    for (const character of continuation) {
      source += character;

      view.rerender(<Fluxdown build={build} streaming={streaming} text={source} />);

      expect({
        source,
        labels: [...view.container.querySelectorAll('p a')]
          .slice(0, 2)
          .map((link) => link.textContent),
      }).toEqual({ source, labels: ['手册', '第二🚀'] });

      const cell = view.container.querySelector('td');

      expect({ source, syntax: cell?.textContent?.match(/[[\]]|https:/g) ?? [] }).toEqual({
        source,
        syntax: [],
      });

      if (cell?.textContent?.includes('手册')) {
        expect(cell.querySelector('a')).toHaveTextContent('手册');
      }
    }

    view.rerender(<Fluxdown build={build} streaming={false} text={source} />);

    expect(view.container.querySelectorAll('a[href="https://example.test/guide"]')).toHaveLength(2);

    expect(view.container.querySelectorAll('a[href="https://example.test"]')).toHaveLength(2);
  });

  test('keeps unrelated shortcut prose literal and clears reference state on text replacement', () => {
    const view = render(
      <Fluxdown build={build} streaming={streaming} text={'[old][manual]\n\n[manual]: /old'} />,
    );

    expect(view.container.querySelector('a')).toHaveAttribute('href', '/old');

    const literal = 'first\n\n[unknown] ordinary prose';

    view.rerender(<Fluxdown build={build} streaming={streaming} text={literal} />);

    expect(view.container.textContent).toContain('[unknown] ordinary prose');

    expect(view.container.querySelector('a')).toBeNull();

    const replacement = '[fresh][other]\n\n[other]: /fresh "New title"';

    view.rerender(<Fluxdown build={build} streaming={streaming} text={replacement} />);

    expect(view.container.querySelector('a')).toHaveTextContent('fresh');

    expect(view.container.querySelector('a')).toHaveAttribute('href', '/fresh');

    view.rerender(<Fluxdown build={build} streaming={false} text={replacement} />);

    expect(view.container.querySelector('a')).toHaveAttribute('title', 'New title');
  });

  test.each(['[manual]: /manual "open', '[manual]: /manual "closed" extra'])(
    'restores native unresolved references after ending repairs stop: %s',
    (definition) => {
      const source = '[label][manual]\n\n' + definition;

      const view = render(<Fluxdown build={build} streaming={streaming} text={source} />);

      expect(view.container.querySelector('a')).toHaveTextContent('label');

      view.rerender(<Fluxdown build={build} streaming={false} text={source} />);

      expect(view.container.textContent).toContain('[label][manual]');

      expect(view.container.textContent).toContain(definition);

      expect(view.container.querySelector('a')).toBeNull();
    },
  );

  test('honors both repair switches without retaining placeholders in earlier blocks', () => {
    const source = '[label][manual]\n\n[manual]: /manual "open';

    const view = render(<Fluxdown build={build} streaming={streaming} text={source} />);

    expect(view.container.querySelector('a')).toHaveTextContent('label');

    view.rerender(
      <Fluxdown build={build} streaming={{ ...streaming, repairEnding: false }} text={source} />,
    );

    expect(view.container.textContent).toContain('[label][manual]');

    expect(view.container.querySelector('a')).toBeNull();

    view.rerender(<Fluxdown build={build} streaming={streaming} text={source} />);

    expect(view.container.querySelector('a')).toHaveTextContent('label');

    view.rerender(
      <Fluxdown build={{ ...build, repair: false }} streaming={streaming} text={source} />,
    );

    expect(view.container.textContent).toContain('[label][manual]');

    expect(view.container.querySelector('a')).toBeNull();
  });
});
