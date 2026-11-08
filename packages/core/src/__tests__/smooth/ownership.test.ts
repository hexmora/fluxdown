import { batch } from 'stative';

import { countStateObservers } from '../../../../../scripts/testing/state';
import { StepSmoothInterpolator } from '../utils/smooth';
import {
  collectText,
  createBlock,
  firstBlock,
  latest,
  paragraph,
  PrimarySmoothDriver,
  resetSmoothTests,
  setupSmooth,
  visibleText,
} from './utils';

beforeEach(resetSmoothTests);

describe('Smooth ownership', () => {
  test.each(['driver start', 'interpolation constructor'] as const)(
    'destroys owned resources after %s fails on the first content growth',
    (stage) => {
      const failure = new Error('Smooth initialization failed.');

      class FailingDriver extends PrimarySmoothDriver {
        override start(): number {
          super.start();

          throw failure;
        }
      }

      class FailingInterpolator extends StepSmoothInterpolator {
        constructor() {
          super();

          throw failure;
        }
      }

      const block = createBlock('a', paragraph('ready'));

      const harness = setupSmooth([block.block]);

      if (stage === 'driver start') {
        harness.driver.next(FailingDriver);
      } else {
        harness.interpolation.next(FailingInterpolator);
      }

      const error = jest.fn();

      harness.state.value.subscribe({ error });

      if (stage === 'interpolation constructor') {
        expect(() => block.source.next(paragraph('ready to stream'))).toThrow(failure);
      } else {
        block.source.next(paragraph('ready to stream'));

        expect(error).toHaveBeenCalledTimes(1);
        expect(error).toHaveBeenCalledWith(failure);

        expect(PrimarySmoothDriver.instances.every((driver) => !driver.running)).toBe(true);
      }

      harness.state.destroy();

      expect(countStateObservers(block.block.prevPrefixLength)).toBe(0);

      expect(PrimarySmoothDriver.instances.every((driver) => !driver.running)).toBe(true);

      expect(block.source.closed).toBe(false);
    },
  );

  test('drains pending content before completing after all upstream states finish', () => {
    const block = createBlock('a', paragraph('abc'));

    const harness = setupSmooth();

    const output = harness.state.value;

    const complete = jest.fn();

    output.subscribe({ complete });

    harness.source.next([block.block]);

    const fork = firstBlock(output.value);

    const driver = latest(PrimarySmoothDriver.instances);

    block.source.complete();

    harness.source.complete();

    harness.enabled.complete();

    harness.driver.complete();

    harness.interpolation.complete();

    expect(block.block.baseLength.closed).toBe(true);

    expect(collectText(fork.value.value)).toBe('');

    expect(output.closed).toBe(false);

    expect(driver.running).toBe(true);

    expect(complete).not.toHaveBeenCalled();

    driver.tick(16);

    driver.tick(32);

    expect(collectText(fork.value.value)).toBe('ab');

    expect(output.closed).toBe(false);

    driver.tick(48);

    expect(collectText(fork.value.value)).toBe('abc');

    expect(output.closed).toBe(true);

    expect(complete).toHaveBeenCalledTimes(1);

    expect(driver.running).toBe(false);

    harness.state.destroy();
  });

  test.each([
    { change: 'content', intermediate: ['ab'], final: ['abc'] },
    { change: 'blocks', intermediate: ['a', 'b'], final: ['a', 'bc'] },
  ])('drains final $change changes committed with upstream completion', (scenario) => {
    const first = createBlock('first', paragraph('a'));

    const second = createBlock('second', paragraph('bc'));

    const harness = setupSmooth([first.block]);

    const output = harness.state.value;

    const complete = jest.fn();

    output.subscribe({ complete });

    batch(() => {
      if (scenario.change === 'content') {
        first.source.next(paragraph('abc'));
      } else {
        harness.source.next([first.block, second.block]);
      }

      first.source.complete();

      second.source.complete();

      harness.source.complete();

      harness.enabled.complete();

      harness.driver.complete();

      harness.interpolation.complete();
    });

    const driver = latest(PrimarySmoothDriver.instances);

    expect(visibleText(output.value)).toEqual(['a']);

    expect(output.closed).toBe(false);

    expect(complete).not.toHaveBeenCalled();

    expect(driver.running).toBe(true);

    driver.tick(16);

    expect(visibleText(output.value)).toEqual(scenario.intermediate);

    expect(output.closed).toBe(false);

    driver.tick(32);

    expect(visibleText(output.value)).toEqual(scenario.final);

    expect(output.closed).toBe(true);

    expect(complete).toHaveBeenCalledTimes(1);

    expect(driver.running).toBe(false);

    expect(driver.destroyCalls).toBe(1);

    harness.state.destroy();

    expect(driver.destroyCalls).toBe(1);
  });

  test.each([false, true])(
    'completes already visible content without another emission when enabled is %s',
    (enabled) => {
      const block = createBlock('a', paragraph('ready'));

      const harness = setupSmooth([block.block], enabled);

      const output = harness.state.value;

      const next = jest.fn();

      const complete = jest.fn();

      output.subscribe({ next, complete });

      batch(() => {
        block.source.complete();

        harness.source.complete();

        harness.enabled.complete();

        harness.driver.complete();

        harness.interpolation.complete();
      });

      expect(visibleText(output.value)).toEqual(['ready']);

      expect(output.closed).toBe(true);

      expect(next).toHaveBeenCalledTimes(1);

      expect(complete).toHaveBeenCalledTimes(1);

      expect(PrimarySmoothDriver.instances).toHaveLength(0);

      expect(PrimarySmoothDriver.instances.every((driver) => !driver.running)).toBe(true);

      harness.state.destroy();

      expect(PrimarySmoothDriver.instances.every((driver) => driver.destroyCalls === 1)).toBe(true);
    },
  );

  test('releases removed forks and restarts a cleared stream from zero', () => {
    const block = createBlock('old', paragraph('old'));

    const harness = setupSmooth([block.block]);

    const fork = firstBlock(harness.state.value.value);

    const destroyFork = jest.spyOn(fork, 'destroy');

    const meta = fork.meta;

    const range = fork.range;

    const destroySource = jest.spyOn(block.block, 'destroy');

    expect(countStateObservers(block.block.prevPrefixLength)).toBeGreaterThan(0);

    harness.source.next([]);

    expect(harness.state.value.value).toEqual([]);

    expect(destroyFork).toHaveBeenCalledTimes(1);

    expect(meta.closed).toBe(true);

    expect(range.closed).toBe(true);

    expect(destroySource).not.toHaveBeenCalled();

    expect(countStateObservers(block.block.prevPrefixLength)).toBe(0);

    harness.source.next([createBlock('new', paragraph('new')).block]);

    expect(visibleText(harness.state.value.value)).toEqual(['']);

    const driver = latest(PrimarySmoothDriver.instances);

    for (const time of [16, 32, 48]) {
      driver.tick(time);
    }

    expect(visibleText(harness.state.value.value)).toEqual(['new']);

    harness.state.destroy();
  });

  test('destroys owned resources once and releases every borrowed subscription', () => {
    const block = createBlock('a', paragraph('value'));

    const harness = setupSmooth([block.block]);

    const subscription = harness.state.value.subscribe(() => undefined);

    const fork = firstBlock(harness.state.value.value);

    const destroyFork = jest.spyOn(fork, 'destroy');

    const meta = fork.meta;

    const range = fork.range;

    const destroySource = jest.spyOn(block.block, 'destroy');

    block.source.next(paragraph('value grows'));

    const driver = latest(PrimarySmoothDriver.instances);

    const borrowed = [
      harness.source,
      harness.enabled,
      harness.driver,
      harness.interpolation,
      block.block.prevPrefixLength,
    ];

    expect(borrowed.every((state) => countStateObservers(state) > 0)).toBe(true);

    harness.state.destroy();

    harness.state.destroy();

    expect(subscription.closed).toBe(true);

    expect(driver.destroyCalls).toBe(1);

    expect(driver.running).toBe(false);

    expect(destroyFork).toHaveBeenCalledTimes(1);

    expect(meta.closed).toBe(true);

    expect(range.closed).toBe(true);

    expect(destroySource).not.toHaveBeenCalled();

    expect(borrowed.map(countStateObservers)).toEqual([0, 0, 0, 0, 0]);

    expect([...borrowed, block.source, block.meta].every((state) => !state.closed)).toBe(true);
  });

  test('can be destroyed before initialization without creating runtime resources', () => {
    const block = createBlock('a', paragraph('value'));

    const harness = setupSmooth([block.block]);

    const destroySource = jest.spyOn(block.block, 'destroy');

    expect(
      [harness.source, harness.enabled, harness.driver, harness.interpolation].map(
        countStateObservers,
      ),
    ).toEqual([0, 0, 0, 0]);

    harness.state.destroy();

    harness.state.destroy();

    expect(PrimarySmoothDriver.instances).toHaveLength(0);

    expect(StepSmoothInterpolator.instances).toHaveLength(0);

    expect(destroySource).not.toHaveBeenCalled();

    expect(() => harness.state.value).toThrow(/destroyed state closure/);
  });

  test('forwards source errors and still releases owned resources on destroy', () => {
    const block = createBlock('a', paragraph('value'));

    const harness = setupSmooth([block.block]);

    const error = jest.fn();

    const subscription = harness.state.value.subscribe({ error });

    block.source.next(paragraph('value grows'));

    const driver = latest(PrimarySmoothDriver.instances);

    const failure = new Error('Source failed.');

    harness.source.error(failure);

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(failure);

    expect(subscription.closed).toBe(true);

    harness.state.destroy();

    expect(driver.running).toBe(false);

    expect(driver.destroyCalls).toBe(1);

    expect(block.source.closed).toBe(false);

    expect(countStateObservers(block.block.prevPrefixLength)).toBe(0);
  });
});
