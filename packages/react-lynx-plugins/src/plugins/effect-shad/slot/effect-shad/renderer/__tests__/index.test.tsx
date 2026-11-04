import { act, cleanup, fireEvent, render } from '@lynx-js/react/testing-library';
import { afterEach, beforeEach, expect, test } from '@rstest/core';

import { ShadRenderer } from '..';
import { AnimatedText } from '../../../../../../base';
import { LinkRenderer } from '../../../../../link/slot/link/renderer';
import { getGradient, getShadTokens } from '../utils';

beforeEach(() => {
  lynx.getTextInfo = (text) => ({ width: text.length * 10 });
});

afterEach(cleanup);

test('keeps word wrapping opportunities instead of making the whole active tail unbreakable', () => {
  const view = render(
    <text>
      before{' '}
      <ShadRenderer leading="leading " active="tail with spaces" isActive={true} maskWidth={15} />
    </text>,
  );

  const active = view.container.querySelectorAll('.fluxdown-shad-active');

  expect([...active].map((node) => node.textContent)).toEqual(['tail', 'with', 'spaces']);

  expect(view.container.textContent).toBe('before leading tail with spaces');

  expect(view.container.querySelector('.fluxdown-shad-mask')?.getAttribute('style')).toContain(
    'margin-left: -15px',
  );
});

test('continues the same gradient across CJK wrap opportunities', () => {
  const { tokens } = getShadTokens('before ', '文字');
  const measurements = Object.fromEntries(tokens.map((token) => [token.key, { width: 20 }]));

  expect(getGradient(tokens, measurements, tokens[0]!.key)).toEqual({ start: 0, width: 40 });
  expect(getGradient(tokens, measurements, tokens[1]!.key)).toEqual({ start: -20, width: 40 });
});

test('keeps a partially shaded word together and preserves link color under the mask', () => {
  const destinations: string[] = [];

  const view = render(
    <ShadRenderer
      leading="before Flo"
      active={
        <LinkRenderer
          Raw={null}
          current={{ type: 'element', tagName: 'a', properties: {}, children: [] }}
          parents={[]}
          render={() => null}
          href="https://example.com"
          onTap={({ href }) => destinations.push(href)}
        >
          wdown
        </LinkRenderer>
      }
      isActive
      maskWidth={15}
    />,
  );

  const word = view.container.querySelector('.fluxdown-shad-active');

  expect(word?.querySelector('text')?.textContent).toBe('Flowdown');
  expect(view.container.querySelector('.fluxdown-shad-active')?.getAttribute('style')).toContain(
    'mask-image',
  );
  expect(view.container.querySelector('.fluxdown-link')?.getAttribute('style')).toContain(
    'rgb(9, 105, 218)',
  );
  expect(view.container.querySelector('.fluxdown-shad-prefix')?.textContent).toBe('Flo');

  fireEvent.tap(view.getByText('wdown'));
  expect(destinations).toEqual(['https://example.com']);
});

test('uses the laid out rich prefix instead of estimating its width from the whole word', async () => {
  const view = render(<ShadRenderer leading="Flo" active="wdown" isActive maskWidth={15} />);

  const word = view.container.querySelector('.fluxdown-shad-active')!;
  const prefix = view.container.querySelector('.fluxdown-shad-prefix')!;

  await act(() => {
    fireEvent.layoutchange(word, { detail: { width: 100 } });
    fireEvent.layoutchange(prefix, { detail: { width: 20 } });
  });

  expect(word.getAttribute('style')).toContain('rgb(0, 0, 0) 20%, transparent 100%');
});

test('splits only a word that actually wraps so its gradient continues across internal lines', async () => {
  const view = render(
    <AnimatedText id="paragraph">
      <ShadRenderer leading="" active="unbreakable" isActive maskWidth={15} />
    </AnimatedText>,
  );

  const word = view.getByText('unbreakable');

  expect(view.container.querySelectorAll('.fluxdown-shad-active')).toHaveLength(1);

  await act(() => {
    fireEvent(
      word,
      new CustomEvent('bindEvent:layout', {
        detail: {
          lines: [
            { start: 0, end: 5 },
            { start: 5, end: 11 },
          ],
        },
      }),
    );
  });

  const fragments = view.container.querySelectorAll('.fluxdown-shad-active');

  expect([...fragments].map((node) => node.textContent)).toEqual(['unbre', 'akable']);
  expect(fragments[1]!.getAttribute('style')).toContain('transparent 100%');

  await act(() => {
    fireEvent.layoutchange(view.container.querySelector('#paragraph')!, { detail: { width: 280 } });
  });

  expect(view.container.querySelectorAll('.fluxdown-shad-active')).toHaveLength(1);

  view.rerender(
    <AnimatedText id="paragraph">
      <ShadRenderer leading="" active="unbreakableword" isActive maskWidth={15} />
    </AnimatedText>,
  );

  expect(view.container.querySelectorAll('.fluxdown-shad-active')).toHaveLength(1);
  expect(view.container.textContent).toBe('unbreakableword');
});

test('keeps the tail marker in place after the shade finishes', () => {
  const view = render(
    <ShadRenderer leading="complete" active="d" isActive={false} maskWidth={6.5} />,
  );

  const mask = view.container.querySelector('.fluxdown-shad-mask');

  expect(mask?.getAttribute('style')).toContain('opacity: 0');

  expect(mask?.getAttribute('style')).toContain('width: 6.5px');

  expect(view.container.textContent).toBe('completed');
  expect(view.container.querySelector('.fluxdown-shad-active')).toBeNull();
});
