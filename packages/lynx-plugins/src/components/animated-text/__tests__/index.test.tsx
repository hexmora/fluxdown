import { act, cleanup, fireEvent, render } from '@lynx-js/react/testing-library';
import { afterEach, expect, rstest, test } from '@rstest/core';

import { AnimatedText } from '..';
import { useTextLayoutWidth } from '../../../context';

const Width = ({ id }: { id: string }) => <text id={id}>{String(useTextLayoutWidth())}</text>;

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
