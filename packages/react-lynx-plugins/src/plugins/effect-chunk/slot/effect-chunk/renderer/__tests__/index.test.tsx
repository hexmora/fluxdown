import type { Element } from 'hast';

import { cleanup, render, renderHook } from '@lynx-js/react/testing-library';
import { afterEach, beforeEach, expect, rstest, test } from '@rstest/core';

import { ChunkRenderer } from '..';
import { TextAnimationProvider, useTextStyle } from '../../../../../../base';
import { LinkRenderer } from '../../../../../link/slot/link/renderer';

const globals = globalThis.lynxTestingEnv.mainThread;
const originalAnimate = globals['__ElementAnimate'];
const originalStyle = globals['__GetComputedStyleByKey'];
const originalSystemInfo = globals['SystemInfo'];
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
  globals['__GetComputedStyleByKey'] = originalStyle;
  globals['SystemInfo'] = originalSystemInfo;
  rstest.restoreAllMocks();
});

test('resumes native color keyframes after remount without changing inline text layout', () => {
  const now = rstest.spyOn(performance, 'now').mockReturnValue(1100);
  const content = (
    <text>
      before{' '}
      <ChunkRenderer start={1000} duration={200}>
        words with spaces
      </ChunkRenderer>{' '}
      after
    </text>
  );
  const first = render(content);
  const chunk = first.container.querySelector('.fluxdown-chunk');
  expect(chunk?.tagName.toLowerCase()).toBe('text');
  expect(chunk?.querySelector('view')).toBeNull();
  expect(first.container.textContent).toBe('before words with spaces after');
  expect(starts()).toHaveLength(1);
  expect(starts()[0][2]).toEqual([{ color: 'transparent' }, { color: '#202123' }]);
  expect(starts()[0][3]).toMatchObject({
    duration: 200,
    delay: -100,
    easing: 'cubic-bezier(0, 0, 0.58, 1)',
    fill: 'both',
  });
  first.unmount();
  expect(animate.mock.calls.some(([, command]) => command[0] === 3)).toBe(true);

  animate.mockClear();
  now.mockReturnValue(1150);
  const second = render(content);
  expect(starts()[0][3].delay).toBe(-150);
  second.unmount();

  animate.mockClear();
  now.mockReturnValue(1200);
  const complete = render(content);
  expect(starts()).toHaveLength(0);
  expect(complete.container.querySelector('.fluxdown-chunk-active')).toBeNull();
  expect(complete.container.textContent).toBe('before words with spaces after');
});

test('retains the original animation during a reparse and starts only a new batch', () => {
  const now = rstest.spyOn(performance, 'now').mockReturnValue(1100);
  const view = render(
    <ChunkRenderer start={1000} duration={200}>
      a
    </ChunkRenderer>,
  );
  const before = view.container.querySelector('.fluxdown-chunk');
  expect(starts()).toHaveLength(1);
  now.mockReturnValue(1150);
  view.rerender(
    <ChunkRenderer start={1000} duration={200}>
      ab
    </ChunkRenderer>,
  );
  expect(view.container.querySelector('.fluxdown-chunk')).toBe(before);
  expect(view.container.textContent).toBe('ab');
  expect(starts()).toHaveLength(1);
  view.rerender(
    <ChunkRenderer start={1150} duration={200}>
      new
    </ChunkRenderer>,
  );
  expect(view.container.querySelector('.fluxdown-chunk')).not.toBe(before);
  expect(starts()).toHaveLength(2);
  expect(starts()[1][3].delay).toBe(0);
});

test('animates each rich child to its own foreground using the same batch clock', () => {
  rstest.spyOn(performance, 'now').mockReturnValue(1100);
  const current: Element = { type: 'element', tagName: 'a', properties: {}, children: [] };
  const view = render(
    <ChunkRenderer start={1000} duration={200}>
      <LinkRenderer
        Raw={null}
        current={current}
        parents={[]}
        render={() => null}
        href="https://example.com"
        style={{ color: '#ff0000' }}
      >
        link
      </LinkRenderer>
    </ChunkRenderer>,
  );
  expect(view.container.querySelector('.fluxdown-link')?.getAttribute('style')).toContain(
    'color: rgb(255, 0, 0)',
  );
  expect(view.container.textContent).toBe('link');
  expect(starts()).toHaveLength(2);
  expect(starts().map(([, , frames]) => frames[1].color)).toEqual(
    expect.arrayContaining(['#202123', '#ff0000']),
  );
  expect(starts().every(([, , , options]) => options.delay === -100)).toBe(true);
});

test('retains legacy CSS TextAnimationProvider configuration', () => {
  const { result } = renderHook(() => useTextStyle({ color: '#ff0000' }), {
    wrapper: ({ children }) => (
      <TextAnimationProvider value={{ animationName: 'legacy' }}>{children}</TextAnimationProvider>
    ),
  });
  expect(result.current.animationName).toBe('legacy');
  expect((result.current as Record<string, unknown>)['--fluxdown-text-color']).toBe('#ff0000');
});

test('honors reduced motion without hiding text', () => {
  rstest.spyOn(performance, 'now').mockReturnValue(1100);
  globals['SystemInfo'] = { ...originalSystemInfo, lynxSdkVersion: '4.0' };
  globals['__GetComputedStyleByKey'] = (_element: unknown, property: string) =>
    property === 'animation-play-state' ? 'paused' : '';
  const view = render(
    <ChunkRenderer start={1000} duration={200}>
      visible
    </ChunkRenderer>,
  );
  expect(starts()).toHaveLength(0);
  expect(view.container.textContent).toBe('visible');
});

test('keeps slot component metadata away from native attributes', () => {
  const view = render(
    <ChunkRenderer Raw={() => <text>raw</text>} start={-1} duration={200} id="chunk">
      text
    </ChunkRenderer>,
  );
  const chunk = view.container.querySelector('#chunk');
  expect(chunk?.getAttribute('raw')).toBeNull();
  expect(chunk?.textContent).toBe('text');
});
