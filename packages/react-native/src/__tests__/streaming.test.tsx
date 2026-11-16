import type {
  ReactRenderMatchParams,
  ReactRenderParams,
  ScaleProps,
} from '@fluxdown/react-native-plugins/base';
import type { ReactNode } from 'react';

import { BaseReactRenderPlugin } from '@fluxdown/react-native-plugins/base';
import {
  EffectScaleSlotPlugin,
  ScaleRenderer,
} from '@fluxdown/react-native-plugins/plugins/effect-scale';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { Children, createRef, isValidElement, useEffect, useRef } from 'react';
import { StyleSheet, Text } from 'react-native';

import type { FluxdownLiteProps, FluxdownRef } from '../packs/lite';

import { restoreGlobals } from '../../../../scripts/testing/globals';
import { FluxdownLite } from '../packs/lite';
import { getMeasurement, measureText } from './utils/measurement';
import { createRafClock } from './utils/raf';

const getText = (node: ReactNode): string =>
  Children.toArray(node)
    .map((child) =>
      isValidElement<{ children?: ReactNode }>(child)
        ? getText(child.props.children)
        : String(child),
    )
    .join('');

const countAttachments = (text: string) => {
  let node = screen.getByText(text);

  while (node.props.textBreakStrategy === undefined && node.parent) {
    node = node.parent;
  }

  return node.queryAll((child) => child.type === 'View').length;
};

afterEach(async () => {
  await cleanup();

  await act(async () => {});

  jest.restoreAllMocks();

  restoreGlobals();

  jest.useRealTimers();
});

describe('React Native streaming', () => {
  test('keeps scale glyph instances while settled words collapse during streaming', async () => {
    const clock = createRafClock();

    const mounts = new Map<string, number>();

    const renders = new Map<string, number>();

    const replacements: string[] = [];

    const TrackedScale = (props: ScaleProps) => {
      const identity = `${props.start}:${getText(props.children)}`;

      renders.set(identity, (renders.get(identity) ?? 0) + 1);

      const initial = useRef(identity).current;

      useEffect(() => {
        mounts.set(initial, (mounts.get(initial) ?? 0) + 1);
      }, [initial]);

      if (initial !== identity) {
        replacements.push(identity);
      }

      return <ScaleRenderer {...props} />;
    };

    class TrackedSlot extends EffectScaleSlotPlugin {
      static readonly key = 'slot-scale';

      readonly Component = TrackedScale;
    }

    const plugins = { slots: [TrackedSlot] };

    const streaming = { effect: 'scale', smooth: true } as const;

    const source =
      '文字自然展开，阅读不必等待。Streaming Markdown follows a steady rhythm.每个字都有自己的位置。';

    jest.spyOn(Date, 'now').mockImplementation(() => performance.now());

    await render(<FluxdownLite plugins={plugins} streaming={streaming} text="" />);

    for (let index = 1; index <= 3; index += 1) {
      // oxlint-disable-next-line no-await-in-loop -- Each burst follows its real frame boundary.
      await clock.advanceUntil(() => performance.now() >= (index - 1) * 500);

      // oxlint-disable-next-line no-await-in-loop -- Commit the burst before advancing the clock.
      await screen.rerender(
        <FluxdownLite
          plugins={plugins}
          streaming={streaming}
          text={source.slice(0, Math.round((source.length * index) / 3))}
        />,
      );
    }

    await clock.advanceUntil(() => performance.now() >= 3000);

    expect(mounts.size).toBeGreaterThan(30);

    expect([...mounts.values()].every((count) => count === 1)).toBe(true);

    expect(renders).toEqual(mounts);

    expect(replacements).toEqual([]);
  });

  test('preserves custom text rendering inside scale glyphs', async () => {
    const clock = createRafClock();

    const onLayout = jest.fn();

    class TextRenderPlugin extends BaseReactRenderPlugin {
      static readonly key = 'test-scale-text';

      match({ node }: ReactRenderMatchParams) {
        return node.type === 'text';
      }

      render({ node }: ReactRenderParams) {
        return node.type === 'text' ? (
          <Text testID="custom-glyph" style={{ color: 'red' }} onLayout={onLayout}>
            {node.value}!
          </Text>
        ) : null;
      }
    }

    const plugins = { renders: [TextRenderPlugin] };

    const streaming = { effect: 'scale', smooth: false } as const;

    await render(<FluxdownLite plugins={plugins} streaming={streaming} text="" />);

    await screen.rerender(<FluxdownLite plugins={plugins} streaming={streaming} text="A" />);

    await clock.step();

    expect(screen.getByTestId('custom-glyph')).toHaveTextContent('A!');

    expect(screen.getByTestId('custom-glyph')).toHaveStyle({ color: 'red' });

    await fireEvent.layout(screen.getByTestId('custom-glyph'), { width: 24, height: 26 });

    await clock.advanceUntil(() => performance.now() >= 256);

    expect(onLayout).toHaveBeenCalledTimes(1);

    expect(screen.getAllByTestId('custom-glyph')).toHaveLength(1);

    expect(screen.container.queryAll((node) => node.type === 'RNSVGForeignObject')).toHaveLength(0);
  });

  test('does not attach unmeasured inline views to settled letters when a word grows', async () => {
    const clock = createRafClock();

    const streaming = { effect: 'scale', smooth: false } as const;

    await render(<FluxdownLite streaming={streaming} text="Stream" />);

    await clock.advanceUntil(() => performance.now() >= 512);

    await screen.rerender(<FluxdownLite streaming={streaming} text="Streaming" />);

    await clock.step();

    expect(countAttachments('S')).toBe(0);

    expect(countAttachments('i')).toBeGreaterThan(0);
  });

  test.each(['scale', 'shad', 'chunk', 'suffix'] as const)(
    'renders %s through native text and finishes the stream',
    async (effect) => {
      const clock = createRafClock();

      const ref = createRef<FluxdownRef>();

      const streaming: FluxdownLiteProps['streaming'] = { smooth: false, effect };

      await render(<FluxdownLite ref={ref} streaming={streaming} text="" />);

      const closure = ref.current;

      await screen.rerender(
        <FluxdownLite ref={ref} streaming={streaming} text="**Arriving** content" />,
      );

      await clock.step();

      expect(
        screen.getByText(effect === 'scale' ? 'A' : 'Arriving', {
          exact: effect === 'scale',
        }),
      ).toBeOnTheScreen();

      await screen.rerender(
        <FluxdownLite ref={ref} streaming={false} text="**Arriving** content" />,
      );

      expect(screen.getByText('Arriving', { exact: false })).toBeOnTheScreen();

      expect(ref.current).toBe(closure);

      await screen.unmount();

      await act(async () => {});

      expect(ref.current).toBeNull();

      expect(clock.pending.size).toBe(0);
    },
  );

  test('smooths incoming text and flushes unfinished markup when streaming ends', async () => {
    const clock = createRafClock();

    await render(<FluxdownLite streaming={{ effect: false }} text="" />);

    await screen.rerender(<FluxdownLite streaming={{ effect: false }} text="**ending" />);

    expect(screen.queryByText('ending')).toBeNull();

    await clock.advanceUntil(() => screen.queryByText('ending') !== null);

    await screen.rerender(<FluxdownLite streaming={false} text="**ending" />);

    expect(screen.getByText('**ending')).toBeOnTheScreen();

    expect(clock.pending.size).toBe(0);
  });
});
