import { batch, StateNode } from '../../..';

describe('ordering dependencies', () => {
  test('settles a prerequisite attached after a deep descendant is created', () => {
    const source = new StateNode();

    const item = new StateNode();

    const child = new StateNode();

    const saved = new StateNode();

    child.dependOn(item);

    saved.dependOn(child);

    const disconnect = item.dependOn(source, { ordering: true });

    const events: string[] = [];

    batch(() => {
      source.schedule(() => events.push('first'));

      saved.settle();

      expect(events).toEqual(['first']);
    });

    disconnect();

    batch(() => {
      source.schedule(() => events.push('second'));

      saved.settle();

      expect(events).toEqual(['first']);
    });

    expect(events).toEqual(['first', 'second']);

    saved.destroy();

    child.destroy();

    item.destroy();

    source.destroy();
  });

  test('keeps detached prerequisite errors outside a local read', () => {
    const source = new StateNode();

    const item = new StateNode();

    const saved = new StateNode();

    saved.dependOn(item);

    item.dependOn(saved);

    const disconnect = item.dependOn(source, { ordering: true });

    disconnect();

    const failure = new Error('Detached prerequisite failed.');

    expect(() =>
      batch(() => {
        source.schedule(() => {
          throw failure;
        });

        expect(() => saved.settle()).not.toThrow();
      }),
    ).toThrow(failure);

    saved.destroy();

    item.destroy();

    source.destroy();
  });

  test('revisits a prerequisite rewritten by a later dependency', () => {
    const source = new StateNode();

    const item = new StateNode();

    const later = new StateNode();

    const output = new StateNode();

    item.dependOn(source, { ordering: true });

    output.dependOn(item);

    output.dependOn(later);

    const events: string[] = [];

    batch(() => {
      output.schedule(() => events.push('output'));

      source.schedule(() => events.push('first'));

      later.schedule(() => {
        events.push('later');

        source.schedule(() => events.push('second'));
      });
    });

    expect(events).toEqual(['first', 'later', 'second', 'output']);

    output.destroy();

    later.destroy();

    item.destroy();

    source.destroy();
  });

  test('uses iterative propagation and reads for deeply nested prerequisites', () => {
    const source = new StateNode();

    const nodes = Array.from({ length: 2048 }, () => new StateNode());

    for (let index = 1; index < nodes.length; index++) {
      nodes[index].dependOn(nodes[index - 1]);
    }

    nodes[0].dependOn(source, { ordering: true });

    const update = jest.fn();

    batch(() => {
      source.schedule(update);

      nodes[nodes.length - 1].settle();

      expect(update).toHaveBeenCalledTimes(1);
    });

    for (let index = nodes.length - 1; index >= 0; index--) {
      nodes[index].destroy();
    }

    source.destroy();
  });
});
