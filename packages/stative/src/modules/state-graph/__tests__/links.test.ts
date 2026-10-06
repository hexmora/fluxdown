import { sortBy } from 'lodash-es';

import { StateLinks } from '../links';

describe('ordering prerequisites', () => {
  test('shares one prerequisite across existing descendants and converging paths', () => {
    const source = new StateLinks('source');

    const first = new StateLinks('first');

    const second = new StateLinks('second');

    const output = new StateLinks('output');

    output.connect(first, false);

    output.connect(second, false);

    first.connect(source, true);

    second.connect(source, true);

    expect([...output.barriers!.keys()]).toEqual([source]);

    first.disconnect(source, true);

    expect(first.barriers).toBeNull();

    expect([...output.barriers!.keys()]).toEqual([source]);

    second.disconnect(source, true);

    expect(output.barriers).toBeNull();
  });

  test('counts ordering and value subscriptions independently', () => {
    const source = new StateLinks('source');

    const target = new StateLinks('target');

    target.connect(source, false);

    target.connect(source, true);

    target.connect(source, true);

    target.disconnect(source, true);

    expect([...target.barriers!.keys()]).toEqual([source]);

    target.disconnect(source, true);

    expect(target.barriers).toBeNull();

    expect(target.getSource(source)).toBeDefined();

    target.connect(source, true);

    target.disconnect(source, false);

    expect([...target.barriers!.keys()]).toEqual([source]);

    target.disconnect(source, true);

    expect(target.firstSource).toBeNull();

    expect(source.firstTarget).toBeNull();

    expect(target.barriers).toBeNull();
  });

  test('removes a detached prerequisite from cycles while retaining an independent input', () => {
    const detached = new StateLinks('detached');

    const retained = new StateLinks('retained');

    const first = new StateLinks('first');

    const second = new StateLinks('second');

    const output = new StateLinks('output');

    first.connect(second, false);

    second.connect(first, false);

    output.connect(second, false);

    first.connect(detached, true);

    second.connect(retained, true);

    expect(output.barriers?.size).toBe(2);

    first.disconnect(detached, true);

    for (const links of [first, second, output]) {
      expect([...links.barriers!.keys()]).toEqual([retained]);
    }

    retained.destroy();

    for (const links of [first, second, output]) {
      expect(links.barriers).toBeNull();
    }
  });

  test('retains outer prerequisites when an inner ordering source is removed', () => {
    const outer = new StateLinks('outer');

    const inner = new StateLinks('inner');

    const item = new StateLinks('item');

    const output = new StateLinks('output');

    inner.connect(outer, true);

    item.connect(inner, true);

    output.connect(item, false);

    output.connect(outer, true);

    expect(output.barriers?.size).toBe(2);

    inner.destroy();

    expect(item.barriers).toBeNull();

    expect([...output.barriers!.keys()]).toEqual([outer]);

    outer.destroy();

    expect(output.barriers).toBeNull();
  });

  test('removes inherited prerequisites when a connecting value dependency is detached', () => {
    const source = new StateLinks('source');

    const item = new StateLinks('item');

    const middle = new StateLinks('middle');

    const output = new StateLinks('output');

    item.connect(source, true);

    middle.connect(item, false);

    output.connect(middle, false);

    expect([...output.barriers!.keys()]).toEqual([source]);

    middle.disconnect(item, false);

    expect(middle.barriers).toBeNull();

    expect(output.barriers).toBeNull();
  });

  test('matches reachable ordering prerequisites through repeated graph changes', () => {
    let seed = 817;

    const random = (limit: number) => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;

      return seed % limit;
    };

    let identity = 12;

    const nodes = Array.from({ length: identity }, (_, index) => new StateLinks(index));

    let connections: Array<{
      source: StateLinks<number>;
      target: StateLinks<number>;
      ordering: boolean;
    }> = [];

    for (let iteration = 0; iteration < 600; iteration++) {
      const operation = random(5);

      if (operation < 3) {
        const source = nodes[random(nodes.length)];

        const target = nodes[random(nodes.length)];

        const ordering = random(3) === 0;

        if (source !== target) {
          target.connect(source, ordering);

          connections.push({ source, target, ordering });
        }
      } else if (operation === 3 && connections.length > 0) {
        const [connection] = connections.splice(random(connections.length), 1);

        connection.target.disconnect(connection.source, connection.ordering);
      } else {
        const index = random(nodes.length);

        const removed = nodes[index];

        removed.destroy();

        connections = connections.filter(
          ({ source, target }) => source !== removed && target !== removed,
        );

        nodes[index] = new StateLinks(identity++);
      }

      for (const node of nodes) {
        const pending = new Set([node]);

        const expected = new Set<number>();

        for (const current of pending) {
          for (
            let dependency = current.firstSource;
            dependency;
            dependency = dependency.nextSource
          ) {
            const source = dependency.source!;

            pending.add(source);

            if (dependency.ordering > 0) {
              expected.add(source.node);
            }
          }
        }

        const actual = [...(node.barriers?.keys() ?? [])].map((root) => root.node);

        expect(sortBy(actual)).toEqual(sortBy([...expected]));
      }
    }
  });
});
