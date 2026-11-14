import { act, cleanup, render } from '@testing-library/react';
import { createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import type { FluxdownRef, StreamingConfig } from '../packs/full';

import styles from '../../../react-plugins/src/plugins/effect-shad/slot/effect-shad/renderer/index.module.scss';
import { Fluxdown } from '../packs/full';
import { createManualTicker, createStepScheduler } from './utils/smooth';

afterEach(async () => {
  cleanup();

  await act(async () => {});

  jest.useRealTimers();
});

describe('Fluxdown shad streaming', () => {
  test('leaves initial content unfaded and hides the mask again after appended text settles', async () => {
    jest.useFakeTimers();

    const view = render(<Fluxdown streaming={{ effect: 'shad', smooth: false }} text="abc" />);

    expect(view.container.textContent).toBe('abc');

    expect(view.container.querySelector(`.${styles.active}`)).toHaveTextContent('');

    expect(view.container.querySelector(`.${styles.mask}`)).toBeNull();

    view.rerender(
      <Fluxdown streaming={{ effect: 'shad', smooth: false }} text="abcdefghijklmnop" />,
    );

    expect(view.container.textContent).toBe('abcdefghijklmnop');

    expect(view.container.querySelector(`.${styles.active}`)).toHaveTextContent('ghijklmnop');

    expect(view.container.querySelector(`.${styles.mask}`)).toHaveStyle({
      maskImage: `linear-gradient(to right, #000, transparent), linear-gradient(to right, #000 max(0px, calc(100% - 15px)), transparent)`,
    });

    expect(view.container.querySelector(`.${styles.mask}`)).toHaveTextContent('ghijklmnop');

    expect(view.container.querySelector(`.${styles.mask}`)).not.toHaveAttribute('aria-hidden');

    expect(view.container.firstElementChild?.getAttribute('style')).not.toContain('shad');

    await act(async () => jest.advanceTimersByTime(200));

    expect(view.container.textContent).toBe('abcdefghijklmnop');

    expect(view.container.querySelector(`.${styles.active}`)).toHaveTextContent('');

    expect(view.container.querySelector(`.${styles.mask}`)).toBeNull();
  });

  test.each([
    { maskWidth: undefined, expected: 15 },
    { maskWidth: NaN, expected: 15 },
    { maskWidth: Infinity, expected: 15 },
    { maskWidth: -10, expected: 0 },
    { maskWidth: 0, expected: 0 },
    { maskWidth: 24.5, expected: 24.5 },
  ])('keeps maskWidth=$maskWidth local to the mask', ({ maskWidth, expected }) => {
    jest.useFakeTimers();

    const streaming: StreamingConfig = { effect: ['shad', { maskWidth }], smooth: false };

    const view = render(<Fluxdown streaming={streaming} text="a" />);

    view.rerender(<Fluxdown streaming={streaming} text="abc" />);

    expect(view.container.querySelector(`.${styles.mask}`)).toHaveStyle({
      maskImage: `linear-gradient(to right, #000, transparent), linear-gradient(to right, #000 max(0px, calc(100% - ${expected}px)), transparent)`,
    });

    expect(view.container.firstElementChild?.getAttribute('style')).not.toContain('shad');
  });

  test('supports enablement, tail length, and mask width changes without replacing the core', () => {
    jest.useFakeTimers();

    const ref = createRef<FluxdownRef>();

    const view = render(<Fluxdown ref={ref} text="abc" />);

    const closure = ref.current;

    expect(view.container.querySelector(`.${styles.active}`)).toBeNull();

    view.rerender(
      <Fluxdown
        ref={ref}
        streaming={{ effect: ['shad', { length: 2, maskWidth: 24 }], smooth: false }}
        text="abc"
      />,
    );

    expect(view.container.querySelector(`.${styles.active}`)).toHaveTextContent('');

    view.rerender(
      <Fluxdown
        ref={ref}
        streaming={{ effect: ['shad', { length: 2, maskWidth: 24 }], smooth: false }}
        text="abcdefgh"
      />,
    );

    expect(view.container.querySelector(`.${styles.active}`)).toHaveTextContent('gh');

    expect(view.container.querySelector(`.${styles.mask}`)).toHaveStyle({
      maskImage: `linear-gradient(to right, #000, transparent), linear-gradient(to right, #000 max(0px, calc(100% - 24px)), transparent)`,
    });

    const active = view.container.querySelector(`.${styles.active}`);

    view.rerender(
      <Fluxdown
        ref={ref}
        streaming={{ effect: ['shad', { length: 2, maskWidth: 10 }], smooth: false }}
        text="abcdefgh"
      />,
    );

    expect(view.container.querySelector(`.${styles.mask}`)).toHaveStyle({
      maskImage: `linear-gradient(to right, #000, transparent), linear-gradient(to right, #000 max(0px, calc(100% - 10px)), transparent)`,
    });

    expect(view.container.querySelector(`.${styles.active}`)).toBe(active);

    view.rerender(
      <Fluxdown
        ref={ref}
        streaming={{ effect: ['shad', { length: 4, maskWidth: 0 }], smooth: false }}
        text="abcdefgh"
      />,
    );

    expect(view.container.querySelector(`.${styles.active}`)).toHaveTextContent('efgh');

    expect(view.container.querySelector(`.${styles.mask}`)).toHaveStyle({
      maskImage: `linear-gradient(to right, #000, transparent), linear-gradient(to right, #000 max(0px, calc(100% - 0px)), transparent)`,
    });

    view.rerender(
      <Fluxdown
        ref={ref}
        streaming={{ effect: ['shad', { enabled: false }], smooth: false }}
        text="abcdefgh"
      />,
    );

    expect(view.container.querySelector(`.${styles.active}`)).toBeNull();

    expect(view.container.textContent).toBe('abcdefgh');

    view.rerender(
      <Fluxdown ref={ref} streaming={{ effect: 'shad', smooth: false }} text="abcdefgh" />,
    );

    expect(view.container.querySelector(`.${styles.mask}`)).toBeNull();

    expect(ref.current).toBe(closure);
  });

  test('fades revealed text from smooth ticks while preserving inline markup and completed blocks', async () => {
    jest.useFakeTimers();

    const ticker = createManualTicker();

    const smooth = {
      enabled: true,
      ticker: ticker.Ticker,
      scheduler: createStepScheduler(2),
    };

    const view = render(<Fluxdown streaming={{ effect: 'shad', smooth }} text="first" />);

    const firstParagraph = view.container.querySelector('p');

    view.rerender(<Fluxdown streaming={{ effect: 'shad', smooth }} text={'first\n\n**second**'} />);

    expect(view.container.textContent).toBe('first');

    await act(async () => ticker.current().tick(16));

    expect(view.container.textContent).toBe('firstse');

    expect(view.container.querySelector(`.${styles.active}`)).toHaveTextContent('se');

    expect(view.container.querySelector('strong')).toHaveTextContent('se');

    expect(view.container.querySelector('p')).toBe(firstParagraph);

    expect(firstParagraph?.querySelector(`.${styles.active}`)).toBeNull();

    await act(async () => ticker.current().tick(32));

    expect(view.container.textContent).toBe('firstseco');

    expect(view.container.querySelector(`.${styles.active}`)).toHaveTextContent('seco');

    await act(async () => ticker.current().tick(48));

    expect(view.container.textContent).toBe('firstsecond');

    await act(async () => jest.advanceTimersByTime(200));

    expect(view.container.querySelector(`.${styles.mask}`)).toBeNull();
  });

  test('renders full server content without an active fade or timers', () => {
    jest.useFakeTimers();

    const timers = jest.getTimerCount();

    const markup = renderToStaticMarkup(
      <Fluxdown streaming={{ effect: 'shad' }} text="Server content" />,
    );

    const container = document.createElement('div');

    container.innerHTML = markup;

    expect(container.textContent).toBe('Server content');

    expect(container.querySelector(`.${styles.mask}`)).toBeNull();

    expect(container.querySelector(`.${styles.active}`)).toHaveTextContent('');

    expect(jest.getTimerCount()).toBe(timers);
  });

  test.each([
    { prefix: '> ', selector: 'blockquote > p' },
    { prefix: '> > ', selector: 'blockquote > blockquote > p' },
    { prefix: '> - ', selector: 'blockquote > ul > li' },
    { prefix: '> ## ', selector: 'blockquote > h2' },
  ])('fades new text inside $selector without hiding its content', async ({ prefix, selector }) => {
    jest.useFakeTimers();

    const streaming: StreamingConfig = { effect: ['shad', { length: 20 }], smooth: false };
    const view = render(<Fluxdown streaming={streaming} text={`${prefix}Start `} />);

    view.rerender(
      <Fluxdown streaming={streaming} text={`${prefix}Start *soft* **strong** tail`} />,
    );

    const container = view.container.querySelector(selector);
    const active = container?.querySelector(`.${styles.mask}`);

    expect(active).toHaveTextContent('soft strong tail');
    expect(active).not.toHaveAttribute('aria-hidden');
    expect(active?.querySelector('em')).toHaveTextContent('soft');
    expect(active?.querySelector('strong')).toHaveTextContent('strong');

    await act(async () => jest.advanceTimersByTime(200));

    expect(container).toHaveTextContent('Start soft strong tail');
    expect(container?.querySelector(`.${styles.mask}`)).toBeNull();
  });

  test.each([
    { initial: '> `code', appended: '> `code grows`', selector: 'blockquote code' },
    {
      initial: '> ```text\n> code',
      appended: '> ```text\n> code grows\n> ```',
      selector: 'blockquote pre code',
    },
  ])('keeps $selector unshaded as its text grows', ({ initial, appended, selector }) => {
    jest.useFakeTimers();

    const streaming: StreamingConfig = { effect: 'shad', smooth: false };
    const view = render(<Fluxdown streaming={streaming} text={initial} />);

    view.rerender(<Fluxdown streaming={streaming} text={appended} />);

    expect(view.container.querySelector(selector)).toHaveTextContent('code grows');
    expect(view.container.querySelector(`.${styles.mask}`)).toBeNull();
  });
});
