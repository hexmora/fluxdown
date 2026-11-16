import type { BaseSmoothConfig } from '@fluxdown/core-plugins/plugins/mapper/smooth';
import type { IBlockState, PluggableConfigs, PluginSet } from '@fluxdown/types';
import type { ElementContent, Parent, RootContent } from 'hast';
import type { Plugin } from 'unified';

import { BaseRehypePlugin } from '@fluxdown/core-plugins/plugins/rehype/base';
import { assert } from '@fluxdown/utils';
import { first, last } from 'lodash-es';
import {
  D,
  type IReadableClosure,
  MutableState,
  once,
  ReactiveState,
  render,
  S,
  useFlatten,
} from 'stative';

import type { HastRoot } from '../../../typings';
import type { MapperPluggable } from '../../base';
import type { CoreInputs } from '../type';

import { Core } from '..';
import {
  DoubleStepSmoothInterpolator,
  FakeSmoothDriver,
  StepSmoothInterpolator,
} from '../../../__tests__/utils/smooth';
import { restoreGlobals, stubGlobal } from '../../../../../../scripts/testing/globals';
import { BaseRenderer } from '../../../externals';

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

class ReplacementDriver extends ManualDriver {}

const compiled = jest.fn();

class ObserveCompilation extends BaseRehypePlugin {
  static readonly key = 'observe-smooth-compilation';

  readonly config = {};

  plugin: Plugin<[], HastRoot, HastRoot> = () => (tree) => {
    compiled(tree);
  };
}

const build = {
  repair: false,
  repairEnding: false,
  footnote: false,
  tex: false,
  indentedCode: false,
  setextHeading: false,
};

const enabled: BaseSmoothConfig = {
  enabled: true,
  driver: ManualDriver,
  interpolation: StepSmoothInterpolator,
};

const ConfiguredCore = once(
  ({ smooth, ...inputs }: CoreInputs<Block> & { smooth?: IReadableClosure<BaseSmoothConfig> }) => {
    return S([
      Core<Block>,
      {
        ...inputs,
        Renderer: D(inputs.Renderer),
        mappers: smooth
          ? ReactiveState.of<PluginSet<MapperPluggable, PluggableConfigs<MapperConfigs>>>({
              smooth: useFlatten(smooth),
            })
          : undefined,
      },
    ]);
  },
);

const closures = new Set<IReadableClosure<Block[]>>();

const collectText = (node: HastRoot | RootContent): string => {
  return node.type === 'text'
    ? node.value
    : 'children' in node
      ? node.children.map(collectText).join('')
      : '';
};

const setup = (initialText = '', initialSmooth?: BaseSmoothConfig) => {
  const text = MutableState.of(initialText);

  const smooth = MutableState.of(initialSmooth ?? { ...enabled, enabled: false });

  const core = render(
    S([
      ConfiguredCore,
      {
        Renderer: D(BlockRenderer),
        text,
        build,
        smooth: initialSmooth === undefined ? undefined : smooth,
        patches: [],
        renders: [],
        rehypes: [ObserveCompilation],
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

  return { core, read, smooth, text, tick };
};

beforeEach(() => {
  ManualDriver.instances = [];

  StepSmoothInterpolator.instances = [];

  DoubleStepSmoothInterpolator.instances = [];

  compiled.mockClear();
});

afterEach(() => {
  closures.forEach((closure) => closure.destroy());

  closures.clear();

  restoreGlobals();
});

describe('Core smooth pipeline', () => {
  test.each([undefined, { ...enabled, enabled: false }])(
    'renders updates synchronously when smooth is %j',
    (smooth) => {
      const requestFrame = jest.fn();

      stubGlobal('requestAnimationFrame', requestFrame);

      const view = setup('', smooth);

      expect(view.read()).toEqual([]);

      view.text.next('plain stream');

      expect(view.read()).toEqual(['plain stream']);

      expect(ManualDriver.instances).toHaveLength(0);

      expect(requestFrame).not.toHaveBeenCalled();
    },
  );

  test('reveals compiled HAST without parsing Markdown again on each tick', () => {
    const view = setup('', enabled);

    expect(view.read()).toEqual([]);

    view.text.next('**abc**');

    expect(view.read()).toEqual(['']);

    const compilationCount = compiled.mock.calls.length;

    view.tick(16);

    expect(view.read()).toEqual(['a']);

    expect(first(view.core.value.value)?.value.value).toMatchObject({
      children: [{ tagName: 'p', children: [{ tagName: 'strong', children: [{ value: 'a' }] }] }],
    });

    view.tick(32);

    view.tick(48);

    expect(view.read()).toEqual(['abc']);

    expect(compiled).toHaveBeenCalledTimes(compilationCount);
  });

  test('flushes pending content when disabled and resumes from the visible end', () => {
    const view = setup('', enabled);

    expect(view.read()).toEqual([]);

    view.text.next('abc');

    view.tick(16);

    expect(view.read()).toEqual(['a']);

    const previousDriver = last(ManualDriver.instances)!;

    view.smooth.next({ ...enabled, enabled: false });

    expect(view.read()).toEqual(['abc']);

    expect(previousDriver.destroyCalls).toBe(1);

    view.smooth.next(enabled);

    view.text.next('abcde');

    expect(view.read()).toEqual(['abc']);

    view.tick(16);

    expect(view.read()).toEqual(['abcd']);
  });

  test('switches driver and interpolation together without losing visible progress', () => {
    const view = setup('', enabled);

    view.read();

    view.text.next('abcde');

    view.tick(16);

    const previousDriver = last(ManualDriver.instances)!;

    view.smooth.next({
      enabled: true,
      driver: ReplacementDriver,
      interpolation: DoubleStepSmoothInterpolator,
    });

    expect(previousDriver.destroyCalls).toBe(1);

    expect(view.read()).toEqual(['a']);

    view.tick(16);

    expect(view.read()).toEqual(['abc']);

    view.tick(32);

    expect(view.read()).toEqual(['abcde']);
  });

  test('preserves completed block identity across shrink and subsequent growth', () => {
    const view = setup('first\n\nsecond', enabled);

    expect(view.read()).toEqual(['first', 'second']);

    const firstBlock = first(view.core.value.value);

    view.text.next('first\n\ns');

    expect(view.read()).toEqual(['first', 's']);

    view.text.next('first\n\nsecond');

    expect(view.read()).toEqual(['first', 's']);

    for (let timestamp = 16; timestamp <= 80; timestamp += 16) {
      view.tick(timestamp);
    }

    expect(view.read()).toEqual(['first', 'second']);

    expect(first(view.core.value.value)).toBe(firstBlock);
  });

  test('releases its driver while leaving caller-owned inputs usable', () => {
    const view = setup('', enabled);

    view.read();

    view.text.next('pending');

    const driver = last(ManualDriver.instances)!;

    view.core.destroy();

    view.core.destroy();

    expect(driver.destroyCalls).toBe(1);

    expect(view.text.closed).toBe(false);

    expect(view.smooth.closed).toBe(false);

    view.text.next('still usable');

    expect(view.text.value).toBe('still usable');
  });

  test('renders a static smooth document completely and closes the output', () => {
    const core = render(
      S([
        ConfiguredCore,
        {
          Renderer: D(BlockRenderer),
          text: ReactiveState.of('**ready**'),
          build,
          smooth: enabled,
          patches: [],
          renders: [],
        },
      ]),
    );

    closures.add(core);

    expect(core.value.value.map((block) => collectText(block.value.value))).toEqual(['ready']);

    expect(core.value.closed).toBe(true);

    expect(ManualDriver.instances.every((driver) => !driver.running)).toBe(true);
  });
});
