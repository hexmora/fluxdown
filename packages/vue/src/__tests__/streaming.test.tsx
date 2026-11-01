import { PREFIX } from '@fluxdown/vue-plugins/base';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import { FluxdownLite } from '../packs/lite';
import { createManualDriver, createStepInterpolator } from './utils/smooth';

describe('streaming effects', () => {
  test('animates appends as stable chunk batches without smoothing', async () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(1000);

    const wrapper = mount(FluxdownLite, {
      props: { text: 'Hello', streaming: { smooth: false, effect: 'chunk' } },
    });

    expect(wrapper.find('[data-fluxdown-chunk]').exists()).toBe(false);

    await wrapper.setProps({ text: 'Hello world' });

    const chunk = wrapper.get('[data-fluxdown-chunk]').element as HTMLElement;

    expect(chunk.textContent).toBe(' world');

    expect(chunk.style.getPropertyValue(`--${PREFIX}-chunk-duration`)).toBe('400ms');

    expect(chunk.style.animationDelay).toBe('0ms');

    now.mockReturnValue(1100);

    await wrapper.setProps({ text: 'Hello world! Another chunk.' });

    expect(wrapper.get('[data-fluxdown-chunk]').element).toBe(chunk);

    expect(wrapper.findAll('[data-fluxdown-chunk]').map((item) => item.text())).toEqual([
      'world',
      '! Another chunk.',
    ]);

    expect(wrapper.text()).toBe('Hello world! Another chunk.');
  });

  test('resumes chunk timing across inline Markdown reparsing', async () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(1000);

    const wrapper = mount(FluxdownLite, {
      props: { text: '', streaming: { smooth: false, effect: 'chunk' } },
    });

    await wrapper.setProps({ text: 'hello' });

    now.mockReturnValue(1100);

    await wrapper.setProps({ text: '**hello**' });

    expect(wrapper.get('strong').text()).toBe('hello');

    expect((wrapper.get('[data-fluxdown-chunk]').element as HTMLElement).style.animationDelay).toBe(
      '-100ms',
    );

    now.mockReturnValue(1500);

    await wrapper.setProps({ text: '**hello** next' });

    expect(wrapper.find('strong [data-fluxdown-chunk]').exists()).toBe(false);

    expect(wrapper.get('[data-fluxdown-chunk]').text()).toBe('next');
  });

  test('scale preserves visible glyphs and uses the shared blur and growth parameters', async () => {
    vi.spyOn(performance, 'now').mockReturnValue(1000);

    const wrapper = mount(FluxdownLite, {
      props: { text: 'Start', streaming: { smooth: false, effect: 'scale' } },
    });

    await wrapper.setProps({ text: 'Start e\u0301 👨‍👩‍👧‍👦 中文' });

    expect(wrapper.text()).toBe('Start e\u0301 👨‍👩‍👧‍👦 中文');

    const animated = wrapper
      .findAll('span')
      .filter((span) =>
        (span.element as HTMLElement).style.getPropertyValue(`--${PREFIX}-scale-duration`),
      );

    expect(animated.length).toBeGreaterThan(0);

    expect(
      animated.every(
        (span) =>
          (span.element as HTMLElement).style.getPropertyValue(`--${PREFIX}-scale-blur`) !== '',
      ),
    ).toBe(true);

    expect(animated.map((span) => span.element.textContent).join('')).toContain('👨‍👩‍👧‍👦');
  });

  test('shad fades appended characters on their own clock without duplicating source text', async () => {
    vi.spyOn(performance, 'now').mockReturnValue(1000);

    const wrapper = mount(FluxdownLite, {
      props: { text: 'first', streaming: { smooth: false, effect: 'shad' } },
    });

    expect(wrapper.find('[data-fluxdown-shad]').exists()).toBe(false);

    await wrapper.setProps({ text: 'first appended' });

    expect(wrapper.text()).toBe('first appended');

    const fades = wrapper.findAll('[data-fluxdown-shad="fade"]');

    expect(fades.map((item) => item.text()).join('')).toBe('appended');

    expect(
      fades.every((item) =>
        (item.element as HTMLElement).style
          .getPropertyValue(`--${PREFIX}-shad-duration`)
          .endsWith('ms'),
      ),
    ).toBe(true);
  });

  test.each([
    ['paragraph', 'text', 'p'],
    ['strong', '**text**', 'p'],
    ['heading', '## text', 'h2'],
    ['list item', '- text', 'li'],
    ['code', '```text\nconst text = 1;\n```', 'pre code'],
  ])('places a suffix at the visible end of %s', (_name, text, selector) => {
    const wrapper = mount(FluxdownLite, {
      props: { text, streaming: { smooth: false, effect: 'suffix' } },
    });

    const marker = wrapper.get('[data-fluxdown-suffix]');

    expect(marker.attributes('data-fluxdown-suffix')).toBe('cursor');

    expect(marker.element.parentElement).toBe(wrapper.get(selector).element);

    expect(marker.element.nextElementSibling).toBeNull();

    expect(wrapper.findAll('[data-fluxdown-suffix]')).toHaveLength(1);
  });

  test('moves a suffix between blocks and removes it when streaming stops', async () => {
    const wrapper = mount(FluxdownLite, {
      props: { text: 'first', streaming: { smooth: false, effect: 'suffix' } },
    });

    const first = wrapper.get('p').element;

    await wrapper.setProps({
      text: 'first\n\nsecond',
      streaming: { smooth: false, effect: ['suffix', { type: 'dot' }] },
    });

    expect(wrapper.get('p').element).toBe(first);

    expect(first.querySelector('[data-fluxdown-suffix]')).toBeNull();

    expect(wrapper.get('[data-fluxdown-suffix]').attributes('data-fluxdown-suffix')).toBe('dot');

    await wrapper.setProps({ streaming: false });

    expect(wrapper.find('[data-fluxdown-suffix]').exists()).toBe(false);
  });

  test.each(['scale', 'shad', 'suffix', 'chunk'] as const)(
    'reveals smooth content with %s and destroys its driver',
    async (effect) => {
      const driver = createManualDriver();

      const smooth = {
        enabled: true,
        driver: driver.Driver,
        interpolation: createStepInterpolator(2),
      };

      const wrapper = mount(FluxdownLite, {
        props: { text: 'first', streaming: { smooth, effect } },
      });

      await wrapper.setProps({ text: 'first\n\n**second**' });

      driver.current().tick(16);

      await nextTick();

      expect(wrapper.text()).toBe('firstse');

      driver.current().tick(32);

      await nextTick();

      expect(wrapper.text()).toBe('firstseco');

      driver.current().tick(48);

      await nextTick();

      expect(wrapper.get('strong').text()).toBe('second');

      const instance = driver.current();

      wrapper.unmount();

      expect(instance.destroyCalls).toBe(1);
    },
  );
});
