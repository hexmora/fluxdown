import { mount } from '@vue/test-utils';

import { ScaleRenderer } from '..';
import { PREFIX } from '../../../../../../base';
import { ChunkRenderer } from '../../../../../effect-chunk/slot/effect-chunk/renderer';
import { ShadRenderer } from '../../../../../effect-shad/slot/effect-shad/renderer';
import { SuffixRenderer } from '../../../../../effect-suffix/slot/effect-suffix/renderer';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('streaming effect renderers', () => {
  test('resumes scale at its original timestamp without restarting on text updates', async () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(100);

    const wrapper = mount(ScaleRenderer, {
      props: { start: 50, duration: 300, from: 0.75, blur: 0.2, children: 'A' },
    });

    const root = wrapper.element as HTMLElement;

    expect(root.style.animationDelay).toBe('-50ms');

    expect(root.style.getPropertyValue(`--${PREFIX}-scale-from`)).toBe('0.75');

    expect(root.style.getPropertyValue(`--${PREFIX}-scale-blur`)).toBe('0.2em');

    now.mockReturnValue(150);

    await wrapper.setProps({ children: 'AB' });

    expect(wrapper.element).toBe(root);

    expect(root.style.animationDelay).toBe('-50ms');

    await wrapper.setProps({ start: 150 });

    expect(wrapper.element).not.toBe(root);

    expect((wrapper.element as HTMLElement).style.animationDelay).toBe('0ms');

    wrapper.unmount();
  });

  test('keeps chunk boundaries stable and skips expired animations', () => {
    vi.spyOn(performance, 'now').mockReturnValue(1000);

    const wrapper = mount(ChunkRenderer, {
      props: { start: 0, duration: 250, children: 'Complete chunk' },
    });

    expect(wrapper.attributes('data-fluxdown-chunk')).toBe('1');

    expect(wrapper.classes().some((name) => name.includes('active'))).toBe(false);

    expect(wrapper.text()).toBe('Complete chunk');

    wrapper.unmount();
  });

  test('uses pixel widths for the shad mask without changing text flow', async () => {
    const wrapper = mount(ShadRenderer, {
      props: { leading: 'stable ', active: 'tail', isActive: true, maskWidth: 64 },
    });

    const mask = wrapper.get('[aria-hidden="true"]').element as HTMLElement;

    expect(mask.style.width).toBe('64px');

    expect(mask.style.marginLeft).toBe('-64px');

    expect(wrapper.text()).toBe('stable tail');

    await wrapper.setProps({ isActive: false });

    expect(
      wrapper
        .get('[aria-hidden="true"]')
        .classes()
        .some((name) => name.includes('maskHidden')),
    ).toBe(true);

    wrapper.unmount();
  });

  test.each(['cursor', 'dot', 'custom'] as const)('marks %s suffix as decorative', (type) => {
    const wrapper = mount(SuffixRenderer, { props: { type, children: '|' } });

    expect(wrapper.attributes('aria-hidden')).toBe('true');

    expect(wrapper.attributes('data-fluxdown-suffix')).toBe(type);

    expect(wrapper.text()).toBe('|');

    wrapper.unmount();
  });
});
