import type { ReactNode } from 'react';

import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { Animated, UIManager } from 'react-native';

import { restoreGlobals, stubGlobal } from '../../../../../../scripts/testing/globals';
import { ChunkRenderer } from '../../../plugins/effect-chunk/slot/effect-chunk/renderer';
import { ScaleRenderer } from '../../../plugins/effect-scale/slot/effect-scale/renderer';
import { ShadRenderer } from '../../../plugins/effect-shad/slot/effect-shad/renderer';
import { SuffixRenderer } from '../../../plugins/effect-suffix/slot/effect-suffix/renderer';
import { InheritedText } from '../../components';

const InlineMath = () => {
  return <InheritedText>E=mc²</InheritedText>;
};

describe('native effects', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();

    jest.restoreAllMocks();

    restoreGlobals();
  });

  test('starts an arriving chunk transparent without waiting for an effect', () => {
    jest.spyOn(performance, 'now').mockReturnValue(1000);

    const markup = renderToString(
      <ChunkRenderer Raw={null} start={1000} duration={400}>
        new arrival
      </ChunkRenderer>,
    );

    expect(markup).toMatch(/color:rgba\(32,33,35,0(?:\.0+)?\)/);
  });

  test('resumes the original chunk easing after reparsing and never replays completed text', () => {
    jest
      .spyOn(Animated, 'timing')
      .mockReturnValue({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() });

    const now = jest.spyOn(performance, 'now').mockReturnValue(1200);

    const view = render(
      <ChunkRenderer Raw={null} start={1000} duration={400}>
        A
      </ChunkRenderer>,
    );

    // CSS ease-out is .6846 at the midpoint; RN Web serializes alpha to two decimals.
    expect(screen.getByText('A')).toHaveStyle({ color: 'rgba(32, 33, 35, 0.69)' });

    view.unmount();

    now.mockReturnValue(1400);

    render(
      <ChunkRenderer Raw={null} start={1000} duration={400}>
        A
      </ChunkRenderer>,
    );

    expect(screen.getByText('A')).toHaveStyle({ color: 'rgb(32, 33, 35)' });

    expect(jest.getTimerCount()).toBe(0);
  });

  test('removes unmeasured attachments when a scale glyph settles', () => {
    let finish: (result: { finished: boolean }) => void;

    jest.spyOn(Animated, 'timing').mockReturnValue({
      start: (callback) => {
        finish = callback!;
      },
      stop: jest.fn(),
      reset: jest.fn(),
    });

    const view = render(
      <ScaleRenderer Raw={null} start={performance.now()} duration={200} from={0} blur={0.08}>
        A
      </ScaleRenderer>,
    );

    const text = screen.getAllByText('A')[0]!;

    expect(text).toHaveStyle({ color: 'rgba(255, 255, 255, 0)' });

    expect(view.container.querySelector('svg')).toBeNull();

    act(() => finish({ finished: true }));

    expect(screen.getAllByText('A')).toHaveLength(1);

    expect(view.container.querySelector('[aria-hidden="true"]')).toBeNull();

    view.unmount();

    expect(jest.getTimerCount()).toBe(0);
  });

  test('keeps unmeasured scale text transparent without flashing a settled glyph', () => {
    jest
      .spyOn(Animated, 'timing')
      .mockReturnValue({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() });

    jest.spyOn(performance, 'now').mockReturnValue(1200);

    render(
      <ScaleRenderer Raw={null} start={1000} duration={400} from={0} blur={0.1}>
        A
      </ScaleRenderer>,
    );

    const glyph = screen.getAllByText('A')[0]!;

    expect(glyph).toHaveStyle({ color: 'rgba(255, 255, 255, 0)' });
  });

  test('continues scale after measurement and repeated renders with the original start', () => {
    let resize: ResizeObserverCallback;

    // RN Web replaces timing with an immediate mock in tests. Exercise its real
    // animation graph so detaching the last derived node cannot stop unnoticed.
    const runtime = jest.requireActual<{ default: typeof Animated }>(
      'react-native-web/dist/vendor/react-native/Animated/AnimatedImplementation',
    ).default;

    jest.spyOn(Animated, 'timing').mockImplementation(runtime.timing);

    stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resize = callback;
        }

        observe() {}

        unobserve() {}

        disconnect() {}
      },
    );

    let measurements = 0;

    jest.spyOn(UIManager, 'measure').mockImplementation((_, callback) => {
      const probe = measurements++ % 3 === 2;

      // Integer offsetLeft can differ from the natural text width even when
      // the attachment itself does not add any width on the web.
      callback(15, 20, probe ? 0 : 16, probe ? 1 : 26, 0, 0);
    });

    const start = performance.now();

    const content = () => {
      return (
        <ScaleRenderer Raw={null} start={start} duration={400} from={0.75} blur={0.2}>
          A
        </ScaleRenderer>
      );
    };

    const view = render(content());

    act(() => jest.advanceTimersByTime(32));

    const measured = screen.getByText('A\u2060');

    const plain = measured.previousElementSibling!;

    const probe = measured.nextElementSibling!;

    act(() =>
      resize(
        [plain, measured, probe].map((target) => ({
          target,
          contentRect: target.getBoundingClientRect(),
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        })),
        {} as ResizeObserver,
      ),
    );

    const deviation = () =>
      Number(view.container.querySelector('feGaussianBlur')?.getAttribute('stdDeviation'));

    expect(deviation()).toBeGreaterThan(0);

    expect(screen.getAllByText('A')[0]).toHaveStyle({ letterSpacing: '0px' });

    for (let index = 0; index < 5; index += 1) {
      const before = deviation();

      view.rerender(content());

      act(() => jest.advanceTimersByTime(32));

      expect(deviation()).toBeLessThan(before);
    }

    act(() => jest.advanceTimersByTime(400));

    expect(view.container.querySelector('svg')).toBeNull();

    expect(screen.getByText('A')).toHaveStyle({ color: 'rgb(32, 33, 35)' });
  });

  test('sizes the zero-width suffix from inherited heading typography', () => {
    const view = render(
      <InheritedText style={{ fontSize: 32, lineHeight: 40, color: 'red' }}>
        Title
        <SuffixRenderer Raw={null} type="cursor" />
      </InheritedText>,
    );

    const marker = view.container.querySelector('[style*="background-color"]');

    const host = marker?.parentElement?.parentElement;

    expect(host).toHaveStyle({ width: '0px' });

    expect(screen.getByText('\u200b\u2060')).toHaveStyle({ lineHeight: '40px', flexShrink: 0 });

    expect(marker).toHaveStyle({
      width: `${(40 * 0.39) / 1.65}px`,
      height: '32px',
      'border-top-left-radius': `${32 * 0.06}px`,
      'background-color': 'rgb(255, 0, 0)',
    });

    expect(view.container.querySelector('svg')).toBeNull();

    view.unmount();

    expect(jest.getTimerCount()).toBe(0);
  });

  test('resumes a shad fade linearly from its own start and settles completed text', () => {
    jest
      .spyOn(Animated, 'timing')
      .mockReturnValue({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() });

    const now = jest.spyOn(performance, 'now').mockReturnValue(1200);

    const view = render(
      <ShadRenderer Raw={null} start={1000} duration={400}>
        A
      </ShadRenderer>,
    );

    expect(screen.getByText('A')).toHaveStyle({ color: 'rgba(32, 33, 35, 0.5)' });

    view.unmount();

    now.mockReturnValue(1400);

    render(
      <ShadRenderer Raw={null} start={1000} duration={400}>
        A
      </ShadRenderer>,
    );

    expect(screen.getByText('A')).toHaveStyle({ color: 'rgb(32, 33, 35)' });

    expect(jest.getTimerCount()).toBe(0);
  });
});
