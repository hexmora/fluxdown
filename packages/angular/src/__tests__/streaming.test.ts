import type { ComponentFixture } from '@angular/core/testing';

import { TestBed } from '@angular/core/testing';
import { PREFIX } from '@fluxdown/angular-plugins/base';
import { afterEach, describe, expect, test, vi } from 'vitest';

import type { FluxdownLiteProps } from '../packs/lite/type';

import { FluxdownLite } from '../packs/lite';
import { createManualTicker, createStepScheduler } from './utils/smooth';

const mount = async (text: string, props: Partial<FluxdownLiteProps> = {}) => {
  const fixture = TestBed.createComponent(FluxdownLite);

  fixture.componentRef.setInput('text', text);

  for (const [name, value] of Object.entries(props)) {
    fixture.componentRef.setInput(name, value);
  }

  fixture.detectChanges();

  await fixture.whenStable();

  return fixture;
};

const update = async (
  fixture: ComponentFixture<FluxdownLite>,
  props: Partial<FluxdownLiteProps>,
) => {
  for (const [name, value] of Object.entries(props)) {
    fixture.componentRef.setInput(name, value);
  }

  fixture.detectChanges();

  await fixture.whenStable();
};

afterEach(() => {
  TestBed.resetTestingModule();

  vi.restoreAllMocks();
});

describe('streaming effects', () => {
  test('animates appends as stable chunk batches without smoothing', async () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(1000);

    const fixture = await mount('Hello', { streaming: { smooth: false, effect: 'chunk' } });

    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-fluxdown-chunk]')).toBeNull();

    await update(fixture, { text: 'Hello world' });

    const chunk = root.querySelector<HTMLElement>('[data-fluxdown-chunk]')!;

    expect(chunk.textContent).toBe(' world');

    expect(chunk.style.getPropertyValue(`--${PREFIX}-chunk-duration`)).toBe('400ms');

    expect(chunk.style.animationDelay).toBe('0ms');

    now.mockReturnValue(1100);

    await update(fixture, { text: 'Hello world! Another chunk.' });

    expect(root.querySelector('[data-fluxdown-chunk]')).toBe(chunk);

    expect(
      Array.from(root.querySelectorAll('[data-fluxdown-chunk]'), (item) => item.textContent),
    ).toEqual([' world', '! Another chunk.']);

    expect(root.textContent).toBe('Hello world! Another chunk.');
  });

  test('resumes chunk timing across inline Markdown reparsing', async () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(1000);

    const fixture = await mount('', { streaming: { smooth: false, effect: 'chunk' } });

    const root = fixture.nativeElement as HTMLElement;

    await update(fixture, { text: 'hello' });

    now.mockReturnValue(1100);

    await update(fixture, { text: '**hello**' });

    expect(root.querySelector('strong')?.textContent).toBe('hello');

    expect(root.querySelector<HTMLElement>('[data-fluxdown-chunk]')?.style.animationDelay).toBe(
      '-100ms',
    );

    now.mockReturnValue(1500);

    await update(fixture, { text: '**hello** next' });

    expect(root.querySelector('strong [data-fluxdown-chunk]')).toBeNull();

    expect(root.querySelector('[data-fluxdown-chunk]')?.textContent).toBe(' next');
  });

  test('scale preserves graphemes and uses the shared blur and growth parameters', async () => {
    vi.spyOn(performance, 'now').mockReturnValue(1000);

    const fixture = await mount('Start', { streaming: { smooth: false, effect: 'scale' } });

    const root = fixture.nativeElement as HTMLElement;

    await update(fixture, { text: 'Start e\u0301 👨‍👩‍👧‍👦 中文' });

    expect(root.textContent).toBe('Start e\u0301 👨‍👩‍👧‍👦 中文');

    const animated = Array.from(root.querySelectorAll('span')).filter((span) => {
      return span.style.getPropertyValue(`--${PREFIX}-scale-duration`);
    });

    expect(animated.length).toBeGreaterThan(0);

    expect(
      animated.every((span) => span.style.getPropertyValue(`--${PREFIX}-scale-blur`) !== ''),
    ).toBe(true);

    expect(animated.map((span) => span.textContent).join('')).toContain('👨‍👩‍👧‍👦');
  });

  test('retains active scale glyphs while appending and restarts changed glyphs', async () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(1000);

    const fixture = await mount('Start', { streaming: { smooth: false, effect: 'scale' } });

    const root = fixture.nativeElement as HTMLElement;

    await update(fixture, { text: 'Start a' });

    const glyph = root.querySelector<HTMLElement>(`.${PREFIX}-effect-scale-root`)!;

    now.mockReturnValue(1050);

    await update(fixture, { text: 'Start ab' });

    expect(root.querySelector(`.${PREFIX}-effect-scale-root`)).toBe(glyph);

    expect(glyph.style.animationDelay).toBe('0ms');

    now.mockReturnValue(1100);

    await update(fixture, { text: 'Start xb' });

    expect(root.querySelector(`.${PREFIX}-effect-scale-root`)).not.toBe(glyph);

    expect(root.textContent).toBe('Start xb');
  });

  test('shad masks only the active tail without duplicating source text', async () => {
    const fixture = await mount('first', { streaming: { smooth: false, effect: 'shad' } });

    const root = fixture.nativeElement as HTMLElement;

    await update(fixture, { text: 'first appended' });

    expect(root.textContent).toBe('first appended');

    const masks = Array.from(root.querySelectorAll<HTMLElement>('[aria-hidden="true"]')).filter(
      (item) => item.style.width !== '',
    );

    expect(masks.length).toBeGreaterThan(0);

    expect(masks.every((item) => item.style.width.endsWith('px'))).toBe(true);
  });

  test.each([
    ['paragraph', 'text', 'p'],
    ['strong', '**text**', 'p'],
    ['heading', '## text', 'h2'],
    ['list item', '- text', 'li'],
    ['code', '```text\nconst text = 1;\n```', 'pre code'],
  ])('places a suffix at the visible end of %s', async (_name, text, selector) => {
    const fixture = await mount(text, { streaming: { smooth: false, effect: 'suffix' } });

    const root = fixture.nativeElement as HTMLElement;

    const marker = root.querySelector('[data-fluxdown-suffix]')!;

    expect(marker.getAttribute('data-fluxdown-suffix')).toBe('cursor');

    expect(marker.parentElement).toBe(root.querySelector(selector));

    expect(marker.nextElementSibling).toBeNull();

    expect(root.querySelectorAll('[data-fluxdown-suffix]')).toHaveLength(1);
  });

  test('moves a suffix between blocks and removes it when streaming stops', async () => {
    const fixture = await mount('first', { streaming: { smooth: false, effect: 'suffix' } });

    const root = fixture.nativeElement as HTMLElement;

    const first = root.querySelector('p')!;

    await update(fixture, {
      text: 'first\n\nsecond',
      streaming: { smooth: false, effect: ['suffix', { type: 'dot' }] },
    });

    expect(root.querySelector('p')).toBe(first);

    expect(first.querySelector('[data-fluxdown-suffix]')).toBeNull();

    expect(root.querySelector('[data-fluxdown-suffix]')?.getAttribute('data-fluxdown-suffix')).toBe(
      'dot',
    );

    await update(fixture, { streaming: false });

    expect(root.querySelector('[data-fluxdown-suffix]')).toBeNull();
  });

  test.each(['scale', 'shad', 'suffix', 'chunk'] as const)(
    'reveals smooth content with %s and destroys its ticker',
    async (effect) => {
      const ticker = createManualTicker();

      const smooth = { enabled: true, ticker: ticker.Ticker, scheduler: createStepScheduler(2) };

      const fixture = await mount('first', { streaming: { smooth, effect } });

      const root = fixture.nativeElement as HTMLElement;

      await update(fixture, { text: 'first\n\n**second**' });

      ticker.current().tick(16);

      fixture.detectChanges();

      expect(root.textContent).toBe('firstse');

      ticker.current().tick(32);

      fixture.detectChanges();

      expect(root.textContent).toBe('firstseco');

      ticker.current().tick(48);

      fixture.detectChanges();

      expect(root.querySelector('strong')?.textContent).toBe('second');

      const instance = ticker.current();

      fixture.destroy();

      expect(instance.destroyCalls).toBe(1);
    },
  );
});
