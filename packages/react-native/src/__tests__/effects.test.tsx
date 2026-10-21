import { act, cleanup, render } from '@testing-library/react-native';
import { createRef } from 'react';
import { Animated } from 'react-native';

import type { FluxdownRef } from '../types';

import { ChunkRenderer } from '../../../react-native-presets/src/plugins/effect-chunk/renderer';
import { ScaleRenderer } from '../../../react-native-presets/src/plugins/effect-scale/renderer';
import { SuffixRenderer } from '../../../react-native-presets/src/plugins/effect-suffix/renderer';
import { FluxdownLite } from '../packs/lite';
import { expectNativeTextContainers, textContent } from './utils/native';

beforeEach(() => jest.useFakeTimers({ doNotFake: ['queueMicrotask'] }));

afterEach(async () => {
  cleanup();
  await act(async () => {});
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('native streaming effects', () => {
  test.each([
    ['scale', ScaleRenderer],
    ['chunk', ChunkRenderer],
  ] as const)('animates appended %s content with native Text', (effect, Renderer) => {
    const timing = jest.spyOn(Animated, 'timing');
    const ref = createRef<FluxdownRef>();
    const view = render(
      <FluxdownLite ref={ref} streaming={{ smooth: false, effect }} text="old" />,
    );
    const core = ref.current;

    timing.mockClear();
    view.rerender(<FluxdownLite ref={ref} streaming={{ smooth: false, effect }} text="old new" />);

    expect(view.UNSAFE_getAllByType(Renderer).length).toBeGreaterThan(0);
    expect(textContent(view.toJSON())).toBe('old new');
    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ useNativeDriver: true }),
    );
    expectNativeTextContainers(view.toJSON());

    view.rerender(<FluxdownLite ref={ref} streaming={false} text="old new" />);
    expect(view.UNSAFE_queryByType(Renderer)).toBeNull();
    expect(ref.current).toBe(core);
  });

  test('composes entrance and suffix effects and removes suffix on stream completion', () => {
    const content = (streaming: boolean) => (
      <FluxdownLite
        text="hello"
        streaming={
          streaming ? { smooth: false, effect: ['chunk', ['suffix', { type: 'dot' }]] } : false
        }
      />
    );
    const view = render(content(true));

    expect(view.UNSAFE_getByType(SuffixRenderer).props.type).toBe('dot');
    expect(textContent(view.toJSON())).toBe('hello');
    expectNativeTextContainers(view.toJSON());

    view.rerender(content(false));
    expect(view.UNSAFE_queryByType(SuffixRenderer)).toBeNull();
    expect(textContent(view.toJSON())).toBe('hello');
  });

  test('renders the suffix inside fenced code without changing code-copy text', () => {
    const view = render(
      <FluxdownLite text={'```js\nhello'} streaming={{ smooth: false, effect: 'suffix' }} />,
    );

    expect(view.UNSAFE_getByType(SuffixRenderer).props.type).toBe('cursor');
    expect(textContent(view.toJSON())).toContain('hello');
    expectNativeTextContainers(view.toJSON());
  });
});
