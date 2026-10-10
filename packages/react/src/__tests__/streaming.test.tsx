import type { IRemarkPlugin } from '@fluxdown/types';

import { BaseRemarkPlugin } from '@fluxdown/core-presets/remark';
import { act, cleanup, render } from '@testing-library/react';
import { createRef } from 'react';

import type { FluxdownProps, FluxdownRef } from '../types';

import { Fluxdown } from '..';
import { restoreGlobals } from '../../../../scripts/testing/globals';
import styles from '../../../react-presets/src/render/shad/renderer/index.module.scss';
import { createRafClock } from './utils/raf';

afterEach(async () => {
  cleanup();

  await act(async () => {});

  jest.restoreAllMocks();

  restoreGlobals();
});

describe('Fluxdown streaming options', () => {
  test.each<{ streaming: FluxdownProps['streaming']; repaired: boolean }>([
    { streaming: undefined, repaired: false },
    { streaming: false, repaired: false },
    { streaming: true, repaired: true },
    { streaming: {}, repaired: true },
    { streaming: { repairEnding: false }, repaired: false },
    { streaming: { smooth: false, shad: false }, repaired: true },
  ])('repairs incomplete endings with streaming=$streaming', ({ streaming, repaired }) => {
    const view = render(<Fluxdown streaming={streaming} text="**ending" />);

    expect(view.container.querySelector('strong') !== null).toBe(repaired);

    expect(view.container.textContent).toBe(repaired ? 'ending' : '**ending');
  });

  test('enables smoothing, fading, and ending repairs together with boolean streaming', async () => {
    const clock = createRafClock();

    const view = render(<Fluxdown streaming text="" />);

    view.rerender(<Fluxdown streaming text="**ending" />);

    expect(view.container.textContent).toBe('');

    await clock.advanceUntil(() => (view.container.textContent?.length ?? 0) > 0);

    expect(view.container.querySelector('strong')).not.toBeNull();

    expect(view.container.querySelector(`.${styles.active}`)).toHaveTextContent(/\S/);

    expect(view.container.querySelector(`.${styles.mask}`)).not.toBeNull();

    view.rerender(<Fluxdown streaming={false} text="**ending" />);

    expect(view.container.textContent).toBe('**ending');

    expect(view.container.querySelector('strong')).toBeNull();

    expect(view.container.querySelector(`.${styles.active}`)).toBeNull();

    expect(clock.pending.size).toBe(0);
  });

  test('updates ending repairs for existing text without replacing the core', () => {
    const ref = createRef<FluxdownRef>();

    const streaming = { smooth: false, shad: false };

    const view = render(<Fluxdown ref={ref} streaming={streaming} text="**ending" />);

    const core = ref.current;

    expect(view.container.querySelector('strong')).toHaveTextContent('ending');

    view.rerender(
      <Fluxdown ref={ref} streaming={{ ...streaming, repairEnding: false }} text="**ending" />,
    );

    expect(view.container.textContent).toBe('**ending');

    expect(view.container.querySelector('strong')).toBeNull();

    view.rerender(<Fluxdown ref={ref} streaming={streaming} text="**ending" />);

    expect(view.container.querySelector('strong')).toHaveTextContent('ending');

    expect(ref.current).toBe(core);
  });

  test('keeps ordinary repairs and recompiles only the final block when streaming ends', () => {
    const compiled: string[] = [];

    class CompileCounterRemarkPlugin extends BaseRemarkPlugin {
      static readonly key = 'remark-compile-counter';

      plugin: IRemarkPlugin['plugin'] = () => (_tree, file) => {
        compiled.push(String(file));
      };
    }

    const plugins = [{ remarks: [CompileCounterRemarkPlugin] }];
    const streaming = { smooth: false, shad: false };
    const text = 'first<img\n\nsecond\n\n**ending';

    const view = render(<Fluxdown plugins={plugins} streaming={streaming} text={text} />);

    expect(view.container.querySelector('p')?.textContent).toBe('first');

    expect(view.container.querySelector('strong')).toHaveTextContent('ending');

    expect(compiled).toHaveLength(3);

    compiled.length = 0;

    view.rerender(<Fluxdown plugins={plugins} streaming={false} text={text} />);

    expect(view.container.querySelector('p')?.textContent).toBe('first');

    expect(view.container.querySelector('strong')).toBeNull();

    expect(view.container.textContent).toContain('**ending');

    expect(compiled).toEqual(['**ending']);

    view.rerender(
      <Fluxdown
        plugins={plugins}
        streaming={streaming}
        text={'updated<img\n\nsecond\n\n**continued'}
      />,
    );

    expect(view.container.querySelector('p')?.textContent).toBe('updated');

    expect(view.container.querySelector('strong')).toHaveTextContent('continued');
  });

  test.each<{ streaming: FluxdownProps['streaming']; repairedEnding: boolean }>([
    { streaming: false, repairedEnding: false },
    { streaming: { smooth: false, shad: false }, repairedEnding: true },
  ])(
    'honors and removes an explicit repair override with streaming=$streaming',
    ({ streaming, repairedEnding }) => {
      const text = 'prefix<img\n\n**ending';
      const view = render(<Fluxdown streaming={streaming} text={text} />);

      expect(view.container.querySelector('p')?.textContent).toBe('prefix');

      expect(view.container.querySelector('strong') !== null).toBe(repairedEnding);

      view.rerender(<Fluxdown build={{ repair: false }} streaming={streaming} text={text} />);

      expect(view.container.querySelector('p')?.textContent).toBe('prefix<img');

      expect(view.container.querySelector('strong')).toBeNull();

      expect(view.container.textContent).toContain('**ending');

      view.rerender(<Fluxdown streaming={streaming} text={text} />);

      expect(view.container.querySelector('p')?.textContent).toBe('prefix');

      expect(view.container.querySelector('strong') !== null).toBe(repairedEnding);
    },
  );
});
