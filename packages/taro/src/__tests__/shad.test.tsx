import { PREFIX } from '@fluxdown/taro-plugins/base';
import { act, cleanup, render } from '@testing-library/react';
import { createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import type { FluxdownRef } from '../packs/full';

import styles from '../../../taro-plugins/src/plugins/effect-shad/slot/effect-shad/renderer/index.module.scss';
import { Fluxdown } from '../packs/full';
import { createManualDriver, createStepInterpolator } from './utils/smooth';

const FADE = '[data-fluxdown-shad="fade"]';

const readFades = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(FADE), (node) => ({
    text: node.textContent,
    duration: node.style.getPropertyValue(`--${PREFIX}-shad-duration`),
    active: node.classList.contains(styles.active!),
  }));

afterEach(async () => {
  cleanup();

  await act(async () => {});

  jest.useRealTimers();
});

describe('Fluxdown shad streaming', () => {
  test('fades appended characters on their own clock and leaves settled text plain', () => {
    jest.useFakeTimers();

    const streaming = { effect: 'shad' as const, smooth: false };

    const view = render(<Fluxdown streaming={streaming} text="abc" />);

    expect(view.container.textContent).toBe('abc');

    expect(readFades(view.container)).toEqual([]);

    view.rerender(<Fluxdown streaming={streaming} text="abcde" />);

    expect(readFades(view.container)).toEqual([{ text: 'de', duration: '400ms', active: true }]);

    act(() => jest.advanceTimersByTime(250));

    view.rerender(<Fluxdown streaming={streaming} text="abcdef" />);

    // 'de' keeps fading from its own start; 'f' begins a new fade.
    expect(readFades(view.container)).toEqual([
      { text: 'de', duration: '400ms', active: true },
      { text: 'f', duration: '400ms', active: true },
    ]);

    act(() => jest.advanceTimersByTime(200));

    view.rerender(<Fluxdown streaming={streaming} text="abcdefg" />);

    expect(readFades(view.container).map(({ text }) => text)).toEqual(['f', 'g']);

    expect(view.container.textContent).toBe('abcdefg');
  });

  test('shortens the fade of a burst that is larger than the fade length', () => {
    jest.useFakeTimers();

    const streaming = { effect: 'shad' as const, smooth: false };

    const view = render(<Fluxdown streaming={streaming} text="a" />);

    view.rerender(<Fluxdown streaming={streaming} text={'a' + 'b'.repeat(40)} />);

    // Forty characters against the default length of ten: a quarter of the default 400 ms.
    expect(readFades(view.container)).toEqual([
      { text: 'b'.repeat(40), duration: '100ms', active: true },
    ]);
  });

  test('supports enablement, length, and duration changes without replacing the core', () => {
    jest.useFakeTimers();

    const ref = createRef<FluxdownRef>();

    const view = render(<Fluxdown ref={ref} text="abc" />);

    const closure = ref.current;

    const shad = (config: { length?: number; duration?: number; enabled?: boolean }) => ({
      effect: ['shad', config] as ['shad', typeof config],
      smooth: false,
    });

    view.rerender(<Fluxdown ref={ref} streaming={shad({ length: 2 })} text="abc" />);

    expect(readFades(view.container)).toEqual([]);

    view.rerender(<Fluxdown ref={ref} streaming={shad({ length: 2 })} text="abcdefgh" />);

    // Five characters against a length of two: two fifths of 400 ms.
    expect(readFades(view.container)).toEqual([{ text: 'defgh', duration: '160ms', active: true }]);

    act(() => jest.advanceTimersByTime(200));

    // A new duration applies to the next batch; characters already fading keep theirs.
    view.rerender(
      <Fluxdown ref={ref} streaming={shad({ length: 2, duration: 1000 })} text="abcdefgh" />,
    );

    view.rerender(
      <Fluxdown ref={ref} streaming={shad({ length: 2, duration: 1000 })} text="abcdefghi" />,
    );

    expect(readFades(view.container)).toEqual([{ text: 'i', duration: '1000ms', active: true }]);

    view.rerender(<Fluxdown ref={ref} streaming={shad({ enabled: false })} text="abcdefghij" />);

    expect(readFades(view.container)).toEqual([]);

    expect(view.container.textContent).toBe('abcdefghij');

    expect(ref.current).toBe(closure);
  });

  test('fades text as smooth ticks reveal it, inside inline markup and only in the growing block', async () => {
    jest.useFakeTimers();

    const driver = createManualDriver();

    const smooth = {
      enabled: true,
      driver: driver.Driver,
      interpolation: createStepInterpolator(2),
    };

    const view = render(<Fluxdown streaming={{ effect: 'shad', smooth }} text="first" />);

    const firstParagraph = view.container.querySelector('[data-tag="p"]');

    view.rerender(<Fluxdown streaming={{ effect: 'shad', smooth }} text={'first\n\n**second**'} />);

    expect(view.container.textContent).toBe('first');

    await act(async () => driver.current().tick(16));

    expect(view.container.textContent).toBe('firstse');

    expect(
      view.container.querySelector('[data-tag="strong"]')?.querySelector(FADE),
    ).toHaveTextContent('se');

    expect(view.container.querySelector('[data-tag="p"]')).toBe(firstParagraph);

    expect(firstParagraph?.querySelector(FADE)).toBeNull();

    act(() => jest.advanceTimersByTime(16));

    await act(async () => driver.current().tick(32));

    expect(view.container.textContent).toBe('firstseco');

    expect(readFades(view.container).map(({ text }) => text)).toEqual(['se', 'co']);
  });

  test('renders full server content without fades', () => {
    const markup = renderToStaticMarkup(
      <Fluxdown streaming={{ effect: 'shad' }} text="Server content" />,
    );

    const container = document.createElement('div');

    container.innerHTML = markup;

    expect(container.textContent).toBe('Server content');

    expect(container.querySelector(FADE)).toBeNull();
  });
});
