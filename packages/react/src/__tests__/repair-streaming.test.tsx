import { SyntaxStrikethroughRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/syntax-strikethrough';
import { act, cleanup, render } from '@testing-library/react';

import { Fluxdown } from '../packs/full';

const streaming = { smooth: false, effect: false };

afterEach(async () => {
  cleanup();

  await act(async () => {});
});

describe('Fluxdown repair source boundaries', () => {
  test.each([
    [String.raw`\*literal`, '*literal'],
    [String.raw`\**literal`, '**literal'],
    [String.raw`\[literal`, '[literal'],
    [String.raw`\![literal`, '![literal'],
    [String.raw`prefix \\`, 'prefix \\'],
    ['&#42;literal', '*literal'],
    ['&#91;literal', '[literal'],
    ['&#96;literal', '`literal'],
    ['&#92;', '\\'],
    ['中文__标识符', '中文__标识符'],
    ['value_2', 'value_2'],
    ['a * b', 'a * b'],
  ])('keeps literal content while streaming %j', (text, expected) => {
    const view = render(<Fluxdown streaming={streaming} text={text} />);

    expect(view.container.textContent).toBe(expected);

    expect(view.container.querySelector('strong, em, a, code, img')).toBeNull();

    view.rerender(<Fluxdown streaming={false} text={text} />);

    expect(view.container.textContent).toBe(expected);
  });

  test.each(['-', '+', '*', '1.', '2)'])(
    'holds an empty list marker %j until text arrives',
    (marker) => {
      const view = render(<Fluxdown streaming={streaming} text={marker} />);

      expect(view.container.textContent).toBe('');

      expect(view.container.querySelector('li')).toBeNull();

      view.rerender(<Fluxdown streaming={streaming} text={`${marker} item`} />);

      expect(view.container.querySelector('li')).toHaveTextContent('item');

      view.rerender(<Fluxdown streaming={streaming} text={`${marker} item\n${marker}`} />);

      expect(view.container.querySelectorAll('li')).toHaveLength(1);

      view.rerender(<Fluxdown streaming={false} text={`${marker} item\n${marker}`} />);

      expect(view.container.querySelectorAll('li')).toHaveLength(2);
    },
  );

  test.each(['#', '##', '###', '####', '#####', '######'])(
    'holds an empty heading %j until text arrives',
    (marker) => {
      const view = render(<Fluxdown streaming={streaming} text={marker} />);

      expect(view.container.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();

      view.rerender(<Fluxdown streaming={streaming} text={`${marker} title`} />);

      expect(view.container.querySelector(`h${marker.length}`)).toHaveTextContent('title');
    },
  );

  test('holds task-marker prefixes and releases both task syntax and literal prose', () => {
    const view = render(<Fluxdown streaming={streaming} text="- [" />);

    for (const text of ['- [', '- [x', '- [x]']) {
      view.rerender(<Fluxdown streaming={streaming} text={text} />);

      expect(view.container.textContent?.trim()).toBe('');

      expect(view.container.querySelector('a, li')).toBeNull();
    }

    view.rerender(<Fluxdown streaming={streaming} text="- [x] todo" />);

    expect(view.container.textContent?.trim()).toBe('todo');

    expect(view.container.querySelector('input[type="checkbox"]')).toBeChecked();

    view.rerender(<Fluxdown streaming={streaming} text="- [xyz] note" />);

    expect(view.container.textContent?.trim()).toBe('[xyz] note');

    expect(view.container.querySelector('a, input')).toBeNull();
  });

  test('keeps raw code content stable while a multi-backtick span closes', () => {
    const view = render(<Fluxdown streaming={streaming} text={'before ``code &amp;'} />);

    expect(view.container.querySelector('code')).toHaveTextContent('code &amp;');

    view.rerender(<Fluxdown streaming={streaming} text={'before ``code &amp;``'} />);

    expect(view.container.querySelector('code')).toHaveTextContent('code &amp;');
  });

  test('tracks the active strikethrough syntax configuration during streaming', () => {
    const view = render(<Fluxdown streaming={streaming} text="~tail" />);

    expect(view.container.querySelector('del')).toHaveTextContent('tail');

    view.rerender(
      <Fluxdown
        plugins={{ remarks: [[SyntaxStrikethroughRemarkPlugin, { singleTilde: false }]] }}
        streaming={streaming}
        text="~tail"
      />,
    );

    expect(view.container.querySelector('del')).toBeNull();

    expect(view.container.textContent).toBe('~tail');

    view.rerender(
      <Fluxdown
        plugins={{ remarks: [[SyntaxStrikethroughRemarkPlugin, { singleTilde: false }]] }}
        streaming={streaming}
        text="~~tail"
      />,
    );

    expect(view.container.querySelector('del')).toHaveTextContent('tail');

    view.rerender(
      <Fluxdown
        plugins={{ remarks: [[SyntaxStrikethroughRemarkPlugin, { disabled: true }]] }}
        streaming={streaming}
        text="~~tail"
      />,
    );

    expect(view.container.querySelector('del')).toBeNull();

    expect(view.container.textContent).toBe('~~tail');

    view.rerender(<Fluxdown streaming={streaming} text="~~tail" />);

    expect(view.container.querySelector('del')).toHaveTextContent('tail');

    view.rerender(<Fluxdown streaming={false} text="~~tail" />);

    expect(view.container.textContent).toBe('~~tail');
  });
});
