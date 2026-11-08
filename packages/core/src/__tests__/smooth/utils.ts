import type {
  SmoothDriverClass,
  SmoothInterpolatorClass,
} from '@fluxdown/core-plugins/plugins/mapper/smooth';
import type { IBlockMeta, IBlockState } from '@fluxdown/types';
import type { Element, ElementContent, RootContent, Text } from 'hast';

import { Smooth } from '@fluxdown/core-plugins/plugins/mapper/smooth';
import { first, last } from 'lodash-es';
import { MutableState, render, S } from 'stative';

import type { HastRoot } from '../../typings';

import { BlockItem } from '../../states';
import {
  DoubleStepSmoothInterpolator,
  FakeSmoothDriver,
  StepSmoothInterpolator,
} from '../utils/smooth';

export class PrimarySmoothDriver extends FakeSmoothDriver {
  static instances: PrimarySmoothDriver[] = [];

  constructor() {
    super();

    PrimarySmoothDriver.instances.push(this);
  }
}

export class SecondarySmoothDriver extends FakeSmoothDriver {
  static instances: SecondarySmoothDriver[] = [];

  constructor() {
    super();

    SecondarySmoothDriver.instances.push(this);
  }
}

export const resetSmoothTests = () => {
  PrimarySmoothDriver.instances = [];

  SecondarySmoothDriver.instances = [];

  StepSmoothInterpolator.instances = [];

  DoubleStepSmoothInterpolator.instances = [];
};

export const root = (children: RootContent[] = []): HastRoot => ({ type: 'root', children });

export const text = (value: string): Text => ({ type: 'text', value });

export const element = (tagName: string, children: ElementContent[] = []): Element => ({
  type: 'element',
  tagName,
  properties: {},
  children,
});

export const paragraph = (value: string) => root([element('p', [text(value)])]);

export const collectText = (node: HastRoot | RootContent): string => {
  if (node.type === 'text') {
    return node.value;
  }

  if ('children' in node) {
    return node.children.map(collectText).join('');
  }

  return '';
};

export const createBlock = (key: string, value: HastRoot, currentIndex = 0, blockCount = 1) => {
  const source = MutableState.of(value);

  const meta = MutableState.of<IBlockMeta>({
    key,
    currentIndex,
    blockCount,
    sourceText: collectText(value),
    charStart: 0,
    charEnd: collectText(value).length,
  });

  const block = render(S([BlockItem, { source, meta }]));

  return { block, source, meta };
};

export const latest = <T>(instances: T[]): T => {
  const instance = last(instances);

  if (!instance) {
    throw new Error('Expected a constructed test instance.');
  }

  return instance;
};

export const firstBlock = (blocks: IBlockState<HastRoot>[]) => {
  const block = first(blocks);

  if (!block) {
    throw new Error('Expected a visible block.');
  }

  return block;
};

export const setupSmooth = (initialBlocks: IBlockState<HastRoot>[] = [], initialEnabled = true) => {
  const source = MutableState.of(initialBlocks);

  const enabled = MutableState.of(initialEnabled);

  const driver = MutableState.of<SmoothDriverClass>(PrimarySmoothDriver);

  const interpolation = MutableState.of<SmoothInterpolatorClass>(StepSmoothInterpolator);

  const state = render(S([Smooth<HastRoot>, { source, enabled, driver, interpolation }]));

  return { state, source, enabled, driver, interpolation };
};

export const visibleText = (blocks: IBlockState<HastRoot>[]) => {
  return blocks.map((block) => collectText(block.value.value));
};
