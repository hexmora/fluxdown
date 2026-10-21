import { batch } from 'stative';

import { DoubleStepSmoothInterpolator, StepSmoothInterpolator } from '../utils/smooth';
import {
  collectText,
  createBlock,
  firstBlock,
  latest,
  paragraph,
  PrimarySmoothDriver,
  resetSmoothTests,
  SecondarySmoothDriver,
  setupSmooth,
  visibleText,
} from './utils';

beforeEach(resetSmoothTests);

describe('Smooth configuration', () => {
  test.each([false, true])(
    'starts from settled content when growth and enabling share a batch (growth first: %s)',
    (growthFirst) => {
      const block = createBlock('a', paragraph('a'));

      const harness = setupSmooth([block.block], false);

      const output = harness.state.value.value;

      let fork = firstBlock(output);

      expect(collectText(fork.value.value)).toBe('a');

      batch(() => {
        if (growthFirst) {
          block.source.next(paragraph('abc'));
        }

        harness.enabled.next(true);

        if (!growthFirst) {
          block.source.next(paragraph('abc'));
        }
      });

      expect(Object.is(harness.state.value.value, output)).toBe(false);

      fork = firstBlock(harness.state.value.value);

      expect(collectText(fork.value.value)).toBe('abc');

      block.source.next(paragraph('abcde'));

      const driver = latest(PrimarySmoothDriver.instances);

      driver.tick(16);

      expect(collectText(fork.value.value)).toBe('abcd');

      driver.tick(32);

      expect(collectText(fork.value.value)).toBe('abcde');

      harness.state.destroy();
    },
  );

  test('preserves zero-width content when a disabled boundary grows and becomes empty', () => {
    const empty = {
      type: 'root' as const,
      children: [{ type: 'element' as const, tagName: 'table', properties: {}, children: [] }],
    };

    const block = createBlock('a', empty);

    const harness = setupSmooth([block.block], false);

    const fork = firstBlock(harness.state.value.value);

    expect(fork.range.value).toBeNull();

    expect(fork.value.value).toBe(empty);

    block.source.next(paragraph('a'));

    expect(fork.range.value).toBeNull();

    expect(collectText(fork.value.value)).toBe('a');

    block.source.next(empty);

    expect(fork.range.value).toBeNull();

    expect(fork.value.value).toBe(empty);

    harness.state.destroy();
  });

  test('flushes disabled growth and enables without rewinding visible content', () => {
    const block = createBlock('a', paragraph('abc'));

    const harness = setupSmooth([block.block], false);

    let fork = firstBlock(harness.state.value.value);

    expect(collectText(fork.value.value)).toBe('abc');

    expect(PrimarySmoothDriver.instances).toHaveLength(0);

    expect(StepSmoothInterpolator.instances).toHaveLength(0);

    block.source.next(paragraph('abcde'));

    expect(collectText(fork.value.value)).toBe('abcde');

    harness.enabled.next(true);

    fork = firstBlock(harness.state.value.value);

    expect(collectText(fork.value.value)).toBe('abcde');

    expect(PrimarySmoothDriver.instances).toHaveLength(0);

    block.source.next(paragraph('abcdefg'));

    const driver = latest(PrimarySmoothDriver.instances);

    expect(driver.running).toBe(true);

    expect(collectText(fork.value.value)).toBe('abcde');

    driver.tick(16);

    expect(collectText(fork.value.value)).toBe('abcdef');

    harness.enabled.next(false);

    expect(fork.value.closed).toBe(true);

    fork = firstBlock(harness.state.value.value);

    expect(collectText(fork.value.value)).toBe('abcdefg');

    expect(fork.range.value).toBeNull();

    expect(driver.running).toBe(false);

    harness.state.destroy();
  });

  test('flushes pending blocks and metadata together when disabled', () => {
    const harness = setupSmooth();

    expect(harness.state.value.value).toEqual([]);

    harness.source.next([
      createBlock('a', paragraph('abc'), 0, 2).block,
      createBlock('b', paragraph('def'), 1, 2).block,
    ]);

    const driver = latest(PrimarySmoothDriver.instances);

    driver.tick(16);

    expect(visibleText(harness.state.value.value)).toEqual(['a']);

    harness.enabled.next(false);

    const output = harness.state.value.value;

    expect(visibleText(output)).toEqual(['abc', 'def']);

    expect(output.map((block) => block.range.value)).toEqual([null, null]);

    expect(output.map((block) => block.meta.value.blockCount)).toEqual([2, 2]);

    expect(driver.running).toBe(false);

    harness.state.destroy();
  });

  test('replaces driver and interpolation constructors while retaining visible forks', () => {
    const harness = setupSmooth();

    expect(harness.state.value.value).toEqual([]);

    harness.source.next([createBlock('a', paragraph('abcd')).block]);

    const primary = latest(PrimarySmoothDriver.instances);

    primary.tick(16);

    const fork = firstBlock(harness.state.value.value);

    harness.driver.next(SecondarySmoothDriver);

    const secondary = latest(SecondarySmoothDriver.instances);

    expect(primary.destroyCalls).toBe(1);

    expect(primary.running).toBe(false);

    expect(secondary.running).toBe(true);

    expect(firstBlock(harness.state.value.value)).toBe(fork);

    expect(collectText(fork.value.value)).toBe('a');

    secondary.tick(16);

    expect(collectText(fork.value.value)).toBe('ab');

    harness.interpolation.next(DoubleStepSmoothInterpolator);

    expect(DoubleStepSmoothInterpolator.instances).toHaveLength(1);

    secondary.tick(32);

    expect(firstBlock(harness.state.value.value)).toBe(fork);

    expect(collectText(fork.value.value)).toBe('abcd');

    harness.state.destroy();
  });

  test('defers configuration changes while disabled and uses the latest choices on enable', () => {
    const harness = setupSmooth([], false);

    expect(harness.state.value.value).toEqual([]);

    harness.driver.next(SecondarySmoothDriver);

    harness.interpolation.next(DoubleStepSmoothInterpolator);

    expect(PrimarySmoothDriver.instances).toHaveLength(0);

    expect(SecondarySmoothDriver.instances).toHaveLength(0);

    expect(StepSmoothInterpolator.instances).toHaveLength(0);

    harness.enabled.next(true);

    harness.source.next([createBlock('a', paragraph('abcd')).block]);

    latest(SecondarySmoothDriver.instances).tick(16);

    expect(visibleText(harness.state.value.value)).toEqual(['ab']);

    harness.state.destroy();
  });

  test('uses new configuration after disabling an already initialized runtime', () => {
    const block = createBlock('a', paragraph('a'));

    const harness = setupSmooth([block.block]);

    let fork = firstBlock(harness.state.value.value);

    block.source.next(paragraph('ab'));

    const primary = latest(PrimarySmoothDriver.instances);

    harness.enabled.next(false);

    fork = firstBlock(harness.state.value.value);

    harness.driver.next(SecondarySmoothDriver);

    harness.interpolation.next(DoubleStepSmoothInterpolator);

    block.source.next(paragraph('abc'));

    expect(primary.running).toBe(false);

    expect(collectText(fork.value.value)).toBe('abc');

    expect(SecondarySmoothDriver.instances).toHaveLength(0);

    harness.enabled.next(true);

    fork = firstBlock(harness.state.value.value);

    block.source.next(paragraph('abcdef'));

    latest(SecondarySmoothDriver.instances).tick(16);

    expect(firstBlock(harness.state.value.value)).toBe(fork);

    expect(collectText(fork.value.value)).toBe('abcde');

    expect(primary.destroyCalls).toBe(1);

    harness.state.destroy();
  });
});
