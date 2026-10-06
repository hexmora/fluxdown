import type { IBlockMeta, IBlockState, IBlockStateCloneParams, IRangeState } from '@fluxdown/types';
import type { IReactiveState, IReadableClosure } from 'stative';

import { assert } from '@fluxdown/utils';
import { BaseStateClosure, toClosure } from 'stative';

import type { BaseBlockItemInputs, BlockItemClass } from './type';

export abstract class BaseBlockItem<T>
  extends BaseStateClosure<T, BaseBlockItemInputs<T>>
  implements IBlockState<T>
{
  private rangeSource: IReadableClosure<IRangeState | null> | null;

  private baseLengthSource: IReadableClosure<number> | null = null;

  private lengthSource: IReadableClosure<number> | null = null;

  constructor(inputs: BaseBlockItemInputs<T>) {
    super(inputs);

    const { range } = this.inputs;

    this.rangeSource = range ? this.create(range) : null;
  }

  protected override get outputMode(): 'mutable' | 'view' | 'owned' {
    return 'view';
  }

  get meta(): IReactiveState<IBlockMeta> {
    const { meta } = this.inputs;

    return meta.value;
  }

  get range(): IReactiveState<IRangeState | null> {
    return this.getRangeSource().value;
  }

  get length(): IReactiveState<number> {
    return (this.lengthSource ??= this.getLengthState()).value;
  }

  get baseLength(): IReactiveState<number> {
    return (this.baseLengthSource ??= this.getBaseLengthState()).value;
  }

  protected abstract slice(value: T, start: number, end: number): T;

  protected abstract lengthOf(value: T): number;

  protected render() {
    const { mapper, source, range } = this.inputs;

    if (!range && !mapper) {
      return source;
    }

    const rawValue = this.combineMap(
      [source, this.getRangeSource()],
      ([currentValue, currentRange]) => {
        if (!currentRange) {
          return currentValue;
        }

        const { start = 0, end = Infinity } = currentRange;

        return this.slice(currentValue, start, end);
      },
    );

    if (mapper) {
      return mapper(rawValue.value, this);
    }

    return rawValue;
  }

  private getRangeSource() {
    if (this.rangeSource) {
      return this.rangeSource;
    }

    assert(!this.destroyed, 'Cannot set up a destroyed state closure.');

    return (this.rangeSource = this.create<IRangeState | null>(null));
  }

  protected getLengthState() {
    return this.map(this.value, (currentValue) => {
      return this.lengthOf(currentValue);
    });
  }

  private getBaseLengthState() {
    const { source } = this.inputs;

    return this.map(source, (currentValue) => {
      return this.lengthOf(currentValue);
    });
  }

  fork({ meta, mapper, range }: IBlockStateCloneParams<T> = {}): IBlockState<T> {
    const { mapper: inputMapper, source, meta: inputMeta } = this.inputs;

    const Block = this.constructor as BlockItemClass<T>;

    return new Block({
      source,
      meta: toClosure(meta ?? inputMeta),
      range: toClosure(range ?? this.getRangeSource()),
      mapper: mapper ?? inputMapper,
    });
  }
}
