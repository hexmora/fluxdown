import type { TextProps, ViewProps } from 'react-native';

import { DARK_THEME, InheritedText, ThemeProvider } from '@fluxdown/react-native-plugins/base';
import { ChunkRenderer } from '@fluxdown/react-native-plugins/plugins/effect-chunk';
import { ScaleRenderer } from '@fluxdown/react-native-plugins/plugins/effect-scale';
import { ShadRenderer } from '@fluxdown/react-native-plugins/plugins/effect-shad';
import { SuffixRenderer } from '@fluxdown/react-native-plugins/plugins/effect-suffix';
import { LinkSlotPlugin } from '@fluxdown/react-native-plugins/plugins/link';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { PlatformColor, processColor, StyleSheet, Text, View } from 'react-native';

import type { FluxdownLiteProps } from '../packs/lite';

import { restoreGlobals } from '../../../../scripts/testing/globals';
import { FluxdownLite } from '../packs/lite';
import { getMeasurement, getPrefixMeasurement, measureText } from './utils/measurement';
import { createRafClock } from './utils/raf';

const getBlur = () => screen.container.queryAll((node) => node.type === 'RNSVGFeGaussianBlur')[0];

afterEach(async () => {
  await cleanup();

  await act(async () => {});

  jest.restoreAllMocks();

  restoreGlobals();
});

describe('native streaming effects', () => {
  test('updates both native blur axes and removes the drawing when scale settles', async () => {
    const clock = createRafClock();

    jest.spyOn(Date, 'now').mockImplementation(() => performance.now());

    await render(
      <ThemeProvider value={DARK_THEME}>
        <ScaleRenderer Raw={null} start={0} duration={200} from={0.75} blur={0.2}>
          A
        </ScaleRenderer>
      </ThemeProvider>,
    );

    const text = screen.getByText('A');

    expect(text).toHaveStyle({ color: 'rgba(255,255,255,0)' });

    await measureText(text, { width: 16, height: 26 });

    const initial = getBlur()?.props.stdDeviationX;

    expect(initial).toBeGreaterThan(0);

    expect(getBlur()?.props.stdDeviationY).toBe(initial);

    // Animated normally bypasses setNativeProps in tests. Exercise the runtime
    // path so the public SVG component must convert both native blur axes.
    jest.replaceProperty(process.env, 'NODE_ENV', 'development');

    await clock.step();

    expect(getBlur()?.props.stdDeviationX).toBeLessThan(initial);

    expect(getBlur()?.props.stdDeviationY).toBe(getBlur()?.props.stdDeviationX);

    await clock.advanceUntil(() => getBlur()?.props.stdDeviationX < initial / 2);

    expect(getBlur()?.props.stdDeviationX).toBeGreaterThan(0);

    await clock.advanceUntil(() => !getBlur());

    expect(screen.getByText('A')).toHaveStyle({ color: DARK_THEME.tokens.colors.fg });

    expect(clock.pending.size).toBe(0);
  });

  test('updates scale and alpha through ordinary native views without SVG transform writes', async () => {
    const clock = createRafClock();

    const scales: number[] = [];

    const opacities: number[] = [];

    jest.spyOn(View.prototype, 'setNativeProps').mockImplementation((props) => {
      const style = StyleSheet.flatten((props as Pick<ViewProps, 'style'>).style);

      const transform = style?.transform;

      if (Array.isArray(transform)) {
        for (const entry of transform) {
          if ('scale' in entry && typeof entry.scale === 'number') {
            scales.push(entry.scale);
          }
        }
      }

      if (typeof style?.opacity === 'number') {
        opacities.push(style.opacity);
      }
    });

    jest.spyOn(Date, 'now').mockImplementation(() => performance.now());

    await render(
      <ThemeProvider value={DARK_THEME}>
        <ScaleRenderer Raw={null} start={0} duration={200} from={0.75} blur={0.2}>
          A
        </ScaleRenderer>
      </ThemeProvider>,
    );

    await measureText(screen.getByText('A'), { width: 16, height: 26 });

    const transformHost = screen.container.queryAll((node) => {
      return node.type === 'View' && Boolean(StyleSheet.flatten(node.props.style)?.transform);
    })[0];

    expect(transformHost).toHaveStyle({
      transform: [{ scale: 0.75 }],
      transformOrigin: [8, 26, 0],
    });

    for (const group of screen.container.queryAll((node) => node.type === 'RNSVGGroup')) {
      expect(group.props.transform).toBeUndefined();

      expect(group.props.matrix).toBeUndefined();
    }

    jest.replaceProperty(process.env, 'NODE_ENV', 'development');

    await clock.advanceUntil(() => !getBlur());

    expect(scales.length).toBeGreaterThan(2);

    expect(scales[0]).toBeGreaterThan(0.75);

    expect(scales.at(-1)).toBeGreaterThan(0.99);

    expect(scales.every((value, index) => index === 0 || value >= scales[index - 1]!)).toBe(true);

    expect(opacities.some((value) => value > 0 && value < 1)).toBe(true);

    expect(opacities.at(-1)).toBeGreaterThan(0.99);
  });

  test('restarts scale on the same native text host without another layout event', async () => {
    const clock = createRafClock();

    jest.spyOn(Date, 'now').mockImplementation(() => performance.now());

    await render(
      <ThemeProvider value={DARK_THEME}>
        <ScaleRenderer Raw={null} start={0} duration={200} from={0.75} blur={0.2}>
          A
        </ScaleRenderer>
      </ThemeProvider>,
    );

    const original = screen.getByText('A');

    await measureText(original, { width: 16, height: 26 });

    const initial = getBlur()?.props.stdDeviationX;

    await clock.advanceUntil(() => !getBlur());

    await screen.rerender(
      <ThemeProvider value={DARK_THEME}>
        <ScaleRenderer Raw={null} start={performance.now()} duration={200} from={0.75} blur={0.2}>
          A
        </ScaleRenderer>
      </ThemeProvider>,
    );

    expect(screen.getByText('A')).toBe(original);

    // The retained layout must draw the restarted effect before any new event.
    expect(getBlur()?.props.stdDeviationX).toBeCloseTo(initial);

    expect(getBlur()?.props.stdDeviationY).toBeCloseTo(initial);

    await clock.step();

    expect(getBlur()?.props.stdDeviationX).toBeLessThan(initial);

    await clock.advanceUntil(() => !getBlur());

    expect(clock.pending.size).toBe(0);
  });

  test('keeps scale progressing when streaming reparses the same active glyph', async () => {
    const clock = createRafClock();

    jest.spyOn(Date, 'now').mockImplementation(() => performance.now());

    const start = performance.now();

    const content = () => {
      return (
        <ThemeProvider value={DARK_THEME}>
          <ScaleRenderer Raw={null} start={start} duration={400} from={0.75} blur={0.2}>
            A
          </ScaleRenderer>
        </ThemeProvider>
      );
    };

    await render(content());

    await measureText(screen.getByText('A'), { width: 16, height: 26 });

    jest.replaceProperty(process.env, 'NODE_ENV', 'development');

    await clock.step();

    for (let index = 0; index < 5; index += 1) {
      const before = getBlur()?.props.stdDeviationX;

      // Each reparse must commit before its next animation frame.
      // oxlint-disable-next-line no-await-in-loop
      await screen.rerender(content());

      // oxlint-disable-next-line no-await-in-loop
      await clock.step();

      expect(getBlur()?.props.stdDeviationX).toBeLessThan(before);
    }

    await clock.advanceUntil(() => !getBlur());

    expect(screen.getByText('A')).toHaveStyle({ color: DARK_THEME.tokens.colors.fg });

    expect(clock.pending.size).toBe(0);
  });

  test('restarts chunk alpha without replacing its native text host', async () => {
    const clock = createRafClock();

    jest.spyOn(Date, 'now').mockImplementation(() => performance.now());

    await render(
      <ChunkRenderer Raw={null} start={0} duration={200}>
        A
      </ChunkRenderer>,
    );

    const original = screen.getByText('A');

    const alpha = () => {
      const value = processColor(StyleSheet.flatten(original.props.style)?.color);

      return typeof value === 'number' ? value >>> 24 : undefined;
    };

    await clock.step();

    expect(alpha()).toBeGreaterThan(0);

    await screen.rerender(
      <ChunkRenderer Raw={null} start={performance.now()} duration={200}>
        A
      </ChunkRenderer>,
    );

    expect(screen.getByText('A')).toBe(original);

    expect(alpha()).toBe(0);

    await clock.step();

    expect(alpha()).toBeGreaterThan(0);

    await clock.advanceUntil(() => clock.pending.size === 0);

    expect(alpha()).toBe(255);

    expect(clock.pending.size).toBe(0);
  });

  test('preserves chunk RGB and existing alpha through every frame and reparse', async () => {
    const clock = createRafClock();

    const colors: number[] = [];

    jest.spyOn(Text.prototype, 'setNativeProps').mockImplementation((props) => {
      const { style } = props as Pick<TextProps, 'style'>;

      const value = processColor(StyleSheet.flatten(style)?.color);

      if (typeof value === 'number') {
        colors.push(value >>> 0);
      }
    });

    jest.spyOn(Date, 'now').mockImplementation(() => performance.now());

    const start = performance.now();

    const content = () => {
      return (
        <InheritedText style={{ color: 'rgba(82,120,154,0.5)' }}>
          Existing text
          <ChunkRenderer Raw={null} start={start} duration={200}>
            A
          </ChunkRenderer>
        </InheritedText>
      );
    };

    await render(content());

    const text = screen.getByText('A');

    expect(text).toHaveStyle({ color: 'rgba(82, 120, 154, 0)' });

    // Exercise runtime native updates instead of the test-only React commit path.
    jest.replaceProperty(process.env, 'NODE_ENV', 'development');

    for (let frame = 0; frame < 8; frame += 1) {
      const before = (colors.at(-1) ?? 0) >>> 24;

      // oxlint-disable-next-line no-await-in-loop
      await screen.rerender(content());

      // oxlint-disable-next-line no-await-in-loop
      await clock.step();

      expect(screen.getByText('A')).toBe(text);

      const color = colors.at(-1);

      expect(color).toBeDefined();

      expect(color! & 0xffffff).toBe(0x52789a);

      expect(color! >>> 24).toBeGreaterThan(before);
    }

    await clock.advanceUntil(() => clock.pending.size === 0);

    expect(colors.at(-1)! >>> 24).toBe(128);

    expect(colors.every((color) => (color & 0xffffff) === 0x52789a)).toBe(true);

    expect(clock.pending.size).toBe(0);
  });

  test('inherits the link accent for chunk text and keeps completed content visible', async () => {
    createRafClock();

    const LinkRenderer = new LinkSlotPlugin().Component;

    await render(
      <ThemeProvider value={DARK_THEME}>
        <LinkRenderer
          Raw={null}
          href="https://example.com"
          current={{ type: 'element', tagName: 'a', properties: {}, children: [] }}
          parents={[]}
          render={() => null}
        >
          <ChunkRenderer Raw={null} start={-1} duration={200}>
            Link text
          </ChunkRenderer>
        </LinkRenderer>
      </ThemeProvider>,
    );

    const value = processColor(
      StyleSheet.flatten(screen.getByText('Link text').props.style)?.color,
    );

    expect(value).toBe(processColor(DARK_THEME.tokens.colors.accent));
  });

  test('starts pure black chunk text with a nonzero transparent color and finishes at exact black', async () => {
    const clock = createRafClock();

    jest.spyOn(Date, 'now').mockImplementation(() => performance.now());

    await render(
      <InheritedText style={{ color: 'black' }}>
        <ChunkRenderer Raw={null} start={0} duration={200}>
          Black text
        </ChunkRenderer>
      </InheritedText>,
    );

    const text = screen.getByText('Black text');

    const color = () => processColor(StyleSheet.flatten(text.props.style)?.color);

    // A packed zero is Android's unset-color sentinel, which inherits opaque black.
    expect(color()).toBe(1);

    await clock.step();

    const value = color();

    expect(typeof value).toBe('number');

    if (typeof value === 'number') {
      expect(value >>> 24).toBeGreaterThan(0);

      expect(value & 0xffff00).toBe(0);

      expect(value & 255).toBeLessThanOrEqual(1);
    }

    await clock.advanceUntil(() => clock.pending.size === 0);

    expect(color()).toBe(processColor('black'));
  });

  test('keeps a fully transparent chunk color hidden after completion', async () => {
    createRafClock();

    await render(
      <InheritedText style={{ color: 'transparent' }}>
        <ChunkRenderer Raw={null} start={-1} duration={200}>
          Hidden text
        </ChunkRenderer>
      </InheritedText>,
    );

    const value = processColor(
      StyleSheet.flatten(screen.getByText('Hidden text').props.style)?.color,
    );

    expect(value).toBe(1);
  });

  test('preserves an opaque native color instead of guessing its RGB channels', async () => {
    createRafClock();

    const color = PlatformColor('?attr/colorAccent');

    await render(
      <InheritedText style={{ color }}>
        <ChunkRenderer Raw={null} start={0} duration={200}>
          Native color
        </ChunkRenderer>
      </InheritedText>,
    );

    expect(screen.getByText('Native color')).toHaveStyle({ color });
  });

  test('keeps one accessible copy while the SVG drawing is active', async () => {
    const clock = createRafClock();

    jest.spyOn(Date, 'now').mockImplementation(() => performance.now());

    await render(
      <ThemeProvider value={DARK_THEME}>
        <InheritedText
          style={{ fontSize: 24, lineHeight: 32, fontWeight: '600', color: '#123456' }}
        >
          <ScaleRenderer Raw={null} start={0} duration={200} from={0.75} blur={0.2}>
            Read once
          </ScaleRenderer>
        </InheritedText>
      </ThemeProvider>,
    );

    const text = screen.getByText('Read once');

    expect(text).toHaveStyle({
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600',
      color: 'rgba(255,255,255,0)',
    });

    await measureText(text, { width: 120, height: 32 });

    expect(getBlur()).toBeDefined();

    expect(screen.getAllByText('Read once')).toHaveLength(1);

    expect(screen.getAllByText('Read once', { includeHiddenElements: true })).toHaveLength(3);

    await clock.advanceUntil(() => !getBlur());

    expect(screen.getByText('Read once')).toBe(text);

    expect(text).toHaveStyle({ fontSize: 24, lineHeight: 32, fontWeight: '600', color: '#123456' });
  });

  test('inherits heading and strong typography across the native drawing boundary', async () => {
    const clock = createRafClock();

    jest.spyOn(Date, 'now').mockImplementation(() => performance.now());

    const theme: FluxdownLiteProps['theme'] = [
      'dark',
      { tokens: { typography: { fontWeight: { bold: '800' } } } },
    ];

    const streaming = { smooth: false, effect: 'scale' } as const;

    await render(<FluxdownLite streaming={streaming} text="" theme={theme} />);

    await screen.rerender(<FluxdownLite streaming={streaming} text="## **A**" theme={theme} />);

    await clock.step();

    const glyph = getMeasurement(screen.getByText('A'));

    expect(glyph).toBeDefined();

    if (!glyph) {
      return;
    }

    expect(glyph).toHaveStyle({ fontSize: 24, fontWeight: '800' });

    await measureText(glyph, { width: 18, height: 32 });

    const foreignObject = screen.container.queryAll(
      (node) => node.type === 'RNSVGForeignObject',
    )[0];

    const text = foreignObject?.queryAll((node) => node.type === 'Text')[0];

    expect(text).toBeDefined();

    const style = StyleSheet.flatten(text?.props.style);

    expect(style).toMatchObject({
      color: DARK_THEME.tokens.colors.fg,
      fontSize: 24,
      fontWeight: '800',
    });

    expect(style?.lineHeight).toBeCloseTo(31.2);

    expect(style?.letterSpacing).toBeCloseTo(-0.6);

    expect(text).toHaveStyle({ flexShrink: 0 });

    expect(text?.parent).toHaveStyle({ flexDirection: 'row' });
  });

  test.each(['scale', 'shad'] as const)(
    '%s keeps inline geometry unchanged when asynchronous baseline measurements arrive',
    async (effect) => {
      createRafClock();

      jest.spyOn(Date, 'now').mockImplementation(() => performance.now());

      await render(
        <ThemeProvider value={DARK_THEME}>
          <InheritedText style={{ fontSize: 20, lineHeight: 33 }}>
            Settled text
            {effect === 'scale' ? (
              <ScaleRenderer Raw={null} start={0} duration={200} from={0.75} blur={0.2}>
                A
              </ScaleRenderer>
            ) : (
              <ShadRenderer Raw={null} leading="" active="A" isActive maskWidth={15} />
            )}
          </InheritedText>
        </ThemeProvider>,
      );

      const text = screen.getByText('A');

      const anchor = screen.container.queryAll(
        (node) =>
          node.type === 'View' && node.props.importantForAccessibility === 'no-hide-descendants',
      )[0];

      expect(anchor).toHaveStyle({ width: 0, height: 0 });

      expect(text).toHaveStyle({ color: 'rgba(255,255,255,0)' });

      await measureText(text, { width: 20, height: 33 }, 24);

      const drawing = screen.container.queryAll((node) => node.type === 'RNSVGForeignObject')[0];

      expect(drawing?.props.height).toBe(34);

      const positioned = anchor?.queryAll(
        (node) => node.type === 'View' && StyleSheet.flatten(node.props.style)?.left === -20,
      )[0];

      // An inline attachment's bottom remains on the text baseline even when
      // the renderer rounds its nominal zero height to a physical pixel.
      expect(positioned).toHaveStyle({ bottom: -9, height: 33 });

      expect(StyleSheet.flatten(positioned?.props.style)?.top).toBeUndefined();

      expect(anchor).toHaveStyle({ width: 0, height: 0 });

      await measureText(text, { width: 20, height: 33 }, 22);

      expect(screen.getByText('A')).toBe(text);

      expect(anchor).toHaveStyle({ width: 0, height: 0 });

      expect(drawing?.props.height).toBe(34);

      expect(positioned).toHaveStyle({ bottom: -11, height: 33 });

      expect(screen.getByText('Settled text', { exact: false })).not.toHaveStyle({ height: 22 });
    },
  );

  test.each([
    { effect: 'scale', value: 'M', width: 14, length: 1 },
    { effect: 'shad', value: 'word', width: 38, length: 4 },
    { effect: 'shad', value: 'क्ष', width: 16, length: 1 },
    { effect: 'shad', value: 'क्‍ष', width: 16, length: 1 },
  ] as const)(
    '$effect compensates only the measured attachment advance and keeps drawing typography',
    async ({ effect, value, width, length }) => {
      createRafClock();

      await render(
        <ThemeProvider value={DARK_THEME}>
          <InheritedText style={{ fontSize: 16, lineHeight: 26, letterSpacing: 0.25 }}>
            {effect === 'scale' ? (
              <ScaleRenderer Raw={null} start={0} duration={200} from={0.75} blur={0.2}>
                {value}
              </ScaleRenderer>
            ) : (
              <ShadRenderer Raw={null} leading="" active={value} isActive maskWidth={15} />
            )}
          </InheritedText>
        </ThemeProvider>,
      );

      const original = screen.getByText(value);

      await measureText(original, { width, height: 26 }, 20, 1);

      expect(original).toHaveStyle({ letterSpacing: 0.25 - 1 / length });

      const drawing = screen.container.queryAll((node) => node.type === 'RNSVGForeignObject')[0]!;

      const copy = drawing.queryAll((node) => node.type === 'Text')[0]!;

      expect(copy).toHaveStyle({ letterSpacing: 0.25 });

      expect(copy.props.selectable).toBe(false);

      const offset = screen.container.queryAll(
        (node) =>
          node.type === 'View' && StyleSheet.flatten(node.props.style)?.left === -(width - 1),
      );

      expect(offset).toHaveLength(1);

      await measureText(original, { width, height: 26 }, 20, 0);

      expect(original).toHaveStyle({ letterSpacing: 0.25 });

      expect(offset[0]).toHaveStyle({ left: -width });
    },
  );

  test('retains the measured shade when a native glyph changes without a new layout', async () => {
    await render(
      <ThemeProvider value={DARK_THEME}>
        <ShadRenderer Raw={null} leading="" active="中" isActive maskWidth={15} />
      </ThemeProvider>,
    );

    expect(screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient')).toHaveLength(
      0,
    );

    const original = screen.getByText('中');

    await measureText(original, { width: 16, height: 26 });

    const gradient = screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient')[0];

    const mask = screen.container.queryAll((node) => node.type === 'RNSVGMask')[0];

    const drawing = screen.container.queryAll((node) => node.type === 'RNSVGForeignObject')[0];

    expect(gradient?.props).toMatchObject({ x1: 0, x2: 16, gradientUnits: 1 });

    expect(gradient?.props.gradient[1] >>> 24).toBe(255);

    expect(gradient?.props.gradient[3] >>> 24).toBe(0);

    expect(drawing?.parent?.props.mask).toBe(mask?.props.name);

    expect(screen.getAllByText('中')).toHaveLength(1);

    expect(screen.getAllByText('中', { includeHiddenElements: true })).toHaveLength(3);

    await screen.rerender(
      <ThemeProvider value={DARK_THEME}>
        <ShadRenderer Raw={null} leading="" active="文" isActive maskWidth={15} />
      </ThemeProvider>,
    );

    expect(screen.getByText('文')).toBe(original);

    expect(original).toHaveStyle({ color: 'rgba(255,255,255,0)' });

    expect(screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient')[0]).toBe(
      gradient,
    );

    expect(gradient?.props).toMatchObject({ x1: 0, x2: 16 });

    await measureText(original, { width: 24, height: 32 });

    expect(gradient?.props.x2).toBe(24);
  });

  test('keeps the existing word prefix visible until its first gradient is ready', async () => {
    await render(
      <InheritedText style={{ color: 'purple' }}>
        <ShadRenderer Raw={null} leading="wo" active="rd" isActive maskWidth={15} />
      </InheritedText>,
    );

    expect(screen.getByText('wo')).toHaveStyle({ color: 'purple' });

    await measureText(screen.getByText('word'), { width: 38, height: 26 });

    expect(screen.getByText('wo')).toHaveStyle({ color: 'purple' });

    expect(screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient')).toHaveLength(
      0,
    );

    await fireEvent.layout(getPrefixMeasurement('wo'), { width: 19, height: 26 });

    expect(screen.queryByText('wo')).toBeNull();

    expect(screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient')).toHaveLength(
      1,
    );
  });

  test('keeps the last valid gradient when an empty prefix starts growing', async () => {
    await render(
      <InheritedText>
        <ShadRenderer Raw={null} leading="" active="word" isActive maskWidth={15} />
      </InheritedText>,
    );

    await measureText(screen.getByText('word'), { width: 38, height: 26 });

    await fireEvent.layout(getPrefixMeasurement('\u2060'), { width: 0, height: 26 });

    const gradient = screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient')[0];

    await screen.rerender(
      <InheritedText>
        <ShadRenderer Raw={null} leading="w" active="ord" isActive maskWidth={15} />
      </InheritedText>,
    );

    expect(screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient')[0]).toBe(
      gradient,
    );

    expect(gradient?.props.x1).toBe(0);

    await fireEvent.layout(getPrefixMeasurement('w'), { width: 10, height: 26 });

    expect(gradient?.props.x1).toBe(10);
  });

  test('uses measured advances for one continuous shade across a partial word and CJK', async () => {
    await render(
      <ThemeProvider value={DARK_THEME}>
        <ShadRenderer Raw={null} leading="wo" active="rd中" isActive maskWidth={15} />
      </ThemeProvider>,
    );

    await measureText(screen.getByText('word'), { width: 38, height: 26 });

    await fireEvent.layout(getPrefixMeasurement('wo'), {
      width: 19,
      height: 26,
    });

    await measureText(screen.getByText('中'), { width: 16, height: 26 });

    const gradients = screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient');

    expect(gradients).toHaveLength(2);

    expect(gradients[0]?.props).toMatchObject({ x1: 19, x2: 54 });

    expect(gradients[1]?.props).toMatchObject({ x1: -19, x2: 16 });

    expect(screen.getAllByText('word')).toHaveLength(1);

    expect(screen.getAllByText('中')).toHaveLength(1);
  });

  test('keeps a partial word shaded across equal-size replacements and later layout updates', async () => {
    await render(
      <ThemeProvider value={DARK_THEME}>
        <ShadRenderer Raw={null} leading="wo" active="rd" isActive maskWidth={15} />
      </ThemeProvider>,
    );

    const original = screen.getByText('word');

    expect(original).toHaveStyle({ color: 'rgba(255,255,255,0)' });

    // Inject native layout events; host tests do not measure device glyphs.
    await measureText(original, { width: 38, height: 26 });

    const prefix = getPrefixMeasurement('wo');

    expect(prefix.parent).toHaveStyle({ width: 38, height: 26 });

    await fireEvent.layout(prefix, { width: 19, height: 26 });

    const gradient = screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient')[0];

    expect(gradient?.props).toMatchObject({ x1: 19, x2: 38 });

    // Equal-size text changes do not emit a native onLayout event.
    await screen.rerender(
      <ThemeProvider value={DARK_THEME}>
        <ShadRenderer Raw={null} leading="he" active="ad" isActive maskWidth={15} />
      </ThemeProvider>,
    );

    expect(screen.getByText('head')).toBe(original);

    expect(getPrefixMeasurement('he')).toBe(prefix);

    expect(original).toHaveStyle({ color: 'rgba(255,255,255,0)' });

    expect(screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient')[0]).toBe(
      gradient,
    );

    expect(gradient?.props).toMatchObject({ x1: 19, x2: 38 });

    await fireEvent.layout(prefix, { width: 24, height: 26 });

    expect(gradient?.props).toMatchObject({ x1: 24, x2: 38 });

    await screen.rerender(
      <ThemeProvider value={DARK_THEME}>
        <ShadRenderer Raw={null} leading="he" active="ads" isActive maskWidth={15} />
      </ThemeProvider>,
    );

    const appended = screen.getByText('heads');

    expect(appended).toBe(original);

    expect(appended).toHaveStyle({ color: 'rgba(255,255,255,0)' });

    expect(screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient')[0]).toBe(
      gradient,
    );

    expect(gradient?.props).toMatchObject({ x1: 24, x2: 38 });

    await measureText(appended, { width: 48, height: 26 });

    expect(gradient?.props).toMatchObject({ x1: 24, x2: 48 });
  });

  test('keeps measured text shaded while a new native token awaits layout', async () => {
    await render(
      <ThemeProvider value={DARK_THEME}>
        <ShadRenderer Raw={null} leading="" active="中" isActive maskWidth={15} />
      </ThemeProvider>,
    );

    const original = screen.getByText('中');

    await measureText(original, { width: 16, height: 26 });

    await screen.rerender(
      <ThemeProvider value={DARK_THEME}>
        <ShadRenderer Raw={null} leading="" active="中文" isActive maskWidth={15} />
      </ThemeProvider>,
    );

    const pending = screen.getByText('文');

    expect(screen.getByText('中')).toBe(original);

    expect(pending).toHaveStyle({ color: 'rgba(255,255,255,0)' });

    const previous = screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient');

    expect(previous).toHaveLength(1);

    expect(previous[0]?.props).toMatchObject({ x1: 0, x2: 16 });

    await measureText(pending, { width: 16, height: 26 });

    const gradients = screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient');

    expect(gradients).toHaveLength(2);

    expect(gradients[0]?.props).toMatchObject({ x1: 0, x2: 32 });

    expect(gradients[1]?.props).toMatchObject({ x1: -16, x2: 16 });
  });

  test('keeps a new token shaded when an older layout callback arrives late', async () => {
    await render(
      <ThemeProvider value={DARK_THEME}>
        <ShadRenderer Raw={null} leading="" active="word" isActive maskWidth={15} />
      </ThemeProvider>,
    );

    const original = screen.getByText('word');

    const previousLayout = getMeasurement(original).props.onLayout;

    await measureText(original, { width: 38, height: 26 });

    await screen.rerender(
      <ThemeProvider value={DARK_THEME}>
        <ShadRenderer Raw={null} leading="" active="word中" isActive maskWidth={15} />
      </ThemeProvider>,
    );

    await measureText(screen.getByText('中'), { width: 16, height: 26 });

    expect(screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient')).toHaveLength(
      2,
    );

    await act(() => {
      previousLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 48, height: 26 } } });
    });

    const gradients = screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient');

    expect(gradients).toHaveLength(2);

    expect(gradients[0]?.props).toMatchObject({ x1: 0, x2: 64 });

    expect(gradients[1]?.props).toMatchObject({ x1: -48, x2: 16 });
  });

  test('discards settled measurements while a long paragraph advances', async () => {
    await render(
      <ThemeProvider value={DARK_THEME}>
        <ShadRenderer Raw={null} leading="wo" active="rd" isActive maskWidth={15} />
      </ThemeProvider>,
    );

    await measureText(screen.getByText('word'), { width: 38, height: 26 });

    await fireEvent.layout(getPrefixMeasurement('wo'), {
      width: 19,
      height: 26,
    });

    for (let index = 0; index < 32; index += 1) {
      // Sequential windows preserve the streaming order and exercise cache eviction.
      // eslint-disable-next-line no-await-in-loop
      await screen.rerender(
        <ThemeProvider value={DARK_THEME}>
          <ShadRenderer
            Raw={null}
            leading={`word${'中'.repeat(index)}`}
            active="中文"
            isActive
            maskWidth={15}
          />
        </ThemeProvider>,
      );

      // eslint-disable-next-line no-await-in-loop
      await measureText(screen.getByText('中'), { width: 16, height: 26 });

      // eslint-disable-next-line no-await-in-loop
      await measureText(screen.getByText('文'), { width: 16, height: 26 });

      expect(screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient')).toHaveLength(
        2,
      );
    }

    await screen.rerender(
      <ThemeProvider value={DARK_THEME}>
        <ShadRenderer Raw={null} leading="wo" active="rd" isActive maskWidth={15} />
      </ThemeProvider>,
    );

    await measureText(screen.getByText('word'), { width: 42, height: 26 });

    // A removed token must wait for its new prefix layout instead of reusing old geometry.
    expect(screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient')).toHaveLength(
      0,
    );

    await fireEvent.layout(getPrefixMeasurement('wo'), {
      width: 21,
      height: 26,
    });

    expect(
      screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient')[0]?.props,
    ).toMatchObject({ x1: 21, x2: 42 });
  });

  test('ignores a settled token layout without clearing newer token measurements', async () => {
    await render(
      <ThemeProvider value={DARK_THEME}>
        <ShadRenderer Raw={null} leading="wo" active="rd" isActive maskWidth={15} />
      </ThemeProvider>,
    );

    await measureText(screen.getByText('word'), { width: 38, height: 26 });

    const previousLayout = getPrefixMeasurement('wo').props.onLayout;

    await screen.rerender(
      <ThemeProvider value={DARK_THEME}>
        <ShadRenderer Raw={null} leading="word" active="中文" isActive maskWidth={15} />
      </ThemeProvider>,
    );

    await measureText(screen.getByText('中'), { width: 16, height: 26 });

    await measureText(screen.getByText('文'), { width: 16, height: 26 });

    await act(() => {
      previousLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 19, height: 26 } } });
    });

    const gradients = screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient');

    expect(gradients).toHaveLength(2);

    expect(gradients[0]?.props).toMatchObject({ x1: 0, x2: 32 });

    expect(gradients[1]?.props).toMatchObject({ x1: -16, x2: 16 });
  });

  test('retains the drawing host when the active window advances through an earlier word', async () => {
    await render(
      <ThemeProvider value={DARK_THEME}>
        <ShadRenderer Raw={null} leading="" active="Streaming Mark" isActive maskWidth={15} />
      </ThemeProvider>,
    );

    await measureText(screen.getByText('Streaming'), { width: 80, height: 26 });

    const original = screen.getByText('Mark');

    await measureText(original, { width: 38, height: 26 });

    const gradient = screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient')[1];

    expect(gradient?.props).toMatchObject({ x1: -80, x2: 38 });

    await screen.rerender(
      <ThemeProvider value={DARK_THEME}>
        <ShadRenderer Raw={null} leading="S" active="treaming Markd" isActive maskWidth={15} />
      </ThemeProvider>,
    );

    expect(screen.getByText('Markd')).toBe(original);

    await fireEvent.layout(getPrefixMeasurement('S'), {
      width: 8,
      height: 26,
    });

    expect(screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient')[1]).toBe(
      gradient,
    );

    expect(gradient?.props).toMatchObject({ x1: -72, x2: 38 });

    await measureText(original, { width: 46, height: 26 });

    expect(gradient?.props).toMatchObject({ x1: -72, x2: 46 });
  });

  test('reuses a measured word host when a space moves into the first token position', async () => {
    await render(
      <ThemeProvider value={DARK_THEME}>
        <ShadRenderer Raw={null} leading="" active="same paragraph" isActive maskWidth={15} />
      </ThemeProvider>,
    );

    await measureText(screen.getByText('same'), { width: 38, height: 26 });

    const original = screen.getByText('paragraph');

    await measureText(original, { width: 80, height: 26 });

    const gradient = screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient')[1];

    await screen.rerender(
      <ThemeProvider value={DARK_THEME}>
        <ShadRenderer Raw={null} leading="same" active=" paragraph..." isActive maskWidth={15} />
      </ThemeProvider>,
    );

    expect(screen.getByText('paragraph...')).toBe(original);

    expect(screen.container.queryAll((node) => node.type === 'RNSVGLinearGradient')).toEqual([
      gradient,
    ]);

    await measureText(original, { width: 92, height: 26 });

    expect(gradient?.props.x2).toBe(92);
  });

  test.each([
    { type: 'cursor', width: 7.8, height: 20, borderRadius: 1.2 },
    { type: 'dot', width: 12.48, height: 12.48, borderRadius: 6.24 },
  ] as const)(
    '$type suffix inherits its geometry and reserves no text width',
    async ({ type, width, height, borderRadius }) => {
      const clock = createRafClock();

      await render(
        <ThemeProvider value={DARK_THEME}>
          <InheritedText style={{ fontSize: 20, lineHeight: 33, color: '#123456' }}>
            <SuffixRenderer Raw={null} type={type} />
          </InheritedText>
        </ThemeProvider>,
      );

      const anchor = screen.container.queryAll(
        (node) => node.type === 'View' && StyleSheet.flatten(node.props.style)?.width === 0,
      )[0];

      expect(anchor).toBeDefined();

      expect(anchor?.props.importantForAccessibility).toBe('no-hide-descendants');

      expect(anchor).toHaveStyle({ width: 0 });

      const baselineText = screen.getByText('\u200b\u2060', { includeHiddenElements: true });

      expect(baselineText).toHaveStyle({ fontSize: 20, lineHeight: 33, flexShrink: 0 });

      await measureText(baselineText, { width: 0, height: 33 }, 24);

      expect(anchor).toHaveStyle({ width: 0, height: 0 });

      const markers = screen.container.queryAll(
        (node) =>
          node.type === 'View' &&
          StyleSheet.flatten(node.props.style)?.backgroundColor === '#123456',
      );

      expect(markers).toHaveLength(1);

      const markerStyle = StyleSheet.flatten(markers[0]?.props.style);

      expect(markerStyle?.width).toBeCloseTo(width);

      expect(markerStyle?.height).toBeCloseTo(height);

      expect(markerStyle?.borderRadius).toBeCloseTo(borderRadius);

      await measureText(baselineText, { width: 0, height: 33 }, 22);

      expect(anchor).toHaveStyle({ width: 0, height: 0 });

      expect(StyleSheet.flatten(markers[0]?.props.style)).toEqual(markerStyle);

      await clock.step();

      expect(clock.pending.size).toBe(1);

      await screen.unmount();

      expect(clock.pending.size).toBe(0);
    },
  );

  test('suffix keeps its pulse phase after a delayed animation frame', async () => {
    const clock = createRafClock();

    await render(<SuffixRenderer Raw={null} type="cursor" />);

    await measureText(
      screen.getByText('\u200b\u2060', { includeHiddenElements: true }),
      { width: 0, height: 26 },
      20,
    );

    const marker = screen.container.queryAll(
      (node) => StyleSheet.flatten(node.props.style)?.left === 16 * 0.18,
    )[0];

    jest.spyOn(performance, 'now').mockReturnValue(1500);

    await clock.step();

    expect(marker).toHaveStyle({ opacity: 0 });

    jest.spyOn(performance, 'now').mockReturnValue(2100);

    await clock.step();

    expect(marker).toHaveStyle({ opacity: 1 });

    await screen.unmount();

    expect(clock.pending.size).toBe(0);
  });
});
