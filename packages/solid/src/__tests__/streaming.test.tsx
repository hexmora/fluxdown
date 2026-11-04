import { PREFIX } from '@fluxdown/solid-plugins/base';
import { render } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';

import type { StreamingConfig } from '../packs/raw';

import { FluxdownLite } from '../packs/lite';
import { createManualDriver, createStepInterpolator } from './utils/smooth';

describe('streaming effects', () => {
  test.each(['scale', 'chunk'] as const)(
    'keeps %s inline elements attached when neighboring text changes',
    (effect) => {
      const now = vi.spyOn(performance, 'now').mockReturnValue(1000);

      const driver = createManualDriver();

      const [text, setText] = createSignal('');

      const source =
        '# Streaming Markdown\n\nInline **bold** and *italic* text, [links](https://example.com), `code`, 中文 and 👩🏽‍💻. A longer sentence wraps onto another line as its words arrive.\n\n> A second block arrives smoothly.\n\n- One item\n- Another item';

      const { container } = render(() => (
        <FluxdownLite
          text={text()}
          streaming={{
            smooth:
              effect === 'chunk'
                ? false
                : { enabled: true, driver: driver.Driver, interpolation: 'spring' },
            effect,
          }}
        />
      ));

      const observer = new MutationObserver(() => {});

      observer.observe(container, { childList: true, subtree: true });

      const detached: string[] = [];

      for (let frame = 0; frame < 120; frame += 1) {
        const strong = container.querySelector('strong');

        const glyphs = [
          ...container.querySelectorAll<HTMLElement>(`span[style*="${effect}-duration"]`),
        ];

        now.mockReturnValue(1000 + ((frame + 1) * 1000) / 60);

        if (frame < 72 && frame % 4 === 0) {
          setText(source.slice(0, Math.ceil((source.length * (frame + 4)) / 72)));
        }

        if (effect !== 'chunk') {
          driver.current().tick(((frame + 1) * 1000) / 60);
        }

        for (const record of observer.takeRecords()) {
          for (const node of record.removedNodes) {
            const retained = [strong, ...glyphs].find(
              (element) => element?.isConnected && node.contains(element),
            );

            if (retained) {
              detached.push(`${frame}:${retained.tagName}:${retained.textContent}`);
            }
          }
        }
      }

      observer.disconnect();

      expect(container.querySelector('strong')?.textContent).toBe('bold');

      expect(detached).toEqual([]);
    },
  );

  test('animates appends as stable chunk batches without smoothing', () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(1000);

    const [text, setText] = createSignal('Hello');

    const { container } = render(() => (
      <FluxdownLite text={text()} streaming={{ smooth: false, effect: 'chunk' }} />
    ));

    expect(container.querySelector('[data-fluxdown-chunk]')).toBeNull();

    setText('Hello world');

    const chunk = container.querySelector<HTMLElement>('[data-fluxdown-chunk]')!;

    expect(chunk.textContent).toBe(' world');

    expect(chunk.style.getPropertyValue(`--${PREFIX}-chunk-duration`)).toBe('400ms');

    expect(chunk.style.animationDelay).toBe('0ms');

    now.mockReturnValue(1100);

    setText('Hello world! Another chunk.');

    expect(container.querySelector('[data-fluxdown-chunk]')).toBe(chunk);

    expect(
      [...container.querySelectorAll('[data-fluxdown-chunk]')].map((item) => item.textContent),
    ).toEqual([' world', '! Another chunk.']);

    expect(container.textContent).toBe('Hello world! Another chunk.');
  });

  test('resumes chunk timing across inline Markdown reparsing', () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(1000);

    const [text, setText] = createSignal('');

    const { container } = render(() => (
      <FluxdownLite text={text()} streaming={{ smooth: false, effect: 'chunk' }} />
    ));

    setText('hello');

    now.mockReturnValue(1100);

    setText('**hello**');

    expect(container.querySelector('strong')?.textContent).toBe('hello');

    expect(
      container.querySelector<HTMLElement>('[data-fluxdown-chunk]')?.style.animationDelay,
    ).toBe('-100ms');

    now.mockReturnValue(1500);

    setText('**hello** next');

    expect(container.querySelector('strong [data-fluxdown-chunk]')).toBeNull();

    expect(container.querySelector('[data-fluxdown-chunk]')?.textContent).toBe(' next');
  });

  test('scale preserves graphemes and applies the shared blur and growth parameters', () => {
    vi.spyOn(performance, 'now').mockReturnValue(1000);

    const [text, setText] = createSignal('Start');

    const { container } = render(() => (
      <FluxdownLite text={text()} streaming={{ smooth: false, effect: 'scale' }} />
    ));

    setText('Start e\u0301 👨‍👩‍👧‍👦 中文');

    expect(container.textContent).toBe('Start e\u0301 👨‍👩‍👧‍👦 中文');

    const animated = [...container.querySelectorAll('span')].filter((span) =>
      span.style.getPropertyValue(`--${PREFIX}-scale-duration`),
    );

    expect(animated.length).toBeGreaterThan(0);

    expect(
      animated.every((span) => span.style.getPropertyValue(`--${PREFIX}-scale-blur`) !== ''),
    ).toBe(true);

    expect(animated.map((span) => span.textContent).join('')).toContain('👨‍👩‍👧‍👦');
  });

  test('shad fades appended characters on their own clock without duplicating source text', () => {
    vi.spyOn(performance, 'now').mockReturnValue(1000);

    const [text, setText] = createSignal('first');

    const { container } = render(() => (
      <FluxdownLite text={text()} streaming={{ smooth: false, effect: 'shad' }} />
    ));

    expect(container.querySelector('[data-fluxdown-shad]')).toBeNull();

    setText('first appended');

    expect(container.textContent).toBe('first appended');

    const fades = [...container.querySelectorAll<HTMLElement>('[data-fluxdown-shad="fade"]')];

    expect(fades.map((item) => item.textContent).join('')).toBe(' appended');

    expect(
      fades.every((item) =>
        item.style.getPropertyValue(`--${PREFIX}-shad-duration`).endsWith('ms'),
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
    const { container } = render(() => (
      <FluxdownLite text={text} streaming={{ smooth: false, effect: 'suffix' }} />
    ));

    const marker = container.querySelector('[data-fluxdown-suffix]')!;

    expect(marker.getAttribute('data-fluxdown-suffix')).toBe('cursor');

    expect(marker.parentElement).toBe(container.querySelector(selector));

    expect(marker.nextElementSibling).toBeNull();

    expect(container.querySelectorAll('[data-fluxdown-suffix]')).toHaveLength(1);
  });

  test('moves a suffix between blocks and removes it when streaming stops', () => {
    const [text, setText] = createSignal('first');

    const [streaming, setStreaming] = createSignal<boolean | StreamingConfig>({
      smooth: false,
      effect: 'suffix',
    });

    const { container } = render(() => <FluxdownLite text={text()} streaming={streaming()} />);

    const first = container.querySelector('p')!;

    setText('first\n\nsecond');

    expect(container.querySelector('p')).toBe(first);

    expect(first.querySelector('[data-fluxdown-suffix]')).toBeNull();

    setStreaming({ smooth: false, effect: ['suffix', { type: 'dot' }] });

    expect(
      container.querySelector('[data-fluxdown-suffix]')?.getAttribute('data-fluxdown-suffix'),
    ).toBe('dot');

    setStreaming(false);

    expect(container.querySelector('[data-fluxdown-suffix]')).toBeNull();
  });

  test.each(['scale', 'shad', 'suffix', 'chunk'] as const)(
    'reveals smooth content with %s and destroys its driver',
    (effect) => {
      const driver = createManualDriver();

      const smooth = {
        enabled: true,
        driver: driver.Driver,
        interpolation: createStepInterpolator(2),
      };

      const [text, setText] = createSignal('first');

      const { container, unmount } = render(() => (
        <FluxdownLite text={text()} streaming={{ smooth, effect }} />
      ));

      setText('first\n\n**second**');

      driver.current().tick(16);

      expect(container.textContent).toBe('firstse');

      driver.current().tick(32);

      expect(container.textContent).toBe('firstseco');

      driver.current().tick(48);

      expect(container.querySelector('strong')?.textContent).toBe('second');

      const instance = driver.current();

      unmount();

      expect(instance.destroyCalls).toBe(1);
    },
  );
});
