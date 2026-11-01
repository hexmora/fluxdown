import { EffectSuffixSlotPlugin } from '@fluxdown/uni-app-plugins/plugins/effect-suffix';
import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import { FluxdownLite } from '../packs/lite';
import { createManualTicker, createStepScheduler } from './utils/smooth';
import { getText } from './utils/text';

describe('streaming lifecycle', () => {
  test('keeps the cursor breathing while unsmoothed chunks continue arriving', async () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(1000);

    const frames = new Map<number, FrameRequestCallback>();

    let id = 0;

    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => {
      id += 1;

      frames.set(id, callback);

      return id;
    });

    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation((frame) => {
      frames.delete(frame);
    });

    const tick = async (time: number) => {
      now.mockReturnValue(time);

      const scheduled = [...frames.values()];

      frames.clear();

      scheduled.forEach((callback) => callback(time));

      await flushPromises();
    };

    const wrapper = mount(FluxdownLite, {
      props: { text: 'One.', streaming: { smooth: false, effect: ['chunk', 'suffix'] } },
    });

    await flushPromises();

    const Component = new EffectSuffixSlotPlugin().Component;

    const cursor = wrapper.getComponent(Component);

    const instance = cursor.vm.$;

    const marker = cursor.get('.fluxdown-suffix').element.firstElementChild as HTMLElement;

    const append = async (time: number, text: string) => {
      now.mockReturnValue(time);

      await wrapper.setProps({ text });

      await flushPromises();

      const current = wrapper.getComponent(Component);

      expect(current.vm.$).toBe(instance);

      expect(current.get('.fluxdown-suffix').element.firstElementChild).toBe(marker);

      expect(getText(wrapper.element)).toBe(text);
    };

    expect(marker.style.opacity).toBe('1');

    await append(1240, 'One. First');

    await tick(1400);

    expect(Number(marker.style.opacity)).toBeGreaterThan(0);

    expect(Number(marker.style.opacity)).toBeLessThan(1);

    await append(1480, 'One. First second');

    await tick(1500);

    expect(marker.style.opacity).toBe('0');

    await append(1720, 'One. First second third');

    await tick(1800);

    expect(marker.style.opacity).toBe('0');

    await tick(1900);

    expect(Number(marker.style.opacity)).toBeGreaterThan(0);

    expect(Number(marker.style.opacity)).toBeLessThan(1);

    await append(1960, 'One. First second third fourth.');

    await tick(2000);

    expect(marker.style.opacity).toBe('1');

    wrapper.unmount();

    expect(frames.size).toBe(0);
  });

  test('preserves chunk batches without smoothing', async () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(1000);

    const wrapper = mount(FluxdownLite, {
      props: { text: 'Hello', streaming: { smooth: false, effect: 'chunk' } },
    });

    await flushPromises();

    await wrapper.setProps({ text: 'Hello world' });

    const chunk = wrapper
      .findAll('text')
      .find((node) => getText(node.element) === 'world')!.element;

    expect(getText(chunk)).toBe('world');

    expect(chunk.parentElement?.style.opacity).toBe('0');

    const glyph = chunk
      .closest('.fluxdown-inline-text')!
      .querySelector<HTMLElement>(
        '.fluxdown-inline-text__effect .fluxdown-scale-text__placeholder text',
      )!;

    expect(Number(glyph.style.opacity)).toBeLessThan(1);

    now.mockReturnValue(1100);

    await wrapper.setProps({ text: 'Hello world! Another chunk.' });

    expect(wrapper.findAll('text').some((node) => node.element === chunk)).toBe(true);

    expect(getText(chunk)).toContain('world');

    expect(getText(wrapper.element)).toBe('Hello world! Another chunk.');
  });

  test.each(['scale', 'shad', 'suffix', 'chunk'] as const)(
    'keeps Unicode content intact when %s settles',
    async (effect) => {
      const text = 'Start e\u0301 👨‍👩‍👧‍👦 中文';

      const wrapper = mount(FluxdownLite, {
        props: { text: 'Start', streaming: { smooth: false, effect } },
      });

      await flushPromises();

      await wrapper.setProps({ text });

      expect(getText(wrapper.element)).toContain(text);

      await wrapper.setProps({ streaming: false });

      expect(getText(wrapper.element)).toBe(text);
    },
  );

  test.each(['scale', 'shad', 'suffix'] as const)(
    'reveals smooth content with %s and destroys its ticker',
    async (effect) => {
      const ticker = createManualTicker();

      const smooth = { enabled: true, ticker: ticker.Ticker, scheduler: createStepScheduler(2) };

      const wrapper = mount(FluxdownLite, {
        props: { text: 'first', streaming: { smooth, effect } },
      });

      await flushPromises();

      await wrapper.setProps({ text: 'first\n\n**second**' });

      ticker.current().tick(16);

      await flushPromises();

      expect(getText(wrapper.element)).toContain('firstse');

      ticker.current().tick(32);

      await nextTick();

      expect(getText(wrapper.element)).toContain('firstseco');

      ticker.current().tick(48);

      await nextTick();

      expect(getText(wrapper.element)).toContain('firstsecond');

      const instance = ticker.current();

      wrapper.unmount();

      expect(instance.destroyCalls).toBe(1);
    },
  );
});
