import type { IBlockState } from '@fluxdown/types';
import type { Element, ElementContent, Parent, RootContent } from 'hast';

import { Chunk, CHUNK_DATA_ATTR } from '@fluxdown/core-presets/mapper';
import { D, MutableState, render, S } from 'stative';

import type { HastRoot } from '../../../typings';

import { collectText } from '../../../__tests__/smooth/utils';
import { countStateObservers } from '../../../../../../scripts/testing/state';
import { BaseRenderer } from '../../../externals';
import { Core } from '../index';

type Block = IBlockState<HastRoot>;

const build = {
  repair: false,
  repairEnding: false,
  footnote: false,
  tex: false,
  indentedCode: false,
  setextHeading: false,
};

class BlockRenderer extends BaseRenderer<HastRoot, ElementContent, Parent, Block> {
  protected renderItem(block: Block) {
    return block;
  }
}

const readChunks = (node: HastRoot | RootContent): Element[] => {
  if (node.type === 'element' && node.properties[CHUNK_DATA_ATTR] === '1') {
    return [node];
  }

  return 'children' in node ? node.children.flatMap(readChunks) : [];
};

test('gives all blocks in one incoming revision the same entrance time', () => {
  const text = MutableState.of('initial');
  const core = render(
    S([
      Core<Block>,
      {
        Renderer: D(BlockRenderer),
        text,
        build,
        patches: [],
        renders: [],
        mappers: [[Chunk, { enabled: true }]],
      },
    ]),
  );
  let now = 1000;
  const clock = jest.spyOn(performance, 'now').mockImplementation(() => now++);
  const wallClock = jest.spyOn(Date, 'now').mockReturnValue(-1);

  try {
    const first = core.value.value[0];
    expect(first?.value.value).toBeDefined();
    text.next('initial append\n\nsecond\n\nthird');
    const chunks = core.value.value.flatMap((block) => readChunks(block.value.value));

    expect(chunks.map(collectText)).toEqual([' append', 'second', 'third']);
    expect(new Set(chunks.map((chunk) => chunk.properties.dataChunkStart)).size).toBe(1);
    expect(core.value.value[0]).toBe(first);

    text.next('initial append\n\nsecond\n\nthird more');
    const next = core.value.value.flatMap((block) => readChunks(block.value.value));
    expect(next.map(collectText)).toEqual([' append', 'second', 'third', ' more']);
    expect(next[3]?.properties.dataChunkStart).toBeGreaterThan(
      chunks[0]?.properties.dataChunkStart as number,
    );
    expect(wallClock).not.toHaveBeenCalled();
  } finally {
    core.destroy();
    text.destroy();
    clock.mockRestore();
    wallClock.mockRestore();
  }
});

test('releases the batch clock, forks, and all input subscriptions', () => {
  const text = MutableState.of('initial');
  const core = render(
    S([
      Core<Block>,
      {
        Renderer: D(BlockRenderer),
        text,
        build,
        patches: [],
        renders: [],
        mappers: [[Chunk, { enabled: true }]],
      },
    ]),
  );
  const subscription = core.value.subscribe(() => {});
  text.next('initial append\n\nsecond');
  const forks = core.value.value;

  forks.forEach((block) => expect(block.value.value).toBeDefined());
  expect(countStateObservers(text)).toBeGreaterThan(0);

  core.destroy();
  core.destroy();

  expect(subscription.closed).toBe(true);
  expect(forks.every((block) => block.value.closed)).toBe(true);
  expect(countStateObservers(text)).toBe(0);
  expect(text.closed).toBe(false);
  text.destroy();
});
