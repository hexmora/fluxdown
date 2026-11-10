import { SyntaxTableRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/syntax-table';
import { act, cleanup, render } from '@testing-library/react';

import { Fluxdown } from '../packs/full';

const streaming = { smooth: false, effect: false };

afterEach(async () => {
  cleanup();

  await act(async () => {});
});

describe('Fluxdown table ending repairs', () => {
  test.each(['', '> ', '- '])('holds an unfinished header in container %j', (prefix) => {
    const header = '| **Name** | `Value` |';
    const view = render(<Fluxdown streaming={streaming} text="" />);

    for (let length = 1; length <= header.length; length += 1) {
      view.rerender(<Fluxdown streaming={streaming} text={prefix + header.slice(0, length)} />);

      expect(view.container.textContent?.trim()).toBe('');
    }

    const continuation = prefix === '- ' ? '  ' : prefix;
    const text = `${prefix}${header}\n${continuation}| --- | --- |\n${continuation}| Ada | 42 |`;

    view.rerender(<Fluxdown streaming={streaming} text={text} />);

    expect(view.container.querySelectorAll('th')).toHaveLength(2);
    expect(view.container.querySelector('table')?.textContent?.replace(/\s/g, '')).toBe(
      'NameValueAda42',
    );
    expect(view.container.textContent).not.toContain('|');

    view.rerender(<Fluxdown streaming={false} text={text} />);

    expect(view.container.querySelector('table')?.textContent?.replace(/\s/g, '')).toBe(
      'NameValueAda42',
    );
  });

  test('restores a provisional header when the next line rules out a table', () => {
    const header = '| Name | Value |';
    const view = render(<Fluxdown streaming={streaming} text={header} />);

    expect(view.container.textContent?.trim()).toBe('');

    view.rerender(<Fluxdown streaming={streaming} text={`${header}\nordinary prose`} />);

    expect(view.container.textContent).toContain(header);
    expect(view.container.textContent).toContain('ordinary prose');
    expect(view.container.querySelector('table')).toBeNull();
  });

  test('restores an unfinished header when streaming or ending repairs stop', () => {
    const text = '| Name | Value |';
    const view = render(<Fluxdown streaming={streaming} text={text} />);

    expect(view.container.textContent?.trim()).toBe('');

    view.rerender(<Fluxdown streaming={{ ...streaming, repairEnding: false }} text={text} />);

    expect(view.container.textContent).toBe(text);

    view.rerender(<Fluxdown streaming={streaming} text={text} />);

    expect(view.container.textContent?.trim()).toBe('');

    view.rerender(<Fluxdown streaming={false} text={text} />);

    expect(view.container.textContent).toBe(text);
  });

  test('preserves the header when the table syntax plugin is disabled', () => {
    const text = '| Name | Value |';
    const view = render(
      <Fluxdown
        plugins={{ remarks: [[SyntaxTableRemarkPlugin, { disabled: true }]] }}
        streaming={streaming}
        text={text}
      />,
    );

    expect(view.container.textContent).toBe(text);
  });

  test.each([String.raw`\| literal`, '&#124; literal', '`| literal`'])(
    'preserves a literal pipe in %j',
    (text) => {
      const view = render(<Fluxdown streaming={streaming} text={text} />);

      expect(view.container.textContent).toBe('| literal');
    },
  );
});
