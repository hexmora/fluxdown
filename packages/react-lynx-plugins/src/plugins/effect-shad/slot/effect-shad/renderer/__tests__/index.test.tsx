import { cleanup, render } from '@lynx-js/react/testing-library';
import { afterEach, beforeEach, expect, rstest, test } from '@rstest/core';

import { ShadRenderer } from '..';

const globals = globalThis.lynxTestingEnv.mainThread;
const originalAnimate = globals['__ElementAnimate'];
let animate = rstest.fn();
const starts = () =>
  animate.mock.calls.map(([, command]) => command).filter((command) => command[0] === 0);

beforeEach(() => {
  animate = rstest.fn();
  globals['__ElementAnimate'] = animate;
  rstest.spyOn(Date, 'now').mockReturnValue(2000);
});

afterEach(() => {
  cleanup();
  globals['__ElementAnimate'] = originalAnimate;
  rstest.restoreAllMocks();
});

test('fades shad text linearly on its own clock and resumes after a remount', () => {
  const now = rstest.spyOn(performance, 'now').mockReturnValue(1100);
  const content = (
    <text>
      before{' '}
      <ShadRenderer start={1000} duration={400}>
        tail
      </ShadRenderer>
    </text>
  );
  const first = render(content);
  expect(first.container.querySelector('.fluxdown-shad-active')?.tagName.toLowerCase()).toBe(
    'text',
  );
  expect(first.container.textContent).toBe('before tail');
  expect(starts()).toHaveLength(1);
  expect(starts()[0][2]).toEqual([{ color: 'transparent' }, { color: '#202123' }]);
  expect(starts()[0][3]).toMatchObject({
    duration: 400,
    delay: -100,
    easing: 'linear',
    fill: 'both',
  });
  first.unmount();

  animate.mockClear();
  now.mockReturnValue(1300);
  const second = render(content);
  expect(starts()[0][3].delay).toBe(-300);
  second.unmount();

  animate.mockClear();
  now.mockReturnValue(1400);
  const settled = render(content);
  expect(starts()).toHaveLength(0);
  expect(settled.container.querySelector('.fluxdown-shad-active')).toBeNull();
  expect(settled.container.textContent).toBe('before tail');
});

test('does not animate content that was already settled', () => {
  const view = render(
    <ShadRenderer start={-1} duration={400}>
      settled
    </ShadRenderer>,
  );
  expect(starts()).toHaveLength(0);
  expect(view.container.querySelector('.fluxdown-shad-active')).toBeNull();
  expect(view.container.textContent).toBe('settled');
});
