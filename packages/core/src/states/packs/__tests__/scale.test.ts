import type { BaseScaleConfig } from '@fluxdown/core-plugins/plugins/mapper/scale';
import type { IBlockState, PluggableConfigs, PluginSet } from '@fluxdown/types';
import type { Element, ElementContent, Parent, RootContent } from 'hast';

import {
  Scale,
  SCALE_CHAR_VALUE,
  SCALE_DATA_ATTR,
} from '@fluxdown/core-plugins/plugins/mapper/scale';
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

import { collectText, firstBlock } from '../../../__tests__/smooth/utils';
import { countStateObservers } from '../../../../../../scripts/testing/state';
import { BaseRenderer } from '../../../externals';
import { Core } from '../index';

type Block = IBlockState<HastRoot>;

class BlockRenderer extends BaseRenderer<HastRoot, ElementContent, Parent, Block> {
  protected renderItem(block: Block) {
    return block;
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

const config: BaseScaleConfig = { enabled: true, duration: 200, from: 0, blur: 0.08 };

const ConfiguredCore = once(
  ({
    text,
    scale,
  }: {
    text: IReadableClosure<string>;
    scale: IReadableClosure<BaseScaleConfig>;
  }) => {
    const options = useFlatten(scale);

    return S([
      Core<Block>,
      {
        Renderer: D(BlockRenderer),
        text,
        build,
        mappers: ReactiveState.of<PluginSet<MapperPluggable, PluggableConfigs<MapperConfigs>>>([
          [Scale, options],
        ]),
        patches: [],
        renders: [],
      },
    ]);
  },
);

const readCharacters = (node: HastRoot | RootContent): Element[] => {
  if (node.type === 'element' && node.properties[SCALE_DATA_ATTR] === SCALE_CHAR_VALUE) {
    return [node];
  }

  return 'children' in node ? node.children.flatMap(readCharacters) : [];
};

const cleanups = new Set<() => void>();

const setup = (initialText: string, initialScale = config) => {
  const text = MutableState.of(initialText);

  const scale = MutableState.of(initialScale);

  const core = render(S([ConfiguredCore, { text, scale }]));

  const read = () => core.value.value.map((block) => collectText(block.value.value));

  const characters = () => core.value.value.flatMap((block) => readCharacters(block.value.value));

  cleanups.add(() => {
    core.destroy();

    text.destroy();

    scale.destroy();
  });

  return { core, text, scale, read, characters };
};

beforeEach(() => {
  jest.useFakeTimers();

  jest.spyOn(performance, 'now').mockReturnValue(1000);
});

afterEach(() => {
  cleanups.forEach((cleanup) => cleanup());

  cleanups.clear();

  jest.restoreAllMocks();

  jest.useRealTimers();
});

describe('Core scale pipeline', () => {
  test('keeps initial text settled and preserves entrance times across appends and formatting', () => {
    const view = setup('start ');

    expect(view.read()).toEqual(['start']);

    expect(view.characters()).toEqual([]);

    view.text.next('start a');

    const block = firstBlock(view.core.value.value);

    expect(view.characters().map(collectText)).toEqual(['a']);

    expect(view.characters()[0]?.properties.dataScaleStart).toBe(1000);

    jest.mocked(performance.now).mockReturnValue(1050);

    view.text.next('start ab');

    expect(firstBlock(view.core.value.value)).toBe(block);

    expect(view.characters().map((node) => node.properties.dataScaleStart)).toEqual([1000, 1050]);

    view.text.next('start **ab**');

    expect(view.read()).toEqual(['start ab']);

    expect(view.characters().map((node) => node.properties.dataScaleStart)).toEqual([1000, 1050]);

    expect(jest.getTimerCount()).toBe(0);
  });

  test('retains completed block identities and timestamps appended Unicode graphemes', () => {
    const view = setup('first');

    const first = firstBlock(view.core.value.value);

    view.text.next('first\n\n👨‍👩‍👧‍👦 e\u0301 中文');

    expect(view.read()).toEqual(['first', '👨‍👩‍👧‍👦 e\u0301 中文']);

    expect(firstBlock(view.core.value.value)).toBe(first);

    expect(readCharacters(first.value.value)).toEqual([]);

    expect(view.characters().map(collectText)).toEqual(['👨‍👩‍👧‍👦', 'e\u0301', '中', '文']);

    expect(view.characters().every((node) => node.properties.dataScaleStart === 1000)).toBe(true);
  });

  test('changes configuration live and starts from settled text after re-enabling', () => {
    const view = setup('a');

    expect(view.read()).toEqual(['a']);

    view.text.next('abc');

    const fork = firstBlock(view.core.value.value);

    view.scale.next({ ...config, duration: 400, from: 0.5, blur: 0.12 });

    expect(firstBlock(view.core.value.value)).toBe(fork);

    expect(view.characters()[1]?.properties).toMatchObject({
      dataScaleStart: 1000,
      dataScaleDuration: 400,
      dataScaleFrom: 0.5,
      dataScaleBlur: 0.12,
    });

    view.scale.next({ ...config, enabled: false });

    expect(view.characters()).toEqual([]);

    expect(fork.value.closed).toBe(true);

    view.text.next('abcd');

    view.scale.next(config);

    expect(view.characters()).toEqual([]);

    jest.mocked(performance.now).mockReturnValue(1100);

    view.text.next('abcde');

    expect(
      view
        .characters()
        .filter((node) => node.properties.dataScaleStart !== -1)
        .map(collectText),
    ).toEqual(['e']);
  });

  test('resets removed content after clearing and timestamps only rewritten suffixes', () => {
    const view = setup('');

    expect(view.read()).toEqual([]);

    view.text.next('abc');

    expect(view.characters().map((node) => node.properties.dataScaleStart)).toEqual([
      1000, 1000, 1000,
    ]);

    jest.mocked(performance.now).mockReturnValue(1050);

    view.text.next('ax');

    expect(view.read()).toEqual(['ax']);

    expect(view.characters().map((node) => node.properties.dataScaleStart)).toEqual([1000, 1050]);

    view.text.next('');

    expect(view.read()).toEqual([]);

    jest.mocked(performance.now).mockReturnValue(1100);

    view.text.next('a');

    expect(view.characters()[0]?.properties.dataScaleStart).toBe(1100);
  });

  test('releases forks and subscriptions without allocating animation timers', () => {
    const view = setup('initial');

    const subscription = view.core.value.subscribe(() => {});

    expect(view.read()).toEqual(['initial']);

    view.text.next('initial append');

    const fork = firstBlock(view.core.value.value);

    const destroy = jest.spyOn(fork, 'destroy');

    expect(view.characters()).not.toHaveLength(0);

    expect(countStateObservers(view.text)).toBeGreaterThan(0);

    expect(countStateObservers(view.scale)).toBeGreaterThan(0);

    view.core.destroy();

    view.core.destroy();

    expect(destroy).toHaveBeenCalledTimes(1);

    expect(subscription.closed).toBe(true);

    expect(countStateObservers(view.text)).toBe(0);

    expect(countStateObservers(view.scale)).toBe(0);

    expect(view.text.closed).toBe(false);

    expect(view.scale.closed).toBe(false);

    expect(jest.getTimerCount()).toBe(0);
  });
});
