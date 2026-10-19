import { Scale } from '@fluxdown/core-presets/mapper';
import { PREFIX } from '@fluxdown/react-presets/base';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MutableState, toClosure } from 'stative';

import type { FluxdownRef } from '../types';

import { Fluxdown } from '..';
import styles from '../../../react-presets/src/render/scale/renderer/index.module.scss';
import shadStyles from '../../../react-presets/src/render/shad/renderer/index.module.scss';
import { createManualTicker, createStepScheduler } from './utils/smooth';

beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ['queueMicrotask'] });

  jest.spyOn(performance, 'now').mockReturnValue(1000);
});

afterEach(async () => {
  cleanup();

  await act(async () => {});

  jest.restoreAllMocks();

  jest.useRealTimers();
});

describe('Fluxdown scale streaming', () => {
  test('keeps initial text settled and preserves character elements as text is appended', () => {
    const view = render(<Fluxdown streaming={{ smooth: false, effect: 'scale' }} text="Hello" />);

    expect(view.container.querySelector(`.${styles.active}`)).toBeNull();

    view.rerender(<Fluxdown streaming={{ smooth: false, effect: 'scale' }} text="Hello world" />);

    const characters = view.container.querySelectorAll(`.${styles.active}`);

    expect(Array.from(characters, (node) => node.textContent)).toEqual(['w', 'o', 'r', 'l', 'd']);

    expect(characters[0]).toHaveStyle({
      [`--${PREFIX}-scale-duration`]: '200ms',
      [`--${PREFIX}-scale-from`]: '0',
      [`--${PREFIX}-scale-blur`]: '0.08em',
    });

    jest.mocked(performance.now).mockReturnValue(1050);

    view.rerender(<Fluxdown streaming={{ smooth: false, effect: 'scale' }} text="Hello worlds" />);

    expect(view.container.querySelector(`.${styles.active}`)).toBe(characters[0]);

    expect(view.container.textContent).toBe('Hello worlds');

    expect(view.container.querySelectorAll(`.${styles.active}`)).toHaveLength(6);

    expect(jest.getTimerCount()).toBe(0);
  });

  test('animates newly revealed Smooth output while preserving completed blocks and inline markup', () => {
    const ticker = createManualTicker();

    const smooth = { enabled: true, ticker: ticker.Ticker, scheduler: createStepScheduler(2) };

    const view = render(<Fluxdown streaming={{ smooth, effect: 'scale' }} text="first" />);

    const first = view.container.querySelector('p');

    view.rerender(
      <Fluxdown streaming={{ smooth, effect: 'scale' }} text={'first\n\n**second**'} />,
    );

    expect(view.container.textContent).toBe('first');

    expect(view.container.querySelector(`.${styles.active}`)).toBeNull();

    act(() => ticker.current().tick(16));

    expect(view.container.textContent).toBe('firstse');

    expect(view.container.querySelector('strong')).toHaveTextContent('se');

    expect(view.container.querySelectorAll(`.${styles.active}`)).toHaveLength(2);

    const character = view.container.querySelector(`.${styles.active}`);

    jest.mocked(performance.now).mockReturnValue(1016);

    act(() => ticker.current().tick(32));

    expect(view.container.textContent).toBe('firstseco');

    expect(view.container.querySelector(`.${styles.active}`)).toBe(character);

    expect(view.container.querySelector('p')).toBe(first);

    expect(first?.querySelector(`.${styles.active}`)).toBeNull();
  });

  test('preserves Unicode graphemes and leaves code contents opaque', () => {
    const view = render(<Fluxdown streaming={{ smooth: false, effect: 'scale' }} text="" />);

    view.rerender(
      <Fluxdown
        streaming={{ smooth: false, effect: 'scale' }}
        text={'**👨‍👩‍👧‍👦 e\u0301 中文** `code`'}
      />,
    );

    expect(view.container.querySelector('strong')).toHaveTextContent('👨‍👩‍👧‍👦 e\u0301 中文');

    expect(
      Array.from(view.container.querySelectorAll(`.${styles.active}`), (node) => node.textContent),
    ).toEqual(['👨‍👩‍👧‍👦', 'e\u0301', '中', '文']);

    expect(view.container.querySelector('code')).toHaveTextContent('code');

    expect(view.container.querySelector('code')?.querySelector(`.${styles.glyph}`)).toBeNull();
  });

  test.each(['scale-first', 'shad-first'] as const)('composes scale and shad with %s', (order) => {
    const effect =
      order === 'scale-first' ? (['scale', 'shad'] as const) : (['shad', 'scale'] as const);

    const view = render(<Fluxdown streaming={{ smooth: false, effect: [...effect] }} text="a" />);

    view.rerender(<Fluxdown streaming={{ smooth: false, effect: [...effect] }} text="abc" />);

    expect(view.container.textContent).toBe('abc');

    expect(view.container.querySelectorAll(`.${styles.glyph}`)).not.toHaveLength(0);

    expect(view.container.querySelector(`.${shadStyles.mask}`)).not.toBeNull();
  });

  test('updates tuple configuration and restarts from settled content after disabling', async () => {
    const ref = createRef<FluxdownRef>();

    const view = render(
      <Fluxdown ref={ref} streaming={{ smooth: false, effect: 'scale' }} text="a" />,
    );

    const core = ref.current;

    view.rerender(<Fluxdown ref={ref} streaming={{ smooth: false, effect: 'scale' }} text="ab" />);

    const character = view.container.querySelector(`.${styles.active}`);

    view.rerender(
      <Fluxdown
        ref={ref}
        streaming={{ smooth: false, effect: ['scale', { duration: 400, from: 0.5, blur: 0.12 }] }}
        text="ab"
      />,
    );

    expect(view.container.querySelector(`.${styles.active}`)).toBe(character);

    expect(character).toHaveStyle({
      [`--${PREFIX}-scale-duration`]: '400ms',
      [`--${PREFIX}-scale-from`]: '0.5',
      [`--${PREFIX}-scale-blur`]: '0.12em',
    });

    view.rerender(<Fluxdown ref={ref} streaming={{ smooth: false, effect: false }} text="abc" />);

    expect(view.container.querySelector(`.${styles.active}`)).toBeNull();

    view.rerender(<Fluxdown ref={ref} streaming={{ smooth: false, effect: 'scale' }} text="abc" />);

    expect(view.container.querySelector(`.${styles.active}`)).toBeNull();

    view.rerender(
      <Fluxdown ref={ref} streaming={{ smooth: false, effect: 'scale' }} text="abcd" />,
    );

    await waitFor(() =>
      expect(view.container.querySelector(`.${styles.active}`)).toHaveTextContent('d'),
    );

    expect(ref.current).toBe(core);
  });

  test('accepts the Scale mapper with readable config and releases its ticker when removed', async () => {
    const enabled = MutableState.of(true);

    const duration = MutableState.of(200);

    const options = { enabled: toClosure(enabled), duration: toClosure(duration) };

    const ticker = createManualTicker();

    const smooth = { enabled: true, ticker: ticker.Ticker, scheduler: createStepScheduler(1) };

    const view = render(<Fluxdown streaming={{ smooth, effect: [Scale, options] }} text="a" />);

    view.rerender(<Fluxdown streaming={{ smooth, effect: [Scale, options] }} text="abc" />);

    act(() => ticker.current().tick(16));

    expect(view.container.querySelector(`.${styles.active}`)).toHaveTextContent('b');

    act(() => duration.next(350));

    expect(view.container.querySelector(`.${styles.active}`)).toHaveStyle({
      [`--${PREFIX}-scale-duration`]: '350ms',
    });

    act(() => enabled.next(false));

    expect(view.container.querySelector(`.${styles.active}`)).toBeNull();

    const instance = ticker.current();

    view.unmount();

    await act(async () => {});

    expect(instance.destroyCalls).toBe(1);

    expect(enabled.closed).toBe(false);

    expect(duration.closed).toBe(false);

    enabled.destroy();

    duration.destroy();
  });

  test('renders full server content without active character wrappers or animation timers', () => {
    const timers = jest.getTimerCount();

    const markup = renderToStaticMarkup(
      <Fluxdown streaming={{ effect: 'scale' }} text="Server **content** 👋" />,
    );

    const container = document.createElement('div');

    container.innerHTML = markup;

    expect(container.textContent).toBe('Server content 👋');

    expect(container.querySelector('strong')).toHaveTextContent('content');

    expect(container.querySelector(`.${styles.active}`)).toBeNull();

    expect(jest.getTimerCount()).toBe(timers);
  });
});
