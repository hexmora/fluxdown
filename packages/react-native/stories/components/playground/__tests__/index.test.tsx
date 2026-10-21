import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { Playground } from '..';
import { expectNativeTextContainers } from '../../../../src/__tests__/utils/native';
import { STORY_MARKDOWN } from '../../../playgrounds/consts';
import { CHUNK_SIZE, PLAYBACK_INTERVAL } from '../consts';

describe('native Storybook playback', () => {
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['queueMicrotask'] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('starts empty, plays incrementally, pauses, resumes, and resets', () => {
    render(<Playground autoPlay={false} initialText="甲乙丙丁戊己庚辛壬癸子丑" />);

    expect(screen.queryByText('甲乙丙丁')).toBeNull();

    expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(0);

    fireEvent.press(screen.getByRole('button', { name: '播放' }));

    act(() => {
      jest.advanceTimersByTime(PLAYBACK_INTERVAL);
    });

    expect(screen.getByText('甲乙丙丁')).toBeOnTheScreen();

    expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(33);

    fireEvent.press(screen.getByRole('button', { name: '暂停' }));

    act(() => {
      jest.advanceTimersByTime(PLAYBACK_INTERVAL * 10);
    });

    expect(screen.getByText('甲乙丙丁')).toBeOnTheScreen();

    expect(screen.queryByText('甲乙丙丁戊己庚辛')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: '继续' }));

    act(() => {
      jest.advanceTimersByTime(PLAYBACK_INTERVAL);
    });

    expect(screen.getByText('甲乙丙丁戊己庚辛')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: '重置' }));

    act(() => {
      jest.advanceTimersByTime(PLAYBACK_INTERVAL * 10);
    });

    expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(0);

    expect(screen.queryByText('甲乙丙丁戊己庚辛')).toBeNull();

    expect(screen.getByRole('button', { name: '播放' })).toBeOnTheScreen();
  });

  test('autoplays without splitting emoji, finishes, replays, and clears its timer', () => {
    const view = render(<Playground initialText="甲乙丙👋丁" />);

    expect(screen.queryByText('甲乙丙👋丁')).toBeNull();

    act(() => {
      jest.advanceTimersByTime(PLAYBACK_INTERVAL);
    });

    expect(screen.getByText('甲乙丙👋')).toBeOnTheScreen();

    act(() => {
      jest.advanceTimersByTime(PLAYBACK_INTERVAL);
    });

    expect(screen.getByText('甲乙丙👋丁')).toBeOnTheScreen();

    expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(100);

    expect(jest.getTimerCount()).toBe(0);

    fireEvent.press(screen.getByRole('button', { name: '重播' }));

    expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(0);

    expect(jest.getTimerCount()).toBe(1);

    view.unmount();

    expect(jest.getTimerCount()).toBe(0);
  });

  test('renders the complete Chinese fixture with legal native Text containers', () => {
    const view = render(<Playground initialText={STORY_MARKDOWN} />);

    expect(screen.queryByText('流式文档的现场笔记')).toBeNull();

    act(() => {
      jest.advanceTimersByTime(
        Math.ceil(Array.from(STORY_MARKDOWN).length / CHUNK_SIZE) * PLAYBACK_INTERVAL,
      );
    });

    expect(screen.getByText('流式文档的现场笔记')).toBeOnTheScreen();

    expect(screen.getByText('能力对照表')).toBeOnTheScreen();

    expect(screen.getByText('数学表达式')).toBeOnTheScreen();

    expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(100);

    expectNativeTextContainers(view.toJSON());
  });

  test('resets when the story source changes and does not schedule empty content', () => {
    const view = render(<Playground initialText="甲乙丙丁戊己" />);

    act(() => {
      jest.advanceTimersByTime(PLAYBACK_INTERVAL);
    });

    view.rerender(<Playground autoPlay={false} initialText="新的文档" />);

    expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(0);

    expect(screen.queryByText('新的文档')).toBeNull();

    expect(jest.getTimerCount()).toBe(0);

    view.rerender(<Playground initialText="" />);

    expect(screen.getByRole('button', { name: '播放' })).toBeDisabled();

    expect(jest.getTimerCount()).toBe(0);
  });
});
