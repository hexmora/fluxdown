/**
 * @jsxImportSource stative
 */

import type { IBlockState } from '@fluxdown/types';

import { PluginPriority } from '@fluxdown/types';
import { expectTypeOf } from 'expect-type';
import { reverse, sortBy } from 'lodash-es';
import {
  batch,
  type IReadableClosure,
  type JSXDescriptor,
  MutableState,
  once,
  render,
  toClosure,
  useClearable,
  useDefaults,
  useMap,
} from 'stative';

import type { MapperInputs, MapperPluggable } from '..';
import type { HastRoot } from '../../../../typings';

import { MapperComposer } from '..';
import { isPluggablesEqual } from '../..';
import { createBlock, paragraph } from '../../../../__tests__/smooth/utils';
import { countStateObservers } from '../../../../../../../scripts/testing/state';

const setup = (initialMappers: MapperPluggable[]) => {
  const first = createBlock('first', paragraph('first'));

  const second = createBlock('second', paragraph('second'));

  const source = MutableState.of([first.block, second.block]);

  const mappers = MutableState.of(initialMappers);

  const closure = render<IBlockState<HastRoot>[]>(
    <MapperComposer source={source} mappers={mappers} />,
  );

  const destroy = () => {
    closure.destroy();

    mappers.destroy();

    source.destroy();

    for (const item of [first, second]) {
      item.block.destroy();

      item.source.destroy();

      item.meta.destroy();
    }
  };

  return { closure, source, mappers, first: first.block, second: second.block, destroy };
};

const Reverse = once(({ source }: MapperInputs) =>
  useMap(source, (blocks) => reverse([...blocks])),
);

const Take = once(({ source, count }: MapperInputs & { count: IReadableClosure<number> }) =>
  useMap([source, count], ([blocks, limit]) => blocks.slice(0, limit)),
);

const ReverseJSX = once(({ source }: MapperInputs): JSXDescriptor<IBlockState<HastRoot>[]> => {
  return <Reverse source={source} />;
});

const TakeJSX = once(
  ({
    source,
    count,
  }: MapperInputs & { count: IReadableClosure<number> }): JSXDescriptor<
    IBlockState<HastRoot>[]
  > => {
    return <Take source={source} count={count} />;
  },
);

describe('MapperComposer', () => {
  test('skips disabled mappers and cleans up their state when toggled off', () => {
    const construct = jest.fn();
    const cleanup = jest.fn();
    const Optional = once(({ source }: MapperInputs) => {
      construct();

      useClearable(cleanup);

      return useMap(source, (blocks) => reverse([...blocks]));
    });
    const { closure, mappers, first, second, destroy } = setup([[Optional, { disabled: true }]]);

    expect(closure.value.value).toEqual([first, second]);
    expect(construct).not.toHaveBeenCalled();

    mappers.next([[Optional, { disabled: false }]]);

    expect(closure.value.value).toEqual([second, first]);
    expect(construct).toHaveBeenCalledTimes(1);

    mappers.next([[Optional, { disabled: true }]]);

    expect(closure.value.value).toEqual([first, second]);
    expect(cleanup).toHaveBeenCalledTimes(1);

    destroy();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  test('composes bare and configured mappers in order and follows source updates', () => {
    const { closure, source, first, second, destroy } = setup([Reverse, [Take, { count: 1 }]]);

    expectTypeOf(closure).toEqualTypeOf<IReadableClosure<IBlockState<HastRoot>[]>>();

    expect(closure.value.value).toEqual([second]);

    source.next([second, first]);

    expect(closure.value.value).toEqual([first]);

    destroy();
  });

  test('orders tuples by priority and preserves declaration order for equal priorities', () => {
    const { closure, mappers, first, second, destroy } = setup([
      Reverse,
      [Take, { count: 1, priority: PluginPriority.High }],
    ]);

    expect(closure.value.value).toEqual([first]);

    mappers.next([Reverse, [Take, { count: 1, priority: PluginPriority.Default }]]);

    expect(closure.value.value).toEqual([second]);

    mappers.next([[Take, { count: 1, priority: 10 }], Reverse]);

    expect(closure.value.value).toEqual([second]);

    destroy();
  });

  test('resolves JSX from bare and configured mappers across reactive chain updates', () => {
    const { closure, source, mappers, first, second, destroy } = setup([
      ReverseJSX,
      [TakeJSX, { count: 1 }],
    ]);

    expect(closure.value.value).toEqual([second]);

    mappers.next([ReverseJSX, [TakeJSX, { count: 2 }]]);

    expect(closure.value.value).toEqual([second, first]);

    source.next([second, first]);

    expect(closure.value.value).toEqual([first, second]);

    mappers.next([[TakeJSX, { count: 1 }], ReverseJSX]);

    expect(closure.value.value).toEqual([second]);

    mappers.next([]);

    expect(closure.value.value).toBe(source.value);

    destroy();

    expect(countStateObservers(source)).toBe(0);

    expect(countStateObservers(mappers)).toBe(0);
  });

  test('keeps the unchanged prefix when appending, replacing, removing, and reordering mappers', () => {
    const construct = jest.fn();

    const cleanup = jest.fn();

    const createMapper = (key: string) =>
      once(({ source }: MapperInputs) => {
        construct(key);

        useClearable(() => cleanup(key));

        return source;
      });

    const First = createMapper('first');

    const Second = createMapper('second');

    const Third = createMapper('third');

    const { closure, source, mappers, destroy } = setup([First, Second]);

    expect(construct).not.toHaveBeenCalled();

    expect(closure.value.value).toBe(source.value);

    expect(sortBy(construct.mock.calls.map(([key]) => key))).toEqual(['first', 'second']);

    mappers.next([First, Second, Third]);

    expect(sortBy(construct.mock.calls.map(([key]) => key))).toEqual(['first', 'second', 'third']);

    expect(cleanup).not.toHaveBeenCalled();

    mappers.next([First, Third, Second]);

    expect(sortBy(construct.mock.calls.map(([key]) => key))).toEqual([
      'first',
      'second',
      'second',
      'third',
      'third',
    ]);

    expect(sortBy(cleanup.mock.calls.map(([key]) => key))).toEqual(['second', 'third']);

    mappers.next([First]);

    expect(sortBy(cleanup.mock.calls.map(([key]) => key))).toEqual([
      'second',
      'second',
      'third',
      'third',
    ]);

    expect(construct).toHaveBeenCalledTimes(5);

    mappers.next([]);

    expect(cleanup).toHaveBeenLastCalledWith('first');

    expect(closure.value.value).toBe(source.value);

    expect(countStateObservers(source)).toBeGreaterThan(0);

    closure.destroy();

    expect(countStateObservers(source)).toBe(0);

    expect(countStateObservers(mappers)).toBe(0);

    expect(source.closed).toBe(false);

    expect(mappers.closed).toBe(false);

    expect(cleanup).toHaveBeenCalledTimes(5);

    destroy();
  });

  test('keeps mapper construction stable when plain configuration changes', () => {
    const construct = jest.fn();

    const cleanup = jest.fn();

    const Configured = once(
      ({ source, count }: MapperInputs & { count: IReadableClosure<number> }) => {
        construct(count);

        useClearable(cleanup);

        return useMap([source, count], ([blocks, limit]) => blocks.slice(0, limit));
      },
    );

    const { closure, mappers, first, second, destroy } = setup([[Configured, { count: 1 }]]);

    expect(closure.value.value).toEqual([first]);

    mappers.next([[Configured, { count: 1 }]]);

    expect(construct).toHaveBeenCalledTimes(1);

    expect(cleanup).not.toHaveBeenCalled();

    mappers.next([[Configured, { count: 2 }]]);

    expect(closure.value.value).toEqual([first, second]);

    expect(construct).toHaveBeenCalledTimes(1);

    expect(cleanup).not.toHaveBeenCalled();

    destroy();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  test('updates reactive configuration without rebuilding the mapper', () => {
    const construct = jest.fn();

    const index = MutableState.of(0);

    const indexClosure = toClosure(index);

    const Select = once(
      ({ source, index: selection }: MapperInputs & { index: IReadableClosure<number> }) => {
        construct(selection);

        return useMap([source, selection], ([blocks, currentIndex]) =>
          blocks.slice(currentIndex, currentIndex + 1),
        );
      },
    );

    const { closure, mappers, first, second, destroy } = setup([[Select, { index: indexClosure }]]);

    expect(closure.value.value).toEqual([first]);

    index.next(1);

    mappers.next([[Select, { index: indexClosure }]]);

    expect(closure.value.value).toEqual([second]);

    expect(construct).toHaveBeenCalledTimes(1);

    expect(construct.mock.calls[0]?.[0]).not.toBe(indexClosure);

    expect(construct.mock.calls[0]?.[0].value.value).toBe(1);

    destroy();

    expect(countStateObservers(index)).toBe(0);

    expect(index.closed).toBe(false);

    index.destroy();
  });

  test('preserves array, object, and callback values inside readonly inputs', () => {
    const labels = ['first'];

    const options = { count: 1 };

    const select = jest.fn((blocks: IBlockState<HastRoot>[], count: number) =>
      blocks.slice(0, count),
    );

    const construct = jest.fn();

    const Configured = once(
      (
        inputs: MapperInputs & {
          labels: IReadableClosure<string[]>;
          options: IReadableClosure<{ count: number }>;
          select: IReadableClosure<typeof select>;
        },
      ) => {
        construct(inputs.labels.value.value, inputs.options.value.value, inputs.select.value.value);

        return useMap(
          [inputs.source, inputs.options, inputs.select],
          ([blocks, currentOptions, currentSelect]) => currentSelect(blocks, currentOptions.count),
        );
      },
    );

    const { closure, first, destroy } = setup([[Configured, { labels, options, select }]]);

    expect(closure.value.value).toEqual([first]);

    expect(construct.mock.calls[0]?.[0]).toBe(labels);

    expect(construct.mock.calls[0]?.[1]).toBe(options);

    expect(construct.mock.calls[0]?.[2]).toBe(select);

    expect(select).toHaveBeenCalled();

    destroy();
  });

  test('keeps optional inputs stable across plain values, closure replacement, and removal', () => {
    const construct = jest.fn();

    const initial = MutableState.of<number | undefined>(1);

    const replacement = MutableState.of<number | undefined>(1);

    const initialClosure = toClosure(initial);

    const replacementClosure = toClosure(replacement);

    const TakeOptional = once(
      (inputs: MapperInputs & { count?: IReadableClosure<number | undefined> }) => {
        construct(inputs.count);

        const count = useDefaults(inputs.count, 2);

        return useMap([inputs.source, count], ([blocks, limit]) => blocks.slice(0, limit));
      },
    );

    const { closure, mappers, first, second, destroy } = setup([TakeOptional]);

    expect(closure.value.value).toEqual([first, second]);

    const input = construct.mock.calls[0]?.[0] as IReadableClosure<number | undefined>;

    expect(input.value.value).toBeUndefined();

    expect('next' in input.value).toBe(false);

    mappers.next([[TakeOptional, { count: 1 }]]);

    expect(closure.value.value).toEqual([first]);

    mappers.next([[TakeOptional, { count: initialClosure }]]);

    expect(countStateObservers(initial)).toBeGreaterThan(0);

    initial.next(2);

    expect(closure.value.value).toEqual([first, second]);

    mappers.next([[TakeOptional, { count: replacementClosure }]]);

    expect(closure.value.value).toEqual([first]);

    expect(countStateObservers(initial)).toBe(0);

    initial.next(0);

    expect(closure.value.value).toEqual([first]);

    replacement.next(undefined);

    expect(closure.value.value).toEqual([first, second]);

    replacement.next(0);

    expect(closure.value.value).toEqual([]);

    mappers.next([[TakeOptional, { count: 1 }]]);

    expect(closure.value.value).toEqual([first]);

    expect(countStateObservers(replacement)).toBe(0);

    mappers.next([[TakeOptional, {}]]);

    expect(closure.value.value).toEqual([first, second]);

    mappers.next([[TakeOptional, { count: replacementClosure }]]);

    expect(closure.value.value).toEqual([]);

    expect(construct).toHaveBeenCalledTimes(1);

    expect(construct).toHaveBeenCalledWith(input);

    destroy();

    expect(countStateObservers(initial)).toBe(0);

    expect(countStateObservers(replacement)).toBe(0);

    replacement.next(2);

    expect(replacementClosure.value.value).toBe(2);

    expect(initialClosure.value.value).toBe(0);

    initialClosure.destroy();

    replacementClosure.destroy();

    initial.destroy();

    replacement.destroy();
  });

  test('compares plain object fields without rebuilding or emitting equivalent values', () => {
    const construct = jest.fn();

    const select = jest.fn((blocks: IBlockState<HastRoot>[], count: number) =>
      blocks.slice(0, count),
    );

    const Select = once(
      ({ source, options }: MapperInputs & { options: IReadableClosure<{ count: number }> }) => {
        construct(options);

        return useMap([source, options], ([blocks, value]) => select(blocks, value.count));
      },
    );

    const { closure, mappers, first, second, destroy } = setup([
      [Select, { options: { count: 1 } }],
    ]);

    expect(closure.value.value).toEqual([first]);

    mappers.next([[Select, { options: { count: 1 }, priority: PluginPriority.High }]]);

    expect(select).toHaveBeenCalledTimes(1);

    mappers.next([[Select, { options: { count: 2 } }]]);

    expect(closure.value.value).toEqual([first, second]);

    expect(select).toHaveBeenCalledTimes(2);

    expect(construct).toHaveBeenCalledTimes(1);

    destroy();
  });

  test('keeps plugin metadata outside mapper inputs and leaves unused closures lazy', () => {
    const read = jest.fn(() => {
      throw new Error('Unused configuration must remain lazy.');
    });

    const unused = {
      destroy: jest.fn(),
      get value() {
        return read();
      },
    };

    const Observe = once((inputs: MapperInputs) => {
      expect(Object.keys(inputs)).toEqual(['source', 'unused']);

      expect(Object.hasOwn(inputs, 'missing')).toBe(false);

      expect(Reflect.get(inputs, 'priority')).toBeUndefined();

      expect(Reflect.get(inputs, 'disabled')).toBeUndefined();

      return inputs.source;
    });

    const { closure, source, destroy } = setup([
      [Observe, { priority: PluginPriority.High, disabled: false, unused }],
    ]);

    expect(closure.value.value).toBe(source.value);

    expect(read).not.toHaveBeenCalled();

    destroy();

    expect(unused.destroy).not.toHaveBeenCalled();
  });

  test('settles multiple configuration fields and source updates without intermediate output', () => {
    const Observe = once(
      ({
        source,
        start,
        end,
      }: MapperInputs & {
        start: IReadableClosure<number>;
        end: IReadableClosure<number>;
      }) => useMap([source, start, end], ([blocks, from, to]) => blocks.slice(from, to)),
    );

    const start = MutableState.of(1);

    const { closure, source, mappers, first, second, destroy } = setup([
      [Observe, { start: 0, end: 2 }],
    ]);

    const next = jest.fn();

    closure.value.subscribe(next);

    next.mockClear();

    batch(() => {
      mappers.next([[Observe, { start: toClosure(start), end: 1 }]]);

      start.next(0);

      source.next([second, first]);
    });

    expect(next).toHaveBeenCalledTimes(1);

    expect(next).toHaveBeenCalledWith([second]);

    destroy();

    expect(countStateObservers(start)).toBe(0);

    start.destroy();
  });

  test('normalizes symbol and prototype-named configuration fields', () => {
    const count = Symbol('count');

    const Observe = once(
      (
        inputs: MapperInputs & {
          [count]: IReadableClosure<number>;
          constructor: IReadableClosure<number>;
          toString: IReadableClosure<number>;
        },
      ) => {
        expect(count in inputs).toBe(true);

        expect('constructor' in inputs).toBe(true);

        expect(Object.getOwnPropertyDescriptor(inputs, count)?.get?.()).toBe(inputs[count]);

        expect(Reflect.ownKeys(inputs)).toEqual(['source', 'constructor', 'toString', count]);

        return useMap(
          [inputs.source, inputs[count], inputs.constructor, inputs.toString],
          ([blocks, offset, first, second]) => blocks.slice(offset, first + second),
        );
      },
    );

    const options = { [count]: 0, constructor: 1, toString: 0 };

    const { closure, mappers, first, second, destroy } = setup([[Observe, options]]);

    expect(closure.value.value).toEqual([first]);

    const updated = { [count]: 1, constructor: 1, toString: 1 };

    mappers.next([[Observe, updated]]);

    expect(closure.value.value).toEqual([second]);

    destroy();
  });

  test('preserves ordinary objects with value and destroy fields', () => {
    const payload = { value: 1, destroy: jest.fn() };

    const Observe = once(
      ({ source, options }: MapperInputs & { options: IReadableClosure<typeof payload> }) =>
        useMap([source, options], ([blocks, current]) => {
          expect(current).toBe(payload);

          return blocks.slice(0, current.value);
        }),
    );

    const { closure, first, destroy } = setup([[Observe, { options: payload }]]);

    expect(closure.value.value).toEqual([first]);

    destroy();

    expect(payload.destroy).not.toHaveBeenCalled();
  });

  test('releases constructed mappers if a later mapper throws', () => {
    const cleanup = jest.fn();

    const First = once(({ source }: MapperInputs) => {
      useClearable(cleanup);

      return source;
    });

    const failure = new Error('Failed to build mapper.');

    const Failed = once((_inputs: MapperInputs): IReadableClosure<IBlockState<HastRoot>[]> => {
      throw failure;
    });

    const { closure, source, mappers, destroy } = setup([First, Failed]);

    expect(() => closure.value).toThrow(failure);

    expect(cleanup).toHaveBeenCalledTimes(1);

    expect(countStateObservers(source)).toBe(0);

    expect(countStateObservers(mappers)).toBe(0);

    expect(source.closed).toBe(false);

    expect(mappers.closed).toBe(false);

    destroy();
  });

  test('settles list and source changes in one batched output', () => {
    const { closure, source, mappers, first, second, destroy } = setup([Reverse]);

    const next = jest.fn();

    closure.value.subscribe(next);

    next.mockClear();

    batch(() => {
      mappers.next([[Take, { count: 1 }], Reverse]);

      source.next([second, first]);
    });

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith([second]);

    destroy();
  });

  test('compares closure config values by identity without initializing them', () => {
    const read = jest.fn();

    const source = {
      destroy: jest.fn(),
      get value() {
        read();

        throw new Error('The comparer must not initialize config closures.');
      },
    };

    const other = {
      destroy: jest.fn(),
      get value() {
        return source.value;
      },
    };

    expect(isPluggablesEqual([[Take, { source }]], [[Take, { source }]])).toBe(true);

    expect(isPluggablesEqual([[Take, { source }]], [[Take, { source: other }]])).toBe(false);

    expect(read).not.toHaveBeenCalled();
  });
});

const Plain = ({ source }: MapperInputs) => source;

const typecheckMappers = () => {
  const Source = once(({ source }: MapperInputs) => source);

  const WrongSource = once(({ source }: { source: IReadableClosure<string> }) =>
    useMap(source, (): IBlockState<HastRoot>[] => []),
  );

  const MissingSource = once(
    ({ value }: { value: IReadableClosure<IBlockState<HastRoot>[]> }) => value,
  );

  const WrongOutput = once(({ source }: MapperInputs) => useMap(source, (blocks) => blocks.length));

  const WrongJSXOutput = once(({ source }: MapperInputs): JSXDescriptor<number> => {
    return <WrongOutput source={source} />;
  });

  const configured = [Take, { count: 1, priority: PluginPriority.High }] satisfies MapperPluggable<{
    count: number;
  }>;

  const configuredJSX = [TakeJSX, { count: 1 }] satisfies MapperPluggable<{ count: number }>;

  const list = [
    Source,
    configured,
    [Take, { count: 2 }],
    ReverseJSX,
    configuredJSX,
    [TakeJSX, { count: 2 }],
  ] satisfies MapperPluggable[];

  // @ts-expect-error Bare mappers cannot require configuration fields.
  const bare: MapperPluggable = Take;

  // @ts-expect-error Bare JSX mappers cannot require configuration fields.
  const bareJSX: MapperPluggable = TakeJSX;

  // @ts-expect-error Mapper source must contain HAST block states.
  const source: MapperPluggable = [WrongSource, {}];

  // @ts-expect-error Bare mapper source must also contain HAST block states.
  const bareSource: MapperPluggable = WrongSource;

  // @ts-expect-error Configured mapper inputs must include source.
  const missing: MapperPluggable = [MissingSource, {}];

  // @ts-expect-error Mapper output must remain a readable HAST block list.
  const output: MapperPluggable = [WrongOutput, {}];

  // @ts-expect-error Configured JSX mappers must describe HAST block lists.
  const jsxOutput: MapperPluggable = [WrongJSXOutput, {}];

  // @ts-expect-error Bare JSX mappers must also describe HAST block lists.
  const bareJSXOutput: MapperPluggable = WrongJSXOutput;

  // @ts-expect-error Mappers must declare a once state closure.
  const plain: MapperPluggable = Plain;

  // @ts-expect-error Explicit configuration types validate tuple config values.
  const config: MapperPluggable<{ count: number }> = [Take, { count: 'one' }];

  // @ts-expect-error Tuple priority must use the shared numeric priority type.
  const priority: MapperPluggable = [Take, { count: 1, priority: 'high' }];

  // @ts-expect-error Explicit configuration types also validate JSX mapper tuples.
  const jsxConfig: MapperPluggable<{ count: number }> = [TakeJSX, { count: 'one' }];

  return {
    list,
    bare,
    bareJSX,
    source,
    bareSource,
    missing,
    output,
    jsxOutput,
    bareJSXOutput,
    plain,
    config,
    priority,
    jsxConfig,
  };
};

void typecheckMappers;
