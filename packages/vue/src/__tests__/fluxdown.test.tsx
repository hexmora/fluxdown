import type { ParagraphProps } from '@fluxdown/vue-plugins/base';
import type { IPluginItem } from '@fluxdown/vue-plugins/typings';

import { SyntaxSoftEndlineRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/syntax-soft-endline';
import { BaseSlotPlugin, PREFIX } from '@fluxdown/vue-plugins/base';
import {
  ParagraphPlugin,
  ParagraphRenderPlugin,
  ParagraphSlotPlugin,
} from '@fluxdown/vue-plugins/plugins/paragraph';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

import type { FluxdownRef } from '../packs/raw';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';
import { FluxdownRaw } from '../packs/raw';

interface AttributesHarnessProps {
  className: string;

  padding: string;
}

class ExtendedParagraph extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'test-extended-paragraph';

  readonly type = 'Paragraph';

  readonly Component = ({ Raw, ...props }: ParagraphProps) => {
    return <section data-custom="paragraph">{Raw ? h(Raw, props) : props.children}</section>;
  };
}

describe('Fluxdown components', () => {
  test.each([Fluxdown, FluxdownLite])('renders common Markdown with preset slots', (Component) => {
    const text =
      '# Heading\n\nA **strong** and *emphasized* [link](https://example.com) with `code`.\n\n> quote\n\n1. first\n2. second\n\n---\n\n```ts\nconst answer = 42;\n```\n\n| A | B |\n| - | - |\n| 1 | 2 |';

    const wrapper = mount(Component, { props: { text } });

    expect(wrapper.get('h1').text()).toBe('Heading');

    expect(wrapper.get('strong').text()).toBe('strong');

    expect(wrapper.get('em').text()).toBe('emphasized');

    expect(wrapper.get('a').attributes('href')).toBe('https://example.com');

    expect(wrapper.findAll('ol li')).toHaveLength(2);

    expect(wrapper.get('blockquote').text()).toBe('quote');

    expect(wrapper.get('pre code').text()).toBe('const answer = 42;');

    expect(wrapper.findAll('table tbody td')).toHaveLength(2);
  });

  test('updates source without replacing completed blocks', async () => {
    const wrapper = mount(FluxdownLite, { props: { text: 'first\n\nsecond' } });

    const first = wrapper.get('p').element;

    await wrapper.setProps({ text: 'first\n\nsecond appended' });

    expect(wrapper.get('p').element).toBe(first);

    expect(wrapper.text()).toBe('firstsecond appended');

    await wrapper.setProps({ text: '' });

    expect(wrapper.text()).toBe('');
  });

  test('raw uses only explicitly configured renderers and slots', () => {
    const empty = mount(FluxdownRaw, { props: { text: 'content', plugins: [] } });

    expect(empty.text()).toBe('');

    const configured = mount(FluxdownRaw, { props: { text: 'content', plugins: ParagraphPlugin } });

    expect(configured.get('p').text()).toBe('');
  });

  test('extends slots and accepts Vue class, style and DOM attributes', () => {
    const wrapper = mount(FluxdownLite, {
      props: { text: 'content', plugins: { slots: [ExtendedParagraph] } },
      attrs: { class: 'custom', style: { marginTop: '3px' }, 'aria-label': 'Markdown' },
    });

    expect(wrapper.get('[data-custom="paragraph"] p').text()).toBe('content');

    expect(
      wrapper
        .attributes('class')
        ?.split(/\s+/)
        .filter((name) => name === 'custom'),
    ).toHaveLength(1);

    expect(wrapper.attributes('aria-label')).toBe('Markdown');

    expect((wrapper.element as HTMLElement).style.marginTop).toBe('3px');
  });

  test('updates consumer attributes without duplicating the class', async () => {
    const Harness = defineComponent(
      (props: AttributesHarnessProps) => {
        return () => {
          return h(FluxdownLite, {
            text: 'content',
            class: props.className,
            style: { padding: props.padding },
          });
        };
      },
      { props: ['className', 'padding'] },
    );

    const wrapper = mount(Harness, { props: { className: 'initial', padding: '1px' } });

    await wrapper.setProps({ className: 'updated', padding: '2px' });

    expect(
      wrapper
        .attributes('class')
        ?.split(/\s+/)
        .filter((name) => name === 'updated'),
    ).toHaveLength(1);

    expect(wrapper.classes()).not.toContain('initial');

    expect((wrapper.element as HTMLElement).style.padding).toBe('2px');
  });

  test('disables individual parser and render presets, and restores them reactively', async () => {
    const plugins: IPluginItem[] = [
      {
        remarks: [[SyntaxSoftEndlineRemarkPlugin, { disabled: true }]],
        renders: [[ParagraphRenderPlugin, { disabled: true }]],
      },
    ];

    const wrapper = mount(FluxdownLite, { props: { text: 'first\nsecond', plugins } });

    expect(wrapper.find('br').exists()).toBe(false);

    expect(wrapper.get('p').classes()).toEqual([]);

    await wrapper.setProps({ plugins: [] });

    expect(wrapper.find('br').exists()).toBe(true);

    expect(wrapper.get('p').classes().length).toBeGreaterThan(0);
  });

  test('removes disabled slots from the Raw composition chain', () => {
    const wrapper = mount(FluxdownLite, {
      props: {
        text: 'custom paragraph',
        plugins: { slots: [[ParagraphSlotPlugin, { disabled: true }], ExtendedParagraph] },
      },
    });

    expect(wrapper.get('section').text()).toBe('custom paragraph');

    expect(wrapper.find('p').exists()).toBe(false);
  });

  test('updates theme tokens without recompiling content', async () => {
    const wrapper = mount(FluxdownLite, { props: { text: '# Theme', theme: 'light' } });

    const heading = wrapper.get('h1').element;

    const root = wrapper.element as HTMLElement;

    expect(root.style.getPropertyValue(`--${PREFIX}-colors-bg`)).toBe('#ffffff');

    await wrapper.setProps({ theme: ['dark', { tokens: { colors: { accent: 'hotpink' } } }] });

    expect(wrapper.get('h1').element).toBe(heading);

    expect(root.style.getPropertyValue(`--${PREFIX}-colors-accent`)).toBe('hotpink');
  });

  test('exposes the underlying readable Core and releases it on unmount', () => {
    const wrapper = mount(FluxdownLite, { props: { text: 'content' } });

    const value = (wrapper.vm as unknown as FluxdownRef).value;

    expect(value?.value.length).toBeGreaterThan(0);

    wrapper.unmount();

    expect(value?.closed).toBe(true);
  });
});
