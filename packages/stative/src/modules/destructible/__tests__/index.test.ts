import { Destructible, type DestructibleTarget } from '../index';

class TestDestructible extends Destructible {
  track<T extends DestructibleTarget>(value: T): T {
    return this.clearable(value);
  }
}

describe('Destructible', () => {
  test('clears targets added during teardown in the same pass', () => {
    const owner = new TestDestructible();
    const calls: string[] = [];

    owner.track(() => {
      calls.push('first');

      owner.track(() => calls.push('added'));
    });

    owner.track(() => calls.push('second'));

    owner.destroy();
    owner.destroy();

    expect(calls).toEqual(['first', 'second', 'added']);
  });

  test('retains the existing error boundary and does not repeat failed teardown', () => {
    const owner = new TestDestructible();
    const later = jest.fn();
    const error = new Error('teardown');

    owner.track(() => {
      throw error;
    });

    owner.track(later);

    expect(() => owner.destroy()).toThrow(error);
    expect(() => owner.destroy()).not.toThrow();
    expect(later).not.toHaveBeenCalled();
  });

  test('returns and clears a tracked value with the owner', () => {
    const owner = new TestDestructible();
    const target = { destroy: jest.fn() };

    expect(owner.track(target)).toBe(target);

    owner.destroy();
    owner.destroy();

    expect(target.destroy).toHaveBeenCalledTimes(1);
  });
});
