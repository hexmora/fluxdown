import { act, cleanup, render } from '@testing-library/react-native';
import { AccessibilityInfo, Animated } from 'react-native';

import { ChunkRenderer } from '../../effect-chunk/renderer';
import { ScaleRenderer } from '../../effect-scale/renderer';

afterEach(async () => {
  cleanup();
  await act(async () => {});
  jest.restoreAllMocks();
});

describe('native entrance timing and accessibility', () => {
  test('resumes the remaining duration when an inline chunk remounts', () => {
    jest.spyOn(performance, 'now').mockReturnValue(150);
    const timing = jest.spyOn(Animated, 'timing');

    render(
      <ChunkRenderer start={50} duration={400}>
        new text
      </ChunkRenderer>,
    );

    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        duration: 300,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
  });

  test('does not replay completed or historical content', () => {
    jest.spyOn(performance, 'now').mockReturnValue(1000);
    const timing = jest.spyOn(Animated, 'timing');

    render(
      <>
        <ChunkRenderer start={50} duration={400}>
          completed
        </ChunkRenderer>
        <ScaleRenderer start={-1} duration={200} from={0} blur={0.08}>
          historical
        </ScaleRenderer>
      </>,
    );

    expect(timing).not.toHaveBeenCalled();
  });

  test('shares the reduced-motion subscription and skips further entrances', async () => {
    jest.spyOn(performance, 'now').mockReturnValue(100);
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const subscriptions = jest.spyOn(AccessibilityInfo, 'addEventListener').mockClear();
    const timing = jest.spyOn(Animated, 'timing');
    const content = (start: number) => (
      <>
        <ChunkRenderer start={start} duration={400}>
          chunk
        </ChunkRenderer>
        <ScaleRenderer start={start} duration={200} from={0} blur={0.08}>
          scale
        </ScaleRenderer>
      </>
    );

    const view = render(content(50));
    await act(async () => {});
    timing.mockClear();

    view.rerender(content(100));

    expect(subscriptions.mock.calls.map(([type]) => type)).toEqual(['reduceMotionChanged']);
    expect(timing).not.toHaveBeenCalled();
  });
});
