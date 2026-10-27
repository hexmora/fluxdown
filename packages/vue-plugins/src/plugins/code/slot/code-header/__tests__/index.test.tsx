import { flushPromises, mount } from '@vue/test-utils';

import { CodeHeaderRenderer } from '../renderer';

afterEach(() => {
  vi.unstubAllGlobals();

  vi.useRealTimers();
});

describe('code header', () => {
  test('copies source and reports its metadata after the clipboard succeeds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    const onCopy = vi.fn();

    vi.stubGlobal('navigator', { clipboard: { writeText } });

    const wrapper = mount(CodeHeaderRenderer, {
      props: { Raw: null, code: 'const answer = 42;', language: 'ts', meta: 'example.ts', onCopy },
    });

    await wrapper.get('button').trigger('click');

    await flushPromises();

    expect(writeText).toHaveBeenCalledOnce();

    expect(writeText).toHaveBeenCalledWith('const answer = 42;');

    expect(onCopy).toHaveBeenCalledWith({
      code: 'const answer = 42;',
      language: 'ts',
      meta: 'example.ts',
    });

    expect(wrapper.get('button').text()).toBe('Copied');
  });

  test('ignores a stale clipboard result after the source changes', async () => {
    let finish: (() => void) | undefined;

    const writeText = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );

    const onCopy = vi.fn();

    vi.stubGlobal('navigator', { clipboard: { writeText } });

    const wrapper = mount(CodeHeaderRenderer, { props: { Raw: null, code: 'first', onCopy } });

    await wrapper.get('button').trigger('click');

    await wrapper.setProps({ code: 'second' });

    finish?.();

    await flushPromises();

    expect(onCopy).not.toHaveBeenCalled();

    expect(wrapper.get('button').text()).toBe('Copy');
  });
});
