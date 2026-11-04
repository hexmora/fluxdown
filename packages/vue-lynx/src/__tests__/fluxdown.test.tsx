import { mount } from '@vue/test-utils';

import type { FluxdownRef } from '../packs/raw';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';
import { FluxdownRaw } from '../packs/raw';

describe('Vue Lynx renderer', () => {
  test.each([Fluxdown, FluxdownLite])('renders Markdown through native elements', (Component) => {
    const wrapper = mount(Component, {
      props: {
        text: '# Heading\n\nA **strong** and *emphasized* [link](https://example.com).\n\n> quote\n\n- first\n- second\n\n---',
      },
    });

    expect(wrapper.text()).toContain('Heading');

    expect(wrapper.text()).toContain('A strong and emphasized link.');

    expect(wrapper.find('text').exists()).toBe(true);

    expect(wrapper.find('div').exists()).toBe(false);

    expect(wrapper.findAll('.fluxdown-list-item')).toHaveLength(2);

    expect(wrapper.findAll('.fluxdown-list-item').map((item) => item.text())).toEqual([
      '•first',
      '•second',
    ]);
  });

  test('preserves the text of nested and checked list items', () => {
    const wrapper = mount(FluxdownLite, {
      props: {
        text: '- first **strong**\n  - nested\n\n- [x] complete\n- [ ] pending',
      },
    });

    expect(wrapper.text()).toContain('first strong');

    expect(wrapper.text()).toContain('nested');

    expect(wrapper.text()).toContain('complete');

    expect(wrapper.text()).toContain('pending');
  });

  test('preserves hard line breaks as native raw text', () => {
    const wrapper = mount(FluxdownLite, { props: { text: 'First line.  \nNext line.' } });

    expect(wrapper.findAll('raw-text').map((node) => node.attributes('text'))).toEqual([
      'First line.',
      '\n',
      '\nNext line.',
    ]);
  });

  test('retains a completed block when the trailing paragraph grows', async () => {
    const wrapper = mount(FluxdownLite, {
      props: { text: '# Stable heading\n\nPartial' },
    });

    const heading = wrapper.get('.fluxdown-heading').element;

    await wrapper.setProps({ text: '# Stable heading\n\nPartial text continues' });

    expect(wrapper.text()).toContain('Partial text continues');

    expect(wrapper.get('.fluxdown-heading').element).toBe(heading);

    await wrapper.setProps({ text: '' });

    expect(wrapper.text()).toBe('');
  });

  test('raw uses only explicitly configured plugins', () => {
    const wrapper = mount(FluxdownRaw, { props: { text: 'content', plugins: [] } });

    expect(wrapper.text()).toBe('');
  });

  test('forwards Vue root attributes and updates native theme styles', async () => {
    const wrapper = mount(FluxdownLite, {
      props: { text: '# Theme', theme: 'light' },
      attrs: { class: 'custom', style: { marginTop: '3px' }, 'data-test': 'markdown' },
    });

    const heading = wrapper.get('.fluxdown-heading').element;

    const root = wrapper.get('.fluxdown');

    expect(root.classes().filter((value) => value === 'custom')).toHaveLength(1);

    expect(root.attributes('data-test')).toBe('markdown');

    expect((root.element as HTMLElement).style.marginTop).toBe('3px');

    expect((root.element as HTMLElement).style.backgroundColor).toBe('rgb(255, 255, 255)');

    await wrapper.setProps({ theme: ['dark', { tokens: { colors: { accent: 'hotpink' } } }] });

    expect(wrapper.get('.fluxdown-heading').element).toBe(heading);

    expect((root.element as HTMLElement).style.getPropertyValue('--fluxdown-colors-accent')).toBe(
      'hotpink',
    );
  });

  test('exposes and releases the underlying readable Core', () => {
    const wrapper = mount(FluxdownLite, { props: { text: 'content' } });

    const value = (wrapper.vm as unknown as FluxdownRef).value;

    expect(value?.value.length).toBeGreaterThan(0);

    wrapper.unmount();

    expect(value?.closed).toBe(true);
  });

  test.each(['scale', 'shad', 'chunk', 'suffix'] as const)(
    'renders and settles the %s streaming effect',
    async (effect) => {
      const wrapper = mount(FluxdownLite, {
        props: { text: '', streaming: { effect, smooth: false } },
      });

      await wrapper.setProps({ text: 'A **complete** answer' });

      expect(wrapper.text()).toContain('A complete answer');

      await wrapper.setProps({ streaming: false });

      expect(wrapper.text()).toBe('A complete answer');
    },
  );
});
