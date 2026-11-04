import { act, cleanup, fireEvent, render } from '@lynx-js/react/testing-library';
import { afterEach, expect, rstest, test } from '@rstest/core';

import { AnimatedText } from '..';
import { TextAnimationProvider, useTextLayoutWidth } from '../../../context';

const Width = ({ id }: { id: string }) => <text id={id}>{String(useTextLayoutWidth())}</text>;

const animatedContent = (active: boolean) => (
  <TextAnimationProvider value={active ? { arrival: 1950, duration: 200 } : null}>
    <AnimatedText id="text">visible</AnimatedText>
  </TextAnimationProvider>
);

const layout = async (element: Element, width: number) => {
  await act(() => {
    fireEvent(
      element,
      new CustomEvent('bindEvent:layoutchange', {
        detail: {
          width,
          height: 30,
          lineCount: 1,
          lines: [{ start: 0, end: 1, ellipsisCount: 0 }],
        },
      }),
    );
  });
};

afterEach(cleanup);

test('enables synthetic bold for custom regular fonts while preserving an explicit opt-out', () => {
  const view = render(
    <AnimatedText id="default" style={{ fontWeight: '400' }}>
      <AnimatedText id="bold" style={{ fontWeight: '700' }}>
        Bold
      </AnimatedText>
      <AnimatedText id="disabled" text-fake-bold={false}>
        Disabled
      </AnimatedText>
    </AnimatedText>,
  );

  expect(view.container.querySelector('#default')?.getAttribute('text-fake-bold')).toBe('true');
  expect(view.container.querySelector('#bold')?.getAttribute('text-fake-bold')).toBe('true');
  expect(view.container.querySelector('#disabled')?.getAttribute('text-fake-bold')).toBe('false');
});

test('shares the nearest measured root text width and preserves caller layout events', async () => {
  const onLayout = rstest.fn();
  const view = render(
    <AnimatedText id="outer" bindlayoutchange={onLayout}>
      <AnimatedText>
        <Width id="inline-width" />
      </AnimatedText>
      <view>
        <AnimatedText id="inner">
          <Width id="inner-width" />
        </AnimatedText>
      </view>
    </AnimatedText>,
  );
  const outer = view.container.querySelector('#outer')!;
  const inner = view.container.querySelector('#inner')!;
  expect(view.container.querySelector('#inline-width')?.textContent).toBe('undefined');

  await layout(outer, 320);
  expect(onLayout).toHaveBeenCalledTimes(1);
  expect(onLayout.mock.calls[0][0].detail.width).toBe(320);
  expect(view.container.querySelector('#inline-width')?.textContent).toBe('320');
  expect(view.container.querySelector('#inner-width')?.textContent).toBe('320');

  await layout(inner, 96);
  await layout(outer, 180);
  expect(view.container.querySelector('#inline-width')?.textContent).toBe('180');
  expect(view.container.querySelector('#inner-width')?.textContent).toBe('96');

  await layout(inner, 0);
  expect(view.container.querySelector('#inner-width')?.textContent).toBe('180');
  await layout(inner, Number.NaN);
  expect(view.container.querySelector('#inner-width')?.textContent).toBe('180');
});

test('lets leaf glyphs inherit width while preserving explicit layout callbacks', async () => {
  const onLayout = rstest.fn();
  let renders = 0;
  const Child = () => {
    renders += 1;
    return <Width id="width" />;
  };
  const view = render(
    <AnimatedText id="outer">
      <AnimatedText id="leaf" measureLayout={false} bindlayoutchange={onLayout}>
        <Child />
      </AnimatedText>
    </AnimatedText>,
  );
  await layout(view.container.querySelector('#outer')!, 320);
  const before = renders;
  await layout(view.container.querySelector('#leaf')!, 20);
  expect(onLayout).toHaveBeenCalledTimes(1);
  expect(onLayout.mock.calls[0][0].detail.width).toBe(20);
  expect(view.container.querySelector('#width')?.textContent).toBe('320');
  expect(renders).toBe(before);
  expect(view.container.querySelector('#leaf')?.getAttribute('measureLayout')).toBeNull();
});

test('retains the native text and measured width when plain text gains nested components', async () => {
  const view = render(<AnimatedText id="root">plain</AnimatedText>);
  const element = view.container.querySelector('#root')!;
  await layout(element, 320);
  view.rerender(
    <AnimatedText id="root">
      <Width id="width" />
    </AnimatedText>,
  );
  expect(view.container.querySelector('#root')).toBe(element);
  expect(view.container.querySelector('#width')?.textContent).toBe('320');
  await layout(element, 180);
  expect(view.container.querySelector('#width')?.textContent).toBe('180');
  view.rerender(<AnimatedText id="root">plain again</AnimatedText>);
  expect(view.container.querySelector('#root')).toBe(element);
});

test('cancels the color animation when its context is removed without replacing text', () => {
  const globals = globalThis.lynxTestingEnv.mainThread;
  const original = globals['__ElementAnimate'];
  const animate = rstest.fn();
  globals['__ElementAnimate'] = animate;
  const now = rstest.spyOn(Date, 'now').mockReturnValue(2000);
  try {
    const view = render(animatedContent(true));
    const element = view.container.querySelector('#text');
    expect(animate.mock.calls.filter(([, command]) => command[0] === 0)).toHaveLength(1);
    view.rerender(animatedContent(false));
    expect(view.container.querySelector('#text')).toBe(element);
    expect(animate.mock.calls.filter(([, command]) => command[0] === 3)).toHaveLength(1);
    view.rerender(animatedContent(false));
    expect(animate).toHaveBeenCalledTimes(2);
    view.unmount();
    expect(animate).toHaveBeenCalledTimes(2);
  } finally {
    globals['__ElementAnimate'] = original;
    now.mockRestore();
  }
});
