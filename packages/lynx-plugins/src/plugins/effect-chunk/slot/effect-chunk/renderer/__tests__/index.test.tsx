import type { Element } from 'hast';

import { cleanup, render, renderHook } from '@lynx-js/react/testing-library';
import { afterEach, expect, rstest, test } from '@rstest/core';

import { ChunkRenderer } from '..';
import { useTextStyle } from '../../../../../../base';
import { LinkRenderer } from '../../../../../link/slot/link/renderer';

afterEach(() => {
  cleanup();

  rstest.restoreAllMocks();
});

test('resumes a batch after remount without changing its inline text layout', () => {
  const now = rstest.spyOn(performance, 'now').mockReturnValue(1100);

  const first = render(
    <text>
      before{' '}
      <ChunkRenderer start={1000} duration={200}>
        words with spaces
      </ChunkRenderer>{' '}
      after
    </text>,
  );

  const chunk = first.container.querySelector('.fluxdown-chunk');

  expect(chunk?.tagName.toLowerCase()).toBe('text');

  expect(chunk?.getAttribute('style')).toContain('animation-delay: -100ms');

  expect(chunk?.querySelector('view')).toBeNull();

  expect(first.container.textContent).toBe('before words with spaces after');

  first.unmount();

  now.mockReturnValue(1150);

  const second = render(
    <ChunkRenderer start={1000} duration={200}>
      words with spaces
    </ChunkRenderer>,
  );

  expect(second.container.querySelector('.fluxdown-chunk')?.getAttribute('style')).toContain(
    'animation-delay: -150ms',
  );

  second.unmount();

  now.mockReturnValue(1200);

  const complete = render(
    <ChunkRenderer start={1000} duration={200}>
      words with spaces
    </ChunkRenderer>,
  );

  expect(complete.container.querySelector('.fluxdown-chunk-active')).toBeNull();
});

test('retains the original animation during a reparse and restarts only a new batch', () => {
  const now = rstest.spyOn(performance, 'now').mockReturnValue(1100);

  const view = render(
    <ChunkRenderer start={1000} duration={200}>
      a
    </ChunkRenderer>,
  );

  const before = view.container.querySelector('.fluxdown-chunk');

  now.mockReturnValue(1150);

  view.rerender(
    <ChunkRenderer start={1000} duration={200}>
      ab
    </ChunkRenderer>,
  );

  expect(view.container.querySelector('.fluxdown-chunk')).toBe(before);

  expect(before?.getAttribute('style')).toContain('animation-delay: -100ms');

  view.rerender(
    <ChunkRenderer start={1150} duration={200}>
      new
    </ChunkRenderer>,
  );

  expect(view.container.querySelector('.fluxdown-chunk')).not.toBe(before);

  expect(view.container.querySelector('.fluxdown-chunk')?.getAttribute('style')).toContain(
    'animation-delay: 0ms',
  );
});

test('uses the same native color animation while preserving a rich child foreground', () => {
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

  const link = view.container.querySelector('.fluxdown-link');

  expect(link?.getAttribute('style')).toContain('color: rgb(255, 0, 0)');

  expect(link?.getAttribute('style')).toContain('animation-name: fluxdown-chunk-appear');

  expect(link?.getAttribute('style')).toContain('animation-delay: -100ms');

  const { result } = renderHook(() => useTextStyle({ color: '#ff0000' }), {
    wrapper: ({ children }) => (
      <ChunkRenderer start={1000} duration={200}>
        {children}
      </ChunkRenderer>
    ),
  });

  expect((result.current as Record<string, unknown>)['--fluxdown-text-color']).toBe('#ff0000');
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
