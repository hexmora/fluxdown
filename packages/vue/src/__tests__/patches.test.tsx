import { mount } from '@vue/test-utils';

import { FluxdownLite } from '../packs/lite';

const createPatches = (label: string) => [
  {
    key: 'stable-range',
    range: [6, 11] as [number, number],
    render: (text?: string) => {
      return (
        <mark>
          {label}:{text}
        </mark>
      );
    },
  },
];

describe('render patches', () => {
  test('renders point and range patches in source order', () => {
    const wrapper = mount(FluxdownLite, {
      props: {
        text: 'Hello world',
        patches: [
          {
            key: 'point',
            range: 5,
            render: (text?: string) => {
              return <i>{text ?? '|'}</i>;
            },
          },
          ...createPatches('replacement'),
        ],
      },
    });

    expect(wrapper.get('i').text()).toBe('|');

    expect(wrapper.get('mark').text()).toBe('replacement:world');

    expect(wrapper.text()).toBe('Hello| replacement:world');
  });

  test('updates patch render callbacks without recompiling unchanged Markdown', async () => {
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

    expect(wrapper.get('mark').text()).toBe('second:world');

    expect(compile).toHaveBeenCalledTimes(calls);
  });

  test('ignores out-of-range patches and supports keyless replacements', async () => {
    const wrapper = mount(FluxdownLite, {
      props: {
        text: 'visible',
        patches: [{ range: [50, 60], render: () => <mark>hidden</mark> }],
      },
    });

    expect(wrapper.text()).toBe('visible');

    await wrapper.setProps({ patches: [{ range: [0, 7], render: (text) => <mark>{text}</mark> }] });

    expect(wrapper.get('mark').text()).toBe('visible');
  });
});
