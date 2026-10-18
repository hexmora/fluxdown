import type { IRemarkPlugin } from '@fluxdown/types';

import { BaseRemarkPlugin } from '@fluxdown/core-presets/remark';
import { act, render, screen } from '@testing-library/react-native';
import { createRef, StrictMode } from 'react';

import type { FluxdownProps, FluxdownRef } from '../types';

import { Fluxdown } from '..';
import { expectNativeTextContainers, textContent } from './utils/native';
import { createManualTicker, createStepScheduler } from './utils/smooth';

describe('Fluxdown native streaming', () => {
  test.each<{
    streaming: FluxdownProps['streaming'];

    repaired: boolean;
  }>([
    { streaming: undefined, repaired: false },
    { streaming: false, repaired: false },
    { streaming: true, repaired: true },
    { streaming: {}, repaired: true },
    { streaming: { repairEnding: false }, repaired: false },
    { streaming: { smooth: false, effect: false }, repaired: true },
  ])('repairs incomplete endings with streaming=$streaming', ({ streaming, repaired }) => {
    const view = render(<Fluxdown streaming={streaming} text="**ending" />);

    expect(textContent(view.toJSON())).toBe(repaired ? 'ending' : '**ending');

    expectNativeTextContainers(view.toJSON());
  });

  test('recompiles only the final block when ending repairs are disabled', () => {
    const compiled: string[] = [];

    class CompileCounter extends BaseRemarkPlugin {
      static readonly key = 'native-streaming-compile-counter';

      plugin: IRemarkPlugin['plugin'] = () => (_tree, file) => {
        compiled.push(String(file));
      };
    }

    const plugins = [{ remarks: [CompileCounter] }];

    const text = 'first<img\n\nsecond\n\n**ending';

    const view = render(
      <Fluxdown plugins={plugins} streaming={{ smooth: false, effect: false }} text={text} />,
    );

    expect(textContent(view.toJSON())).toBe('firstsecondending');

    expect(compiled).toHaveLength(3);

    compiled.length = 0;

    view.rerender(<Fluxdown plugins={plugins} streaming={false} text={text} />);

    expect(textContent(view.toJSON())).toBe('firstsecond**ending');

    expect(compiled).toEqual(['**ending']);
  });

  test('smoothly reveals compiled text, preserves blocks, and releases the ticker', async () => {
    const ticker = createManualTicker();

    const smooth = { enabled: true, ticker: ticker.Ticker, scheduler: createStepScheduler(2) };

    const ref = createRef<FluxdownRef>();

    const content = (text: string) => (
      <StrictMode>
        <Fluxdown ref={ref} streaming={{ smooth, effect: false }} text={text} />
      </StrictMode>
    );

    const view = render(content('first'));

    const core = ref.current;

    const first = screen.getByText('first');

    expect(ticker.instances).toHaveLength(0);

    view.rerender(content('first\n\n**second**'));

    expect(textContent(view.toJSON())).toBe('first');

    expect(ticker.instances).toHaveLength(1);

    await act(async () => ticker.current().tick(16));

    expect(textContent(view.toJSON())).toBe('firstse');

    expect(screen.getByText('first')).toBe(first);

    await act(async () => ticker.current().tick(32));

    expect(textContent(view.toJSON())).toBe('firstseco');

    await act(async () => ticker.current().tick(48));

    expect(textContent(view.toJSON())).toBe('firstsecond');

    expectNativeTextContainers(view.toJSON());

    expect(ref.current).toBe(core);

    view.unmount();

    await act(async () => {});

    expect(ticker.current().destroyCalls).toBe(1);

    expect(ticker.current().running).toBe(false);

    expect(core?.value.closed).toBe(true);
  });

  test('flushes on disable and replaces custom tickers without losing visible progress', async () => {
    const first = createManualTicker();

    const second = createManualTicker();

    const scheduler = createStepScheduler(1);

    const options = (ticker: typeof first.Ticker) => ({ enabled: true, ticker, scheduler });

    const view = render(
      <Fluxdown streaming={{ smooth: options(first.Ticker), effect: false }} text="abc" />,
    );

    view.rerender(
      <Fluxdown streaming={{ smooth: options(first.Ticker), effect: false }} text="abcdef" />,
    );

    await act(async () => first.current().tick(16));

    expect(textContent(view.toJSON())).toBe('abcd');

    view.rerender(
      <Fluxdown streaming={{ smooth: options(second.Ticker), effect: false }} text="abcdef" />,
    );

    expect(textContent(view.toJSON())).toBe('abcd');

    expect(first.current().destroyCalls).toBe(1);

    await act(async () => second.current().tick(32));

    expect(textContent(view.toJSON())).toBe('abcde');

    view.rerender(<Fluxdown text="abcdef" />);

    expect(textContent(view.toJSON())).toBe('abcdef');

    expect(second.current().destroyCalls).toBe(1);
  });

  test('updates text without a cross-component render notification', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const view = render(<Fluxdown text="alpha" />);

    view.rerender(<Fluxdown text="beta" />);

    await act(async () => {});

    expect(screen.getByText('beta')).toBeTruthy();

    expect(
      consoleError.mock.calls
        .flat()
        .some((value) => String(value).includes('while rendering a different component')),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
