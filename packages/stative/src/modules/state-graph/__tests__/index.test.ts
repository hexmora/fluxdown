import { batch, dequeue, enqueue, StateNode } from '../../..';

describe('state graph queue', () => {
  test('ignores idle and disposed nodes without blocking subsequent updates', () => {
    const idle = new StateNode();
    const disposed = new StateNode();
    const active = new StateNode();
    const update = jest.fn();

    disposed.destroy();

    enqueue(idle);
    enqueue(disposed);
    active.schedule(update);

    expect(update).toHaveBeenCalledTimes(1);

    idle.destroy();
    active.destroy();
  });

  test('retries the waiting target before later updates after dependency errors', () => {
    const target = new StateNode();

    const later = new StateNode();

    const first = new StateNode();

    const second = new StateNode();

    target.dependOn(first);

    target.dependOn(second);

    const events: string[] = [];

    const failure = new Error('First dependency failed.');

    expect(() =>
      batch(() => {
        target.schedule(() => events.push('target'));

        later.schedule(() => events.push('later'));

        first.schedule(() => {
          events.push('first');

          throw failure;
        });

        second.schedule(() => {
          events.push('second');

          throw new Error('Second dependency failed.');
        });
      }),
    ).toThrow(failure);

    expect(events).toEqual(['first', 'second', 'target', 'later']);

    target.destroy();

    later.destroy();

    first.destroy();

    second.destroy();
  });

  test('preserves queue order when callbacks reinsert earlier, current, and later nodes', () => {
    const first = new StateNode();

    const current = new StateNode();

    const later = new StateNode();

    const added = new StateNode();

    const events: string[] = [];

    batch(() => {
      first.schedule(() => events.push('first'));

      current.schedule(() => {
        events.push('current');

        batch(() => {
          first.schedule(() => events.push('first again'));

          current.schedule(() => events.push('current again'));

          dequeue(later);

          enqueue(later);

          added.schedule(() => events.push('added'));
        });
      });

      later.schedule(() => events.push('later'));
    });

    expect(events).toEqual(['first', 'current', 'current again', 'first again', 'later', 'added']);

    first.destroy();

    current.destroy();

    later.destroy();

    added.destroy();
  });

  test('skips nodes disposed by an earlier callback and drains newly enqueued idle nodes', () => {
    const first = new StateNode();

    const removed = new StateNode();

    const idle = new StateNode();

    const last = new StateNode();

    const events: string[] = [];

    batch(() => {
      first.schedule(() => {
        events.push('first');

        removed.destroy();

        enqueue(idle);

        enqueue(removed);

        last.schedule(() => events.push('last'));
      });

      removed.schedule(() => events.push('removed'));
    });

    expect(events).toEqual(['first', 'last']);

    first.destroy();

    idle.destroy();

    last.destroy();
  });
});
