import type { Element } from 'hast';

import { mount } from '@vue/test-utils';

import { LinkRenderer } from '../../../../link/slot/link/renderer';
import { ImageRenderer } from '../renderer';

const current: Element = { type: 'element', tagName: 'img', properties: {}, children: [] };

const nodeProps = { Raw: null, current, parents: [], render: () => null };

describe('link and image interactions', () => {
  test('passes the native click event once through image callbacks', async () => {
    const onClick = vi.fn();

    const wrapper = mount(ImageRenderer, { props: { ...nodeProps, src: '/image.png', onClick } });

    await wrapper.trigger('click');

    expect(onClick).toHaveBeenCalledTimes(1);

    expect(onClick.mock.calls[0]?.[0].event.target).toBe(wrapper.element);
  });

  test('passes the native click event once through link callbacks', async () => {
    const onClick = vi.fn();

    const wrapper = mount(LinkRenderer, {
      props: { ...nodeProps, href: '#section', children: 'Link', onClick },
    });

    await wrapper.trigger('click');

    expect(onClick).toHaveBeenCalledTimes(1);

    expect(onClick.mock.calls[0]?.[0].event.target).toBe(wrapper.element);
  });

  test.each(['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>'])(
    'omits unsafe %s URLs',
    (url) => {
      const image = mount(ImageRenderer, { props: { ...nodeProps, src: url } });

      const link = mount(LinkRenderer, { props: { ...nodeProps, href: url, children: 'Link' } });

      expect(image.attributes('src')).toBeUndefined();

      expect(link.attributes('href')).toBeUndefined();
    },
  );
});
