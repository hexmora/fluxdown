import type { ReactNode } from 'react';

import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { Animated, UIManager } from 'react-native';

import { restoreGlobals, stubGlobal } from '../../../../../../scripts/testing/globals';
import { ChunkRenderer } from '../../../plugins/effect-chunk/slot/effect-chunk/renderer';
import { ScaleRenderer } from '../../../plugins/effect-scale/slot/effect-scale/renderer';
import { ShadRenderer } from '../../../plugins/effect-shad/slot/effect-shad/renderer';
import {
  getGradient,
  getShadTokens,
  getText,
  sliceText,
} from '../../../plugins/effect-shad/slot/effect-shad/renderer/utils';
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

  test('preserves the settled prefix while unmeasured active text waits for its gradient', () => {
    const view = render(
      <InheritedText>
        <ShadRenderer
          Raw={null}
          leading="An unfinished wo"
          active="rd 跨过行尾"
          isActive
          maskWidth={15}
        />
      </InheritedText>,
    );

    expect(screen.getAllByText('wo')[0]).toHaveStyle({ color: 'rgb(32, 33, 35)' });

    expect(screen.getAllByText('rd')[0]).toHaveStyle({ color: 'rgba(255, 255, 255, 0)' });

    expect(screen.getAllByText('跨')[0]).toHaveStyle({ color: 'rgba(255, 255, 255, 0)' });

    expect(screen.getAllByText('尾')[0]).toHaveStyle({ color: 'rgba(255, 255, 255, 0)' });

    expect(view.container.querySelector('svg')).toBeNull();
  });

  test('native shading keeps words whole across leading, active, and style boundaries', () => {
    const content = getShadTokens(
      <>
        Before <InheritedText style={{ fontWeight: '700' }}>wo</InheritedText>
      </>,
      <>rd 中👩‍💻é</>,
    );

    expect(getText(content.leading)).toBe('Before ');

    expect(content.tokens.map(({ text }) => text)).toEqual(['word', ' ', '中', '👩‍💻é']);

    expect(content.tokens[0]?.prefixText).toBe('wo');

    const view = render(<InheritedText>{content.tokens[0]?.children}</InheritedText>);

    expect(view.container.textContent).toBe('word');

    expect(screen.getByText('wo')).toHaveStyle({ fontWeight: '700' });
  });

  test('native shading preserves opaque leading content once and keeps CJK punctuation together', () => {
    const content = getShadTokens(
      <>
        Before <InlineMath /> 中文
      </>,
      <>，（下一段） 👨‍👩‍👧‍👦</>,
    );

    const view = render(
      <InheritedText>
        {content.leading}
        {content.tokens.map(({ children }) => children)}
      </InheritedText>,
    );

    expect(view.container.textContent).toBe('Before E=mc² 中文，（下一段） 👨‍👩‍👧‍👦');

    expect(screen.getAllByText('E=mc²')).toHaveLength(1);

    expect(content.tokens.map(({ text }) => text)).toEqual([
      '文，',
      '（下',
      '一',
      '段）',
      ' ',
      '👨‍👩‍👧‍👦',
    ]);
  });

  test('does not mount empty word trees outside a shaded slice and preserves opaque leading nodes', () => {
    let renders = 0;

    const Word = ({ children }: { children?: ReactNode }) => {
      renders += 1;

      return <InheritedText style={{ fontWeight: '700' }}>{children}</InheritedText>;
    };

    const words = Array.from({ length: 40 }, (_, index) => `word-${index} `);

    const opaqueChildren: ReactNode[] = [null, false, [null], [false]];

    const content = (
      <>
        {words.map((word) => (
          <Word key={word}>{word}</Word>
        ))}
        {opaqueChildren.map((children, index) => (
          <InheritedText key={index} testID={`empty-opaque-${index}`}>
            {children}
          </InheritedText>
        ))}
        <InlineMath />
      </>
    );

    const end = words.join('').length;

    const start = end - words.at(-1)!.length;

    const view = render(<InheritedText>{sliceText(content, start, end, true)}</InheritedText>);

    expect(renders).toBe(1);

    expect(screen.getByText('word-39')).toHaveStyle({ fontWeight: '700' });

    for (const index of opaqueChildren.keys()) {
      expect(screen.getByTestId(`empty-opaque-${index}`)).toBeInTheDocument();
    }

    expect(screen.getAllByText('E=mc²')).toHaveLength(1);

    view.rerender(<InheritedText>{sliceText(content, start, end)}</InheritedText>);

    for (const index of opaqueChildren.keys()) {
      expect(screen.queryByTestId(`empty-opaque-${index}`)).toBeNull();
    }

    expect(screen.queryByText('E=mc²')).toBeNull();
  });

  test('native gradient coordinates use measured widths, including the unshaded word prefix', () => {
    const { tokens } = getShadTokens('wo', 'rd中');

    const measurements = {
      'word-0': { width: 38, prefix: 19 },
      'word-4': { width: 16, prefix: 0 },
    };

    expect(getGradient(tokens, measurements, 'word-0')).toEqual({ start: 19, width: 35 });

    expect(getGradient(tokens, measurements, 'word-4')).toEqual({ start: -19, width: 35 });

    expect(getGradient(tokens, {}, 'word-0')).toBeNull();

    expect(getGradient(getShadTokens('wo', 'rd字').tokens, measurements, 'word-4')).toEqual({
      start: -19,
      width: 35,
    });

    expect(getShadTokens('', '').tokens).toEqual([]);
  });

  test('retains measured gradients while an appended token or word is waiting for layout', () => {
    const measurement = { width: 38, prefix: 19 };

    const { tokens } = getShadTokens('wo', 'rd中');

    expect(getGradient(tokens, { 'word-0': measurement }, 'word-0')).toEqual({
      start: 19,
      width: 19,
    });

    expect(getGradient(tokens, { 'word-0': measurement }, 'word-4')).toBeNull();

    const appended = getShadTokens('wo', 'rds').tokens;

    expect(getGradient(appended, { 'word-0': measurement }, 'word-0')).toEqual({
      start: 19,
      width: 19,
    });

    expect(getGradient(appended, { 'word-0': { ...measurement, width: 48 } }, 'word-0')).toEqual({
      start: 19,
      width: 29,
    });
  });

  test('uses only the current token prefix and accepts zero-sized native measurements', () => {
    const plain = getShadTokens('', 'word').tokens;

    expect(getGradient(plain, { 'word-0': { width: 38, prefix: 19 } }, 'word-0')).toEqual({
      start: 0,
      width: 38,
    });

    expect(getGradient(plain, { 'word-0': { width: 0 } }, 'word-0')).toEqual({
      start: 0,
      width: 0,
    });

    const partial = getShadTokens('wo', 'rd').tokens;

    expect(getGradient(partial, { 'word-0': { width: 38 } }, 'word-0')).toBeNull();

    expect(getGradient(partial, { 'word-0': { width: 38, prefix: 0 } }, 'word-0')).toEqual({
      start: 0,
      width: 38,
    });
  });

  test('accumulates measured spaces in content order independently of drawing slot names', () => {
    const { tokens } = getShadTokens('', ' word');

    const measurements = { 'space-0': { width: 5 }, 'word-1': { width: 38 } };

    expect(getGradient(tokens, measurements, 'space-0')).toEqual({ start: 0, width: 43 });

    expect(getGradient(tokens, measurements, 'word-1')).toEqual({ start: -5, width: 43 });
  });

  test('keeps measured token identity when the active window moves past a settled word', () => {
    const initial = getShadTokens('wo', 'rd 清晰').tokens;

    const advanced = getShadTokens('word ', '清晰').tokens;

    expect(advanced.map(({ key }) => key)).toEqual(initial.slice(2).map(({ key }) => key));

    const measurements = {
      'word-0': { width: 38, prefix: 19 },
      'word-5': { width: 16 },
      'word-6': { width: 16 },
    };

    expect(getGradient(advanced, measurements, 'word-5')).toEqual({ start: 0, width: 32 });

    expect(getGradient(advanced, measurements, 'word-6')).toEqual({ start: -16, width: 32 });
  });

  test('keeps token identity when the mapper shifts its ten-grapheme window', () => {
    const initial = getShadTokens('', '字自然展开，阅读不必', 1);

    const advanced = getShadTokens('', '自然展开，阅读不必等', 2);

    expect(initial.tokens.find((token) => token.text === '开，')?.key).toBe('word-5');

    expect(advanced.tokens.find((token) => token.text === '开，')?.key).toBe('word-5');

    expect(getShadTokens('', '必等待。Stream', 10).tokens.at(-1)?.key).toBe('word-14');

    expect(getShadTokens('', '等待。Streami', 11).tokens.at(-1)?.key).toBe('word-14');

    expect(getShadTokens('', '👩‍💻é 中', 3).tokens.at(-1)?.key).toBe('word-6');
  });
});
