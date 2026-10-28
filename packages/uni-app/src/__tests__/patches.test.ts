import { mount } from '@vue/test-utils';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';
import Patch from './fixtures/patch/index.uvue';

const createPatches = (label: string) => [
  {
    key: 'stable-range',
    range: [6, 11] as [number, number],
    render: (text?: string) => `${label}:${text}`,
  },
];

describe('render patches', () => {
  test('renders point and range patches in source order', () => {
    const wrapper = mount(FluxdownLite, {
      props: {
        text: 'Hello world',
        patches: [{ key: 'point', range: 5, render: () => '|' }, ...createPatches('replacement')],
      },
    });

    expect(wrapper.text().replaceAll('\u00a0', ' ')).toBe('Hello| replacement:world');
  });

  test.each([Fluxdown, FluxdownLite])(
    'renders an interactive component patch in %s',
    async (Component) => {
      const press = vi.fn();

      const wrapper = mount(Component, {
        props: {
          text: 'Hello, @Ada.',
          patches: [
            {
              key: 'mention',
              range: [7, 11],
              render: () => ({
                component: Patch,
                props: { label: 'Ada Lovelace', onPress: press },
              }),
            },
          ],
        },
      });

      expect(wrapper.text().replaceAll('\u00a0', ' ')).toBe('Hello, Ada Lovelace.');

      await wrapper.get('.patch').trigger('click');

      expect(press).toHaveBeenCalledOnce();
    },
  );

  test('updates patch callbacks without recompiling unchanged Markdown', async () => {
    const compile = vi.fn();

    class CompileCounter {
      static readonly key = 'test-compile-counter';

      readonly config = {};

      readonly plugin = () => () => {
        compile();
      };

      destroy() {}
    }

    const wrapper = mount(FluxdownLite, {
      props: {
        text: 'Hello world',
        patches: createPatches('first'),
        plugins: { remarks: [CompileCounter] },
      },
    });

    const calls = compile.mock.calls.length;

    await wrapper.setProps({ patches: createPatches('second') });

    expect(wrapper.text().replaceAll('\u00a0', ' ')).toBe('Hello second:world');

    expect(compile).toHaveBeenCalledTimes(calls);
  });

  test('ignores out-of-range patches and supports keyless replacements', async () => {
    const wrapper = mount(FluxdownLite, {
      props: {
        text: 'visible',
        patches: [{ range: [50, 60], render: () => 'hidden' }],
      },
    });

    expect(wrapper.text().replaceAll('\u00a0', ' ')).toBe('visible');

    await wrapper.setProps({ patches: [{ range: [0, 7], render: (text) => `changed:${text}` }] });

    expect(wrapper.text().replaceAll('\u00a0', ' ')).toBe('changed:visible');
  });
});
