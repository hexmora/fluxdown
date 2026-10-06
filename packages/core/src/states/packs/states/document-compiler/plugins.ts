import type { IRehypePlugin, IRemarkPlugin } from '@fluxdown/types';
import type { IReadableClosure } from 'stative';

import { shallowEqual } from 'shallow-equal';
import { BaseStateClosure, switchCombineMapState } from 'stative';

import type { BlockRemarksConfig } from '../../../hast';
import type { DocumentPlugins } from '../document-plugins';

type Inputs = {
  settings: IReadableClosure<BlockRemarksConfig>;

  plugins: DocumentPlugins;

  remarks: IReadableClosure<IRemarkPlugin[]>;

  rehypes: IReadableClosure<IRehypePlugin[]>;
};

export class BlockPlugins extends BaseStateClosure<
  readonly [IRemarkPlugin[], IRehypePlugin[]],
  Inputs
> {
  protected override get outputMode() {
    return 'owned' as const;
  }

  protected render() {
    const { settings, plugins, remarks, rehypes } = this.inputs;

    return switchCombineMapState(
      [settings, plugins],
      ([current, shared]) =>
        [
          plugins.hasCurrentRemarkPresets() && shared.shareRemarks && current.patches.length === 0
            ? current.repairEnding
              ? shared.ending
              : shared.sealed
            : remarks,
          plugins.hasCurrentRehypePresets() && shared.shareRehypes ? shared.rehypes : rehypes,
        ] as const,
      ([, selected]) => selected,
      shallowEqual,
    );
  }
}
