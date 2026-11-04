import { act, cleanup, fireEvent, render } from '@lynx-js/react/testing-library';
import { afterEach, expect, rstest, test } from '@rstest/core';

import { ScaleRenderer } from '..';
import { TextStyleProvider, useTextLayoutWidth } from '../../../../../../base';

afterEach(() => {
  cleanup();

  rstest.restoreAllMocks();
});

const content = (children: string) => (
  <ScaleRenderer start={1000} duration={200} from={0.2} blur={0.08}>
    {children}
  </ScaleRenderer>
);

const Width = () => <text id="width">{String(useTextLayoutWidth())}</text>;

test('resumes numeric native keyframes without restarting settled glyphs', () => {
  const now = rstest.spyOn(performance, 'now').mockReturnValue(1100);
  rstest.spyOn(Date, 'now').mockReturnValue(2000);
  const animate = rstest.fn();
  const original = globalThis.lynxTestingEnv.mainThread['__ElementAnimate'];
  globalThis.lynxTestingEnv.mainThread['__ElementAnimate'] = animate;

  const starts = () =>
    animate.mock.calls.map(([, command]) => command).filter((command) => command[0] === 0);

  try {
    const first = render(content('A'));
    expect(starts()).toHaveLength(2);
    for (const [, , , options] of starts()) {
      expect(options).toMatchObject({ duration: 200, delay: -100, fill: 'both' });
    }
    const appear = starts().find(([, , frames]) => frames[0].filter);
    const grow = starts().find(([, , frames]) => frames[0].transform);
    expect(appear[2]).toHaveLength(11);
    expect(appear[2][0]).toEqual({ offset: 0, opacity: 0, filter: 'blur(1.28px)' });
    expect(appear[2][5]).toEqual({ offset: 0.5, opacity: 0.765625, filter: 'blur(0.905097px)' });
    expect(appear[2][10]).toEqual({ offset: 1, opacity: 1, filter: 'blur(0px)' });
    expect(appear[3].easing).toBe('linear');
    expect(grow[2]).toEqual([{ transform: 'scale(0.2)' }, { transform: 'scale(1)' }]);
    expect(grow[3].easing).toBe('cubic-bezier(0.333333, 1, 0.666667, 1)');

    now.mockReturnValue(1150);
    first.rerender(content('AB'));
    expect(starts()).toHaveLength(2);
    first.unmount();
    expect(animate.mock.calls.filter(([, command]) => command[0] === 3)).toHaveLength(2);

    animate.mockClear();
    const resumed = render(content('A'));
    expect(starts()).toHaveLength(2);
    expect(starts().every(([, , , options]) => options.delay === -150)).toBe(true);
    resumed.unmount();

    animate.mockClear();
    now.mockReturnValue(1250);
    const settled = render(content('A'));
    expect(starts()).toHaveLength(0);
    expect(settled.container.querySelector('.fluxdown-scale-glyph text')?.textContent).toBe('A');
    settled.unmount();
  } finally {
    globalThis.lynxTestingEnv.mainThread['__ElementAnimate'] = original;
  }
});

test('honors reduced motion and retains animation on older computed-style hosts', () => {
  rstest.spyOn(performance, 'now').mockReturnValue(1000);
  rstest.spyOn(Date, 'now').mockReturnValue(2000);
  const globals = globalThis.lynxTestingEnv.mainThread;
  const originalAnimate = globals['__ElementAnimate'];
  const originalStyle = globals['__GetComputedStyleByKey'];
  const originalSystemInfo = globals['SystemInfo'];
  globals['SystemInfo'] = { ...originalSystemInfo, lynxSdkVersion: '4.0' };
  const animate = rstest.fn();
  globals['__ElementAnimate'] = animate;
  globals['__GetComputedStyleByKey'] = (_element: unknown, property: string) =>
    property === 'animation-play-state' ? 'paused' : '';

  try {
    const reduced = render(content('A'));
    expect(animate).not.toHaveBeenCalled();
    expect(reduced.container.querySelector('.fluxdown-scale-glyph text')?.textContent).toBe('A');
    reduced.unmount();

    globals['__GetComputedStyleByKey'] = () => {
      throw new Error('Unsupported by this host');
    };
    const legacy = render(content('A'));
    expect(animate.mock.calls.filter(([, command]) => command[0] === 0)).toHaveLength(2);
    legacy.unmount();
  } finally {
    globals['__ElementAnimate'] = originalAnimate;
    globals['__GetComputedStyleByKey'] = originalStyle;
    globals['SystemInfo'] = originalSystemInfo;
  }
});

test('carries heading typography into each inline view and its actual text', () => {
  const view = render(
    <TextStyleProvider
      value={{ fontSize: '32px', lineHeight: 1.25, fontWeight: '600', color: '#123456' }}
    >
      <ScaleRenderer start={-1} duration={200} from={0} blur={0.08}>
        A
      </ScaleRenderer>
    </TextStyleProvider>,
  );

  for (const element of view.container.querySelectorAll(
    '.fluxdown-scale, .fluxdown-scale-glyph, text',
  )) {
    expect(element.getAttribute('style')).toContain('font-size: 32px');
  }
});

test('keeps width measurement for custom glyph children', async () => {
  const view = render(
    <ScaleRenderer start={-1} duration={200} from={0} blur={0.08}>
      <Width />
    </ScaleRenderer>,
  );
  const text = view.container.querySelector('.fluxdown-scale-glyph > text')!;
  await act(() => {
    fireEvent(
      text,
      new CustomEvent('bindEvent:layoutchange', { detail: { width: 24, height: 30 } }),
    );
  });
  expect(view.container.querySelector('#width')?.textContent).toBe('24');
});
