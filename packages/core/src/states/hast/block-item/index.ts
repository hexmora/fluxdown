import type { IReactiveState, IReadableClosure } from 'stative';

import { stubFalse } from 'lodash-es';
import { mapState } from 'stative';

import type { HastRoot } from '../../../typings';
import type { BaseBlockItemInputs } from '../../base/base-block/type';

import { BaseBlockItem } from '../../base';
import { getCommonPrefixLength, getHastProjection, retainHastProjection } from './utils';

export class BlockItem extends BaseBlockItem<HastRoot> {
  private readonly revisionSource: IReadableClosure<{ prefixLength: number }>;

  private prefixLengthState: IReactiveState<number> | null = null;

  constructor(inputs: BaseBlockItemInputs<HastRoot>) {
    super(inputs);

    this.revisionSource = this.createRevisionSource();
  }

  private createRevisionSource() {
    const { source } = this.inputs;

    return this.map(
      this.map(source, (root) => ({
        root,
        sourceText: this.meta.value.sourceText,
      })),
      ({ root, sourceText }, previous): { prefixLength: number } => {
        const previousSource = previous?.[0];

        const replaced = previousSource && !sourceText.startsWith(previousSource.sourceText);

        return {
          prefixLength: replaced ? getCommonPrefixLength(previousSource.root, root) : Infinity,
        };
      },
    );
  }

  get prevPrefixLength() {
    // Equal prefix values still identify separate source updates.
    return (this.prefixLengthState ??= this.clearable(
      mapState(this.revisionSource, ({ prefixLength }) => prefixLength, stubFalse),
    ));
  }

  protected slice(value: HastRoot, start: number, end: number): HastRoot {
    const projection = getHastProjection(value);
    const fullRange = start === 0 && end === Infinity;
    const sliced = fullRange ? projection.full : projection.slice(start, end);

    if (sliced) {
      return retainHastProjection(sliced);
    }

    return {
      ...value,
      children: [],
    };
  }

  protected lengthOf(value: HastRoot) {
    return getHastProjection(value).length;
  }
}
