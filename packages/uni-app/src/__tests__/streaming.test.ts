import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import { FluxdownLite } from '../packs/lite';
import { createManualTicker, createStepScheduler } from './utils/smooth';

describe('streaming lifecycle', () => {
  test('preserves chunk batches without smoothing', async () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(1000);

    const wrapper = mount(FluxdownLite, {
      props: { text: 'Hello', streaming: { smooth: false, effect: 'chunk' } },
    });

    await wrapper.setProps({ text: 'Hello world' });

    const chunk = wrapper.findAll('text').find((node) => node.text() === 'world')!.element;

    expect(chunk.textContent).toBe('world');

    expect(Number(chunk.style.opacity)).toBeLessThan(1);

    now.mockReturnValue(1100);

    await wrapper.setProps({ text: 'Hello world! Another chunk.' });

    expect(wrapper.findAll('text').find((node) => node.text() === 'world')!.element).toBe(chunk);

    expect(wrapper.text().replaceAll('\u00a0', ' ')).toBe('Hello world! Another chunk.');
  });

  test.each(['scale', 'shad', 'suffix', 'chunk'] as const)(
    'keeps Unicode content intact when %s settles',
    async (effect) => {
      const text = 'Start e\u0301 👨‍👩‍👧‍👦 中文';

      const wrapper = mount(FluxdownLite, {
        props: { text: 'Start', streaming: { smooth: false, effect } },
      });

      await wrapper.setProps({ text });

      expect(wrapper.text().replaceAll('\u00a0', ' ')).toContain(text);

      await wrapper.setProps({ streaming: false });

      expect(wrapper.text().replaceAll('\u00a0', ' ')).toBe(text);
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

      await wrapper.setProps({ text: 'first\n\n**second**' });

      ticker.current().tick(16);

      await nextTick();

      expect(wrapper.text().replaceAll('\u00a0', ' ')).toContain('firstse');

      ticker.current().tick(32);

      await nextTick();

      expect(wrapper.text().replaceAll('\u00a0', ' ')).toContain('firstseco');

      ticker.current().tick(48);

      await nextTick();

      expect(wrapper.text().replaceAll('\u00a0', ' ')).toContain('firstsecond');

      const instance = ticker.current();

      wrapper.unmount();

      expect(instance.destroyCalls).toBe(1);
    },
  );
});
