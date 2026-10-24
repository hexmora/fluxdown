import type { BaseSuffixConfig, SuffixType } from '@fluxdown/core-plugins/plugins/mapper/suffix';
import type { IBlockState, PluggableConfigs, PluginSet } from '@fluxdown/types';
import type { Element, ElementContent, Parent, RootContent } from 'hast';

import { Smooth } from '@fluxdown/core-plugins/plugins/mapper/smooth';
import { isSuffixNode, Suffix } from '@fluxdown/core-plugins/plugins/mapper/suffix';
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
import { FakeSmoothTicker, StepSmoothScheduler } from '../../../__tests__/utils/smooth';
import { countStateObservers } from '../../../../../../scripts/testing/state';
import { BaseRenderer } from '../../../externals';
import { Core } from '../index';

type Block = IBlockState<HastRoot>;

class BlockRenderer extends BaseRenderer<HastRoot, ElementContent, Parent, Block> {
  protected renderItem(block: Block) {
    return block;
  }
}

class ManualTicker extends FakeSmoothTicker {
  static current: ManualTicker;
  constructor() {
    super();
    ManualTicker.current = this;
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

const ConfiguredCore = once(
  ({
    text,
    suffix,
    suffixFirst,
  }: {
    text: IReadableClosure<string>;
    suffix: IReadableClosure<BaseSuffixConfig>;
    suffixFirst: boolean;
  }) => {
    const options = useFlatten(suffix);
    const suffixMapper: MapperPluggable = [Suffix, { ...options, priority: suffixFirst ? -1 : 1 }];
    const smoothMapper: MapperPluggable = [
      Smooth,
      { enabled: true, ticker: ManualTicker, scheduler: StepSmoothScheduler },
    ];

    return S([
      Core<Block>,
      {
        Renderer: D(BlockRenderer),
        text,
        build,
        mappers: ReactiveState.of<PluginSet<MapperPluggable, PluggableConfigs<MapperConfigs>>>([
          suffixMapper,
          smoothMapper,
        ]),
        patches: [],
        renders: [],
      },
    ]);
  },
);

const findMarkers = (node: HastRoot | RootContent): Element[] => {
  if (node.type !== 'root' && isSuffixNode(node)) {
    return [node];
  }
  return 'children' in node ? node.children.flatMap(findMarkers) : [];
};

const cleanups = new Set<() => void>();
const setup = (initialText: string, suffixFirst: boolean) => {
  const text = MutableState.of(initialText);
  const suffix = MutableState.of<BaseSuffixConfig>({ enabled: true, type: 'cursor' });
  const core = render(S([ConfiguredCore, { text, suffix, suffixFirst: D(suffixFirst) }]));
  const read = () => core.value.value.map((block) => collectText(block.value.value));
  const markers = () => core.value.value.flatMap((block) => findMarkers(block.value.value));
  cleanups.add(() => {
    core.destroy();
    text.destroy();
    suffix.destroy();
  });
  return { text, suffix, core, read, markers };
};

afterEach(() => {
  cleanups.forEach((cleanup) => cleanup());
  cleanups.clear();
});

describe('Core suffix pipeline', () => {
  test.each([false, true])('tracks the visible block when suffixFirst=%s', (suffixFirst) => {
    const view = setup('first', suffixFirst);
    expect(view.read()).toEqual(['first']);
    expect(view.markers()).toHaveLength(1);
    const first = firstBlock(view.core.value.value);

    view.text.next('first\n\nsecond');
    expect(view.read()).toEqual(['first']);
    expect(findMarkers(first.value.value)).toHaveLength(1);

    ManualTicker.current.tick(16);
    expect(view.read()).toEqual(['first', 's']);
    expect(view.markers()).toHaveLength(1);
    expect(findMarkers(first.value.value)).toHaveLength(0);

    view.suffix.next({ enabled: true, type: 'custom' as SuffixType });
    expect(view.markers()[0]?.properties.dataFluxdownSuffix).toBe('custom');
    expect(view.read()).toEqual(['first', 's']);

    view.text.next('');
    expect(view.read()).toEqual([]);
    expect(view.markers()).toEqual([]);
  });

  test('closes mapped forks and releases inputs when disabled and destroyed', () => {
    const view = setup('text', false);
    expect(view.markers()).toHaveLength(1);
    const fork = firstBlock(view.core.value.value);
    const destroy = jest.spyOn(fork, 'destroy');

    view.suffix.next({ enabled: false, type: 'cursor' });
    expect(view.markers()).toEqual([]);
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(fork.value.closed).toBe(true);

    view.suffix.next({ enabled: true, type: 'dot' });
    expect(view.markers()).toHaveLength(1);
    view.core.destroy();
    view.core.destroy();
    expect(countStateObservers(view.text)).toBe(0);
    expect(countStateObservers(view.suffix)).toBe(0);
    expect(view.text.closed).toBe(false);
    expect(view.suffix.closed).toBe(false);
  });
});
