import type { UniRenderParams } from '@fluxdown/uni-app-plugins/base';
import type { IPluginItem } from '@fluxdown/uni-app-plugins/typings';

import { SyntaxSoftEndlineRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/syntax-soft-endline';
import { HeadingSlotPlugin } from '@fluxdown/uni-app-plugins/plugins/heading';
import { ParagraphRenderPlugin } from '@fluxdown/uni-app-plugins/plugins/paragraph';
import { flushPromises, mount } from '@vue/test-utils';

import type { FluxdownRef } from '../packs/raw';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';
import { FluxdownRaw } from '../packs/raw';
import { getText } from './utils/text';

describe('Fluxdown components', () => {
  test.each([Fluxdown, FluxdownLite])(
    'renders common Markdown with preset slots',
    async (Component) => {
      const text =
        '# Heading\n\nA **strong** and *emphasized* [link](https://example.com) with `code`.\n\n> quote\n\n1. first\n2. second\n\n---\n\n```ts\nconst answer = 42;\n```\n\n| A | B |\n| - | - |\n| 1 | 2 |';

      const wrapper = mount(Component, { props: { text } });

      await flushPromises();

      for (const content of [
        'Heading',
        'strong',
        'emphasized',
        'link',
        'quote',
        'first',
        'second',
        'const answer = 42;',
        'A',
        'B',
      ]) {
        expect(getText(wrapper.element)).toContain(content);
      }

      expect(wrapper.find('.fluxdown').exists()).toBe(true);
    },
  );

  test('keeps heading tracking and inline code decoration tied to the theme', async () => {
    const wrapper = mount(FluxdownLite, {
      props: { text: '# First\n\n## Second\n\n### Third\n\nInline `code`.\n\n```txt\nblock\n```' },
    });

    await flushPromises();

    const headings = wrapper.findAll('.fluxdown-heading');

    expect(headings[0].get('text').element.style.letterSpacing).toBe('-0.8px');

    expect(parseFloat(headings[1].get('text').element.style.letterSpacing)).toBeCloseTo(-0.6);

    expect(headings[2].get('text').element.style.letterSpacing).toBe('0px');

    expect(wrapper.findAll('.fluxdown-inline-code')).toHaveLength(1);

    const code = wrapper.get('.fluxdown-inline-code').element as HTMLElement;

    expect(parseFloat(code.style.paddingTop)).toBeCloseTo(2.1);

    expect(parseFloat(code.style.paddingLeft)).toBeCloseTo(4.9);

    expect(code.style.marginTop).toBe('-3.1px');

    expect(code.style.marginBottom).toBe('-3.1px');

    expect(code.style.borderWidth).toBe('1px');

    expect(wrapper.get('.fluxdown-code-block').find('.fluxdown-inline-code').exists()).toBe(false);

    await wrapper.setProps({
      theme: {
        tokens: {
          code: { fontSize: 20 },
          heading: { h1: { fontSize: 40 } },
          colors: { border: '#123456' },
          radius: { sm: 6 },
        },
      },
    });

    expect(wrapper.findAll('.fluxdown-heading')[0].get('text').element.style.letterSpacing).toBe(
      '-1px',
    );

    expect(code.style.padding).toBe('3px 7px');

    expect(code.style.borderColor).toBe('rgb(18, 52, 86)');

    expect(code.style.borderRadius).toBe('6px');
  });

  test('inherits the platform font by default and applies a configured theme font', async () => {
    const wrapper = mount(FluxdownLite, { props: { text: 'Default **bold** and *italic*.' } });

    await flushPromises();

    const raw = wrapper.getComponent(FluxdownRaw);

    expect(raw.vm.$.subTree.props?.style).not.toHaveProperty('fontFamily');

    await wrapper.setProps({ theme: { tokens: { typography: { fontSans: 'ExampleFont' } } } });

    expect(raw.vm.$.subTree.props?.style).toHaveProperty('fontFamily', 'ExampleFont');

    expect(wrapper.get('text').element.style.fontFamily).toBe('ExampleFont');
  });

  test('explicitly restores a former last block margin as the next block arrives', async () => {
    const wrapper = mount(FluxdownLite, { props: { text: '## Heading' } });

    await flushPromises();

    const Component = new HeadingSlotPlugin().Component;

    const heading = wrapper
      .findAllComponents(Component)
      .find((node) => node.vm.$.type === Component)!;

    const instance = heading.vm.$;

    expect(instance.vnode.props?.style).toMatchObject({ marginTop: '0px', marginBottom: '0px' });

    await wrapper.setProps({ text: '## Heading\n\nParagraph' });

    expect(heading.vm.$).toBe(instance);

    expect(instance.vnode.props?.style).toMatchObject({ marginTop: '0px', marginBottom: '14px' });

    await wrapper.setProps({ theme: { tokens: { heading: { h2: { marginBottom: 22 } } } } });

    expect(instance.vnode.props?.style).toMatchObject({ marginTop: '0px', marginBottom: '22px' });
  });

  test('trims only document edges as new blocks arrive', async () => {
    const wrapper = mount(FluxdownLite, { props: { text: '# First\n\n# Last' } });

    await flushPromises();

    const headings = wrapper.findAll('.fluxdown-heading');

    expect((headings[0].element as HTMLElement).style.marginTop).toBe('0px');

    expect((headings[1].element as HTMLElement).style.marginTop).toBe('16px');

    expect((headings[1].element as HTMLElement).style.marginBottom).toBe('0px');

    await wrapper.setProps({ text: '# First\n\n# Last\n\nParagraph' });

    await flushPromises();

    expect(
      (wrapper.findAll('.fluxdown-heading')[1].element as HTMLElement).style.marginBottom,
    ).toBe('16px');

    expect((wrapper.find('.fluxdown-paragraph').element as HTMLElement).style.marginBottom).toBe(
      '0px',
    );
  });

  test('shares one gap between adjacent blocks and responds to theme and preceding content', async () => {
    const wrapper = mount(FluxdownLite, { props: { text: '# First\n\n## Next\n\nParagraph' } });

    await flushPromises();

    const next = () => wrapper.findAll('.fluxdown-heading')[1].element as HTMLElement;

    expect(next().style.marginTop).toBe('12px');

    await wrapper.setProps({
      theme: {
        tokens: {
          heading: {
            h1: { marginBottom: 30 },
            h2: { marginTop: 50 },
          },
        },
      },
    });

    expect(next().style.marginTop).toBe('20px');

    const element = next();

    await wrapper.setProps({ text: '### First\n\n## Next\n\nParagraph' });

    expect(next().style.marginTop).toBe('38px');

    expect(next()).toBe(element);
  });

  test('keeps blockquote padding and list row gaps without inner outer margins', async () => {
    const wrapper = mount(FluxdownLite, {
      props: { text: '> Quoted\n\n- first\n- second\n- third' },
    });

    await flushPromises();

    const paragraph = wrapper.get('.fluxdown-blockquote .fluxdown-paragraph')
      .element as HTMLElement;

    expect(paragraph.style.marginTop).toBe('0px');

    expect(paragraph.style.marginBottom).toBe('0px');

    const rows = wrapper.get('.fluxdown-list').element.children;

    expect(Array.from(rows, (row) => (row as HTMLElement).style.marginTop)).toEqual([
      '0px',
      '4px',
      '4px',
    ]);
  });

  test('updates source without replacing completed blocks', async () => {
    const wrapper = mount(FluxdownLite, { props: { text: 'first\n\nsecond' } });

    await flushPromises();

    const first = wrapper
      .findAll('text')
      .find((node) => getText(node.element) === 'first')!.element;

    await wrapper.setProps({ text: 'first\n\nsecond appended' });

    expect(wrapper.findAll('text').find((node) => getText(node.element) === 'first')!.element).toBe(
      first,
    );

    expect(getText(wrapper.element)).toBe('firstsecond appended');

    await wrapper.setProps({ text: '' });

    expect(getText(wrapper.element)).toBe('');
  });

  test('does not rerender completed blocks as the streaming tail changes', async () => {
    const rendered = vi.fn();

    class CountedParagraph extends ParagraphRenderPlugin {
      render(params: UniRenderParams) {
        rendered(params.node);

        return super.render(params);
      }
    }

    const wrapper = mount(FluxdownLite, {
      props: {
        text: 'completed\n\ntail',
        plugins: { renders: [CountedParagraph] },
      },
    });

    await flushPromises();

    const completed = rendered.mock.calls[0][0];

    const completedCalls = () => rendered.mock.calls.filter(([node]) => node === completed).length;

    const initial = completedCalls();

    await wrapper.setProps({ text: 'completed\n\ntail appended' });

    expect(getText(wrapper.element)).toBe('completedtail appended');

    expect(completedCalls()).toBe(initial);

    await wrapper.setProps({ text: 'completed\n\ntail appended\n\nnew block' });

    await flushPromises();

    expect(getText(wrapper.element)).toBe('completedtail appendednew block');

    expect(completedCalls()).toBe(initial);
  });

  test('raw uses only explicitly configured renderers and slots', async () => {
    const wrapper = mount(FluxdownRaw, { props: { text: 'content', plugins: [] } });

    await flushPromises();

    expect(getText(wrapper.element)).toBe('');
  });

  test('disables parser presets and restores them reactively', async () => {
    const plugins: IPluginItem[] = [
      { remarks: [[SyntaxSoftEndlineRemarkPlugin, { disabled: true }]] },
    ];

    const wrapper = mount(FluxdownLite, { props: { text: 'first\nsecond', plugins } });

    await flushPromises();

    expect(wrapper.find('.fluxdown-break-line').exists()).toBe(false);

    await wrapper.setProps({
      plugins: [{ renders: [[ParagraphRenderPlugin, { disabled: true }]] }],
    });

    expect(wrapper.find('.fluxdown-paragraph').exists()).toBe(false);

    await wrapper.setProps({ plugins: [] });

    await flushPromises();

    expect(wrapper.find('.fluxdown-paragraph').exists()).toBe(true);

    expect(wrapper.find('.fluxdown-break-line').exists()).toBe(true);
  });

  test('updates theme and consumer attributes without recompiling content', async () => {
    const wrapper = mount(FluxdownLite, {
      props: { text: '# Theme', theme: 'light' },
      attrs: { class: 'custom', style: { padding: '3px' } },
    });

    await flushPromises();

    const heading = wrapper
      .findAll('text')
      .find((node) => getText(node.element) === 'Theme')!.element;

    expect(wrapper.classes().filter((name) => name === 'custom')).toHaveLength(1);

    await wrapper.setProps({ theme: ['dark', { tokens: { colors: { fg: '#ff0000' } } }] });

    expect(wrapper.findAll('text').find((node) => getText(node.element) === 'Theme')!.element).toBe(
      heading,
    );

    expect((wrapper.element as HTMLElement).style.color).toBe('rgb(255, 0, 0)');

    expect((wrapper.element as HTMLElement).style.padding).toBe('3px');
  });

  test('exposes the readable Core and releases subscriptions on unmount', () => {
    const wrapper = mount(FluxdownLite, { props: { text: 'content' } });

    const state = (wrapper.vm as unknown as FluxdownRef).value;

    expect(state.value.length).toBeGreaterThan(0);

    wrapper.unmount();

    expect(state.closed).toBe(true);
  });
});
