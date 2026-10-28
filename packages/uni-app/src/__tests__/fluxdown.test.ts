import type { UniRenderParams } from '@fluxdown/uni-app-plugins/base';
import type { IPluginItem } from '@fluxdown/uni-app-plugins/typings';

import { SyntaxSoftEndlineRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/syntax-soft-endline';
import { ParagraphRenderPlugin } from '@fluxdown/uni-app-plugins/plugins/paragraph';
import { mount } from '@vue/test-utils';

import type { FluxdownRef } from '../packs/raw';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';
import { FluxdownRaw } from '../packs/raw';

describe('Fluxdown components', () => {
  test.each([Fluxdown, FluxdownLite])('renders common Markdown with preset slots', (Component) => {
    const text =
      '# Heading\n\nA **strong** and *emphasized* [link](https://example.com) with `code`.\n\n> quote\n\n1. first\n2. second\n\n---\n\n```ts\nconst answer = 42;\n```\n\n| A | B |\n| - | - |\n| 1 | 2 |';

    const wrapper = mount(Component, { props: { text } });

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
      expect(wrapper.text().replaceAll('\u00a0', ' ')).toContain(content);
    }

    expect(wrapper.find('.fluxdown').exists()).toBe(true);
  });

  test('trims only document edges as new blocks arrive', async () => {
    const wrapper = mount(FluxdownLite, { props: { text: '# First\n\n# Last' } });

    const headings = wrapper.findAll('.fluxdown-heading');

    expect((headings[0].element as HTMLElement).style.marginTop).toBe('0px');

    expect((headings[1].element as HTMLElement).style.marginTop).toBe('16px');

    expect((headings[1].element as HTMLElement).style.marginBottom).toBe('0px');

    await wrapper.setProps({ text: '# First\n\n# Last\n\nParagraph' });

    expect(
      (wrapper.findAll('.fluxdown-heading')[1].element as HTMLElement).style.marginBottom,
    ).toBe('16px');

    expect((wrapper.find('.fluxdown-paragraph').element as HTMLElement).style.marginBottom).toBe(
      '0px',
    );
  });

  test('shares one gap between adjacent blocks and responds to theme and preceding content', async () => {
    const wrapper = mount(FluxdownLite, { props: { text: '# First\n\n## Next\n\nParagraph' } });

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

  test('keeps blockquote padding and list row gaps without inner outer margins', () => {
    const wrapper = mount(FluxdownLite, {
      props: { text: '> Quoted\n\n- first\n- second\n- third' },
    });

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

    const first = wrapper.findAll('text').find((node) => node.text() === 'first')!.element;

    await wrapper.setProps({ text: 'first\n\nsecond appended' });

    expect(wrapper.findAll('text').find((node) => node.text() === 'first')!.element).toBe(first);

    expect(wrapper.text().replaceAll('\u00a0', ' ')).toBe('firstsecond appended');

    await wrapper.setProps({ text: '' });

    expect(wrapper.text().replaceAll('\u00a0', ' ')).toBe('');
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

    const completed = rendered.mock.calls[0][0];

    const completedCalls = () => rendered.mock.calls.filter(([node]) => node === completed).length;

    const initial = completedCalls();

    await wrapper.setProps({ text: 'completed\n\ntail appended' });

    expect(wrapper.text().replaceAll('\u00a0', ' ')).toBe('completedtail appended');

    expect(completedCalls()).toBe(initial);

    await wrapper.setProps({ text: 'completed\n\ntail appended\n\nnew block' });

    expect(wrapper.text().replaceAll('\u00a0', ' ')).toBe('completedtail appendednew block');

    expect(completedCalls()).toBe(initial);
  });

  test('raw uses only explicitly configured renderers and slots', () => {
    const wrapper = mount(FluxdownRaw, { props: { text: 'content', plugins: [] } });

    expect(wrapper.text().replaceAll('\u00a0', ' ')).toBe('');
  });

  test('disables parser presets and restores them reactively', async () => {
    const plugins: IPluginItem[] = [
      { remarks: [[SyntaxSoftEndlineRemarkPlugin, { disabled: true }]] },
    ];

    const wrapper = mount(FluxdownLite, { props: { text: 'first\nsecond', plugins } });

    expect(wrapper.find('.fluxdown-break-line').exists()).toBe(false);

    await wrapper.setProps({
      plugins: [{ renders: [[ParagraphRenderPlugin, { disabled: true }]] }],
    });

    expect(wrapper.find('.fluxdown-paragraph').exists()).toBe(false);

    await wrapper.setProps({ plugins: [] });

    expect(wrapper.find('.fluxdown-paragraph').exists()).toBe(true);

    expect(wrapper.find('.fluxdown-break-line').exists()).toBe(true);
  });

  test('updates theme and consumer attributes without recompiling content', async () => {
    const wrapper = mount(FluxdownLite, {
      props: { text: '# Theme', theme: 'light' },
      attrs: { class: 'custom', style: { padding: '3px' } },
    });

    const heading = wrapper.findAll('text').find((node) => node.text() === 'Theme')!.element;

    expect(wrapper.classes().filter((name) => name === 'custom')).toHaveLength(1);

    await wrapper.setProps({ theme: ['dark', { tokens: { colors: { fg: '#ff0000' } } }] });

    expect(wrapper.findAll('text').find((node) => node.text() === 'Theme')!.element).toBe(heading);

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
