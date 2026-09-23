import type { IReactiveState, IReadableClosure } from 'stative';

import { sizeOfHast, sliceHast } from '@fluxdown/hast';
import { stubFalse } from 'lodash-es';
import { mapState } from 'stative';

import type { HastRoot } from '../../../typings';
import type { BaseBlockItemInputs } from '../../base/base-block/type';

import { BaseBlockItem } from '../../base';
import { getCommonPrefixLength } from './utils';

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
    const sliced = sliceHast(value, start, end);

    if (sliced) {
      return sliced;
    }

    return {
      ...value,
      children: [],
    };
  }

  protected lengthOf(value: HastRoot) {
    return sizeOfHast(value);
  }
}
