import type { IInterpolator } from './type';

export abstract class BaseSmoothInterpolator implements IInterpolator {
  protected abstract readonly defaultTuple: number[];

  protected fullIndex = 0;

  constructor(private readonly configuredTuple?: number[]) {}

  get tuple() {
    const tuple = this.configuredTuple ?? this.defaultTuple;

    if (tuple.length !== this.defaultTuple.length) {
      throw new Error(`Expected an interpolator tuple with ${this.defaultTuple.length} values`);
    }

    return tuple;
  }

  get idle() {
    return false;
  }

  push(length: number) {
    this.fullIndex += length;
  }

  reset(index = 0) {
    this.fullIndex = index;
  }

  abstract start(timestamp: number, index?: number): void;

  resume(timestamp: number) {
    this.start(timestamp, this.fullIndex);
  }

  abstract tick(timestamp: number): number;
}
