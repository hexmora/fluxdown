import type { VueRenderMatchParams, VueRenderParams } from '@fluxdown/vue-base-plugins/base';
import type { IPluginItem } from '@fluxdown/vue-base-plugins/typings';
import type { ParagraphProps } from '@fluxdown/vue-lynx-plugins/base';
import type { HTMLAttributes, StyleValue } from 'vue';

import { BaseVueRenderPlugin } from '@fluxdown/vue-base-plugins/base';
import { BaseSlotPlugin } from '@fluxdown/vue-lynx-plugins/base';
import { ParagraphSlotPlugin } from '@fluxdown/vue-lynx-plugins/plugins/paragraph';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

import type { FluxdownRef } from '../packs/raw';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';

interface AttributesHarnessProps {
  className: HTMLAttributes['class'];

  style: StyleValue;
}

class ExtendedParagraph extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'test-extended-paragraph';

  readonly type = 'Paragraph';

  readonly Component = ({ Raw, ...props }: ParagraphProps) => {
    return <view data-custom="paragraph">{Raw ? h(Raw, props) : props.children}</view>;
  };
}

describe('reactive renderer configuration', () => {
  test.each([Fluxdown, FluxdownLite])(
    'normalizes and updates consumer class and style attributes',
    async (Component) => {
      const Harness = defineComponent(
        (props: AttributesHarnessProps) => {
          return () => {
            return h(Component, {
              text: 'content',
              class: props.className,
              style: props.style,
              'data-custom': 'root',
            });
          };
        },
        { props: ['className', 'style'] },
      );

      const wrapper = mount(Harness, {
        props: {
          className: ['initial', { enabled: true, disabled: false }],
          style: [{ padding: '1px' }, 'margin-top: 3px'],
        },
      });

      const root = wrapper.get('.fluxdown');

      expect(root.classes()).toContain('initial');

      expect(root.classes()).toContain('enabled');

      expect(root.classes()).not.toContain('disabled');

      expect((root.element as HTMLElement).style.marginTop).toBe('3px');

      await wrapper.setProps({
        className: ['updated', { enabled: false }],
        style: [{ padding: '2px' }],
      });

      expect(root.classes().filter((name) => name === 'updated')).toHaveLength(1);

      expect(root.classes()).not.toContain('initial');

      expect(root.classes()).not.toContain('enabled');

      expect((root.element as HTMLElement).style.padding).toBe('2px');

      expect((root.element as HTMLElement).style.marginTop).toBe('');

      expect(root.attributes('data-custom')).toBe('root');
    },
  );

  test('recompiles unchanged source when build configuration changes', async () => {
    const wrapper = mount(FluxdownLite, {
      props: { text: 'Heading\n===', build: { setextHeading: false } },
    });

    expect(wrapper.find('.fluxdown-heading').exists()).toBe(false);

    await wrapper.setProps({ build: { setextHeading: true } });

    expect(wrapper.get('.fluxdown-heading').text()).toBe('Heading');

    await wrapper.setProps({ build: { setextHeading: false } });

    expect(wrapper.find('.fluxdown-heading').exists()).toBe(false);
  });

  test('updates theme colors on existing native text without recompiling', async () => {
    const compile = vi.fn();

    class CompileCounter {
      static readonly key = 'test-theme-compile-counter';

      readonly config = {};

      readonly plugin = () => () => {
        compile();
      };

      destroy() {}
    }

    const wrapper = mount(FluxdownLite, {
      props: { text: '# Heading\n\nParagraph', plugins: { remarks: [CompileCounter] } },
    });

    const heading = wrapper.get('.fluxdown-heading').element;

    const calls = compile.mock.calls.length;

    await wrapper.setProps({ theme: { tokens: { colors: { fg: '#123456' } } } });

    expect(wrapper.get('.fluxdown-heading').element).toBe(heading);

    expect((heading as HTMLElement).style.color).toBe('rgb(18, 52, 86)');

    expect((wrapper.get('.fluxdown-paragraph').element as HTMLElement).style.color).toBe(
      'rgb(18, 52, 86)',
    );

    expect(compile).toHaveBeenCalledTimes(calls);
  });

  test('rebuilds custom slot composition and forwards Raw children after updates', async () => {
    const wrapper = mount(FluxdownLite, {
      props: { text: 'first **strong**', plugins: { slots: [ExtendedParagraph] } },
    });

    expect(wrapper.get('[data-custom="paragraph"] .fluxdown-paragraph').text()).toBe(
      'first strong',
    );

    await wrapper.setProps({
      text: 'next *emphasis*',
      plugins: { slots: [[ParagraphSlotPlugin, { disabled: true }], ExtendedParagraph] },
    });

    expect(wrapper.get('[data-custom="paragraph"]').text()).toBe('next emphasis');

    expect(wrapper.find('.fluxdown-paragraph').exists()).toBe(false);

    await wrapper.setProps({ plugins: [] });

    expect(wrapper.find('[data-custom="paragraph"]').exists()).toBe(false);

    expect(wrapper.get('.fluxdown-paragraph').text()).toBe('next emphasis');
  });

  test('retires removed slot plugins and releases the active slot on unmount', async () => {
    const counts = { created: 0, destroyed: 0 };

    class TrackedParagraph extends BaseSlotPlugin<'Paragraph'> {
      static readonly key = 'test-tracked-paragraph';

      readonly type = 'Paragraph';

      constructor() {
        super();

        counts.created += 1;
      }

      readonly Component = ({ Raw, ...props }: ParagraphProps) =>
        Raw ? h(Raw, props) : props.children;

      destroy() {
        counts.destroyed += 1;
      }
    }

    const wrapper = mount(FluxdownLite, {
      props: { text: 'content', plugins: { slots: [TrackedParagraph] } },
    });

    await wrapper.setProps({ plugins: { slots: [TrackedParagraph] } });

    expect(counts).toEqual({ created: 1, destroyed: 0 });

    await wrapper.setProps({ plugins: [] });

    expect(counts).toEqual({ created: 1, destroyed: 1 });

    await wrapper.setProps({ plugins: { slots: [TrackedParagraph] } });

    expect(counts).toEqual({ created: 2, destroyed: 1 });

    wrapper.unmount();

    expect(counts).toEqual({ created: 2, destroyed: 2 });
  });

  test('reuses equal custom render options and destroys replaced instances once', async () => {
    const counts = { created: 0, destroyed: 0 };

    class ConfiguredRenderPlugin extends BaseVueRenderPlugin {
      static readonly key = 'test-configured-render';

      readonly label: string;

      constructor(options: { label: string }) {
        super();

        this.label = options.label;

        counts.created += 1;
      }

      match({ node }: VueRenderMatchParams) {
        return node.type === 'element' && node.tagName === 'p';
      }

      render({ renderChildren }: VueRenderParams) {
        return (
          <text data-custom="renderer">
            {this.label}:{renderChildren()}
          </text>
        );
      }

      destroy() {
        counts.destroyed += 1;
      }
    }

    const plugins = (label: string): IPluginItem => ({
      renders: [[ConfiguredRenderPlugin, { label }]],
    });

    const wrapper = mount(FluxdownLite, {
      props: { text: 'content', plugins: plugins('first') },
    });

    expect(wrapper.get('[data-custom="renderer"]').text()).toBe('first:content');

    await wrapper.setProps({ plugins: plugins('first') });

    expect(counts).toEqual({ created: 1, destroyed: 0 });

    await wrapper.setProps({ plugins: plugins('second') });

    expect(wrapper.get('[data-custom="renderer"]').text()).toBe('second:content');

    expect(counts).toEqual({ created: 2, destroyed: 1 });

    (wrapper.vm as unknown as FluxdownRef).destroy();

    wrapper.unmount();

    expect(counts).toEqual({ created: 2, destroyed: 2 });
  });
});
