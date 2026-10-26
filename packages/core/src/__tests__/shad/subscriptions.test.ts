import type { IBlockState } from '@fluxdown/types';

import { D, MutableState, render, S, toClosure } from 'stative';

import type { HastRoot } from '../../typings';

import { countStateObservers } from '../../../../../scripts/testing/state';
import { ShadValue } from '../../../../core-plugins/src/plugins/mapper/shad/states/shad-blocks/states/shad-block/states/shad-value';
import { collectText, createBlock, paragraph } from '../smooth/utils';
import { readParts } from './utils';

test('only the current tail subscribes to shading progress and mask width', () => {
  const first = createBlock('first', paragraph('abcd'));

  const last = createBlock('last', paragraph('efgh'));

  const current = first.block.fork();

  const tail = MutableState.of<IBlockState<HastRoot> | undefined>(last.block);

  const input = MutableState.of({ length: 2, activeLength: 1 });

  const progress = toClosure(input);

  const position = progress.value;

  const maskWidth = toClosure(MutableState.of(15));

  const width = maskWidth.value;

  const state = render(
    S([ShadValue, { source: D(first.block), current: D(current), tail, progress, maskWidth }]),
  );

  const output = jest.fn();

  state.value.subscribe(output);

  expect(collectText(state.value.value)).toBe('abcd');

  expect(countStateObservers(position)).toBe(0);

  expect(countStateObservers(width)).toBe(0);

  input.next({ length: 2, activeLength: 0 });

  expect(output).toHaveBeenCalledTimes(1);

  tail.next(first.block);

  expect(countStateObservers(position)).toBe(1);

  expect(countStateObservers(width)).toBe(1);

  expect(readParts(state.value.value)).toEqual({ leading: 'abcd', active: '' });

  input.next({ length: 2, activeLength: 1 });

  expect(readParts(state.value.value)).toEqual({ leading: 'abc', active: 'd' });

  tail.next(last.block);

  expect(countStateObservers(position)).toBe(0);

  expect(countStateObservers(width)).toBe(0);

  expect(readParts(state.value.value)).toBeUndefined();

  first.source.next(paragraph('abcde'));

  expect(collectText(state.value.value)).toBe('abcde');

  tail.next(first.block);

  expect(countStateObservers(position)).toBe(1);

  expect(countStateObservers(width)).toBe(1);

  state.destroy();

  expect(countStateObservers(position)).toBe(0);

  expect(countStateObservers(width)).toBe(0);

  expect([first.source, last.source, tail, input].every((source) => !source.closed)).toBe(true);

  current.destroy();

  first.block.destroy();

  last.block.destroy();
});
