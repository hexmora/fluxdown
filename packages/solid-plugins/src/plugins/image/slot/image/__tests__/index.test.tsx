import type { Element } from 'hast';

import { fireEvent, render } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';

import { LinkRenderer } from '../../../../link/slot/link/renderer';
import { ImageRenderer } from '../renderer';

const current: Element = { type: 'element', tagName: 'img', properties: {}, children: [] };

const nodeProps = { Raw: null, current, parents: [], render: () => null };

describe('link and image interactions', () => {
  test('passes the native click event once through image callbacks', () => {
    const onClick = vi.fn();

    const view = render(() => <ImageRenderer {...nodeProps} src="/image.png" onClick={onClick} />);

    fireEvent.click(view.container.firstElementChild!);

    expect(onClick).toHaveBeenCalledTimes(1);

    expect(onClick.mock.calls[0]?.[0].event.target).toBe(view.container.firstElementChild);
  });

  test('updates a link and its callback without remounting', () => {
    const onClick = vi.fn();

    const [href, setHref] = createSignal('#first');

    const view = render(() => (
      <LinkRenderer {...nodeProps} href={href()} onClick={onClick}>
        Link
      </LinkRenderer>
    ));

    const element = view.container.firstElementChild!;

    setHref('#second');

    fireEvent.click(element);

    expect(element.getAttribute('href')).toBe('#second');

    expect(onClick).toHaveBeenCalledTimes(1);

    expect(onClick.mock.calls[0]?.[0].event.target).toBe(element);
  });

  test.each(['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>'])(
    'omits unsafe %s URLs',
    (url) => {
      const view = render(() => (
        <>
          <ImageRenderer {...nodeProps} src={url} />
          <LinkRenderer {...nodeProps} href={url}>
            Link
          </LinkRenderer>
        </>
      ));

      expect(view.container.querySelector('img')?.hasAttribute('src')).toBe(false);

      expect(view.container.querySelector('a')?.hasAttribute('href')).toBe(false);
    },
  );
});
