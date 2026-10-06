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

    expect([...output.barriers!]).toEqual([source]);

    first.disconnect(source, true);

    expect(first.barriers).toBeNull();

    expect([...output.barriers!]).toEqual([source]);

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

    expect([...target.barriers!]).toEqual([source]);

    target.disconnect(source, true);

    expect(target.barriers).toBeNull();

    expect(target.sources.has(source)).toBe(true);

    target.connect(source, true);

    target.disconnect(source, false);

    expect([...target.barriers!]).toEqual([source]);

    target.disconnect(source, true);

    expect(target.sources.size).toBe(0);

    expect(source.targets.size).toBe(0);

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
      expect([...links.barriers!]).toEqual([retained]);
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

    expect([...output.barriers!]).toEqual([outer]);

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

    expect([...output.barriers!]).toEqual([source]);

    middle.disconnect(item, false);

    expect(middle.barriers).toBeNull();

    expect(output.barriers).toBeNull();
  });
});
