import { enqueue, StateNode } from '../../..';

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
});
