import type { BaseShadConfig, BaseSmoothConfig } from '@fluxdown/core-presets/mapper';
import type { IBlockState, PluggableConfigs, PluginSet } from '@fluxdown/types';
import type { ElementContent, Parent } from 'hast';

import { Shad } from '@fluxdown/core-presets/mapper';
import { assert } from '@fluxdown/utils';
import { last } from 'lodash-es';
import {
  D,
  type IReadableClosure,
  MutableState,
  once,
  ReactiveState,
  render,
  S,
  useFlatten,
  useMap,
} from 'stative';

import type { HastRoot } from '../../../typings';
import type { MapperPluggable } from '../../base';
import type { CoreInputs } from '../type';

import { readFades } from '../../../__tests__/shad/utils';
import { collectText, firstBlock } from '../../../__tests__/smooth/utils';
import { FakeSmoothDriver, StepSmoothInterpolator } from '../../../__tests__/utils/smooth';
import { BaseRenderer } from '../../../externals';
import { Core } from '../index';

type Block = IBlockState<HastRoot>;

class BlockRenderer extends BaseRenderer<HastRoot, ElementContent, Parent, Block> {
  protected renderItem(block: Block) {
    return block;
  }
}

class ManualDriver extends FakeSmoothDriver {
  static instances: ManualDriver[] = [];

  constructor() {
    super();

    ManualDriver.instances.push(this);
  }
}

const build = {
  repair: false,
  repairEnding: false,
  footnote: false,
  tex: false,
  indentedCode: false,
  setextHeading: false,
};

const smooth: BaseSmoothConfig = {
  enabled: true,
  driver: ManualDriver,
  interpolation: StepSmoothInterpolator,
};

const enabled: BaseShadConfig = { enabled: true, length: 2, duration: 400 };

const disabled: BaseShadConfig = { ...enabled, enabled: false };

type ConfiguredCoreInputs = Omit<CoreInputs<Block>, 'mappers'> & {
  shad?: IReadableClosure<BaseShadConfig>;

  smooth?: IReadableClosure<BaseSmoothConfig>;

  mappers?: IReadableClosure<MapperPluggable[] | undefined>;
};

const ConfiguredCore = once(
  ({ shad, smooth: smoothSource, mappers, ...inputs }: ConfiguredCoreInputs) => {
    const configs: PluggableConfigs<MapperConfigs> = {
      shad: shad ? useFlatten(shad) : undefined,
      smooth: smoothSource ? useFlatten(smoothSource) : undefined,
    };

    return S([
      Core<Block>,
      {
        ...inputs,
        Renderer: D(inputs.Renderer),
        mappers: mappers
          ? useMap(
              mappers,
              (items): PluginSet<MapperPluggable, PluggableConfigs<MapperConfigs>> =>
                items ?? configs,
            )
          : ReactiveState.of<PluginSet<MapperPluggable, PluggableConfigs<MapperConfigs>>>(configs),
      },
    ]);
  },
);

const closures = new Set<IReadableClosure<Block[]>>();

const setup = (
  initialText: string,
  initialShad?: BaseShadConfig,
  initialSmooth?: BaseSmoothConfig,
) => {
  const text = MutableState.of(initialText);

  const shad = MutableState.of(initialShad ?? disabled);

  const mappers = MutableState.of<MapperPluggable[] | undefined>(undefined);

  const core = render(
    S([
      ConfiguredCore,
      {
        Renderer: D(BlockRenderer),
        text,
        build,
        shad: initialShad === undefined ? undefined : shad,
        mappers,
        smooth: initialSmooth === undefined ? undefined : ReactiveState.of(initialSmooth),
        patches: [],
        renders: [],
      },
    ]),
  );

  closures.add(core);

  const read = () => core.value.value.map((block) => collectText(block.value.value));

  const tick = (timestamp: number) => {
    const driver = last(ManualDriver.instances);

    assert(driver);

    driver.tick(timestamp);
  };

  return { core, read, mappers, shad, text, tick };
};

beforeEach(() => {
  jest.useFakeTimers();

  ManualDriver.instances = [];

  StepSmoothInterpolator.instances = [];
});

afterEach(() => {
  closures.forEach((closure) => closure.destroy());

  closures.clear();

  jest.useRealTimers();
});

const fades = (view: ReturnType<typeof setup>) =>
  view.core.value.value.flatMap((block) => readFades(block.value.value));

/**
 * Blocks compute lazily, so read once to establish which content was present at mount.
 */
const mount = (...args: Parameters<typeof setup>) => {
  const view = setup(...args);

  view.read();

  return view;
};

describe('Core shad pipeline', () => {
  test('keeps a bare Shad disabled and fades appended characters with the defaults', () => {
    const view = setup('abcdefghijkl');

    view.mappers.next([Shad]);

    view.text.next('abcdefghijklm');

    expect(fades(view)).toEqual([]);

    view.mappers.next([[Shad, { enabled: ReactiveState.of(true) }]]);

    // Content present when the effect mounts is already settled.
    expect(fades(view)).toEqual([]);

    view.text.next('abcdefghijklmn');

    expect(fades(view)).toEqual([{ text: 'n', start: expect.any(Number), duration: 400 }]);
  });

  test.each([undefined, disabled, { ...disabled, length: 4 }])(
    'keeps fading disabled for %j',
    (config) => {
      const view = mount('abcd', config);

      view.text.next('abcde');

      expect(view.read()).toEqual(['abcde']);

      expect(fades(view)).toEqual([]);
    },
  );

  test('plays each batch on its own clock, independent of later appends', () => {
    const view = mount('ab', enabled);

    view.text.next('abc');

    const [first] = fades(view);

    jest.advanceTimersByTime(100);

    view.text.next('abcd');

    expect(fades(view)).toEqual([first, { text: 'd', start: first!.start + 100, duration: 400 }]);

    jest.advanceTimersByTime(300);

    view.text.next('abcde');

    // 'c' finished at 400 ms; 'd' is still fading on its own clock.
    expect(fades(view).map(({ text }) => text)).toEqual(['d', 'e']);
  });

  test('shortens fades while more than `length` characters are fading', () => {
    const view = mount('a', enabled);

    view.text.next('abcdefghi');

    // Eight characters arrive at once against a length of two: a quarter of the duration.
    expect(fades(view)).toEqual([{ text: 'bcdefghi', start: expect.any(Number), duration: 100 }]);

    jest.advanceTimersByTime(100);

    view.text.next('abcdefghij');

    expect(last(fades(view))).toEqual({
      text: 'j',
      start: expect.any(Number),
      duration: 400,
    });
  });

  test('counts fades across blocks against one budget', () => {
    const view = mount('first', enabled);

    view.text.next('first\n\nsecond\n\nthird');

    const [second, third] = fades(view);

    expect(second?.text).toBe('second');

    expect(third?.text).toBe('third');

    expect(second?.start).toBe(third?.start);

    // The later block sees the earlier block's characters already in flight.
    expect(third!.duration).toBeLessThan(second!.duration);
  });

  test('applies live configuration to new batches only', () => {
    const view = mount('ab', enabled);

    view.text.next('abc');

    view.shad.next({ ...enabled, length: 10, duration: 1000 });

    expect(fades(view)).toEqual([{ text: 'c', start: expect.any(Number), duration: 400 }]);

    view.text.next('abcd');

    expect(last(fades(view))).toEqual({ text: 'd', start: expect.any(Number), duration: 1000 });

    view.shad.next(disabled);

    expect(fades(view)).toEqual([]);
  });

  test('fades Smooth output as it is revealed, not when it is received', () => {
    const view = mount('', enabled, smooth);

    view.text.next('abc');

    expect(fades(view)).toEqual([]);

    view.tick(16);

    expect(fades(view).map(({ text }) => text)).toEqual(['a']);

    jest.advanceTimersByTime(16);

    view.tick(32);

    const visible = fades(view);

    expect(visible.map(({ text }) => text)).toEqual(['a', 'b']);

    expect(visible[1]!.start).toBeGreaterThan(visible[0]!.start);
  });
});
