import type { IRehypePlugin, IRemarkPlugin } from '@fluxdown/types';
import type { StateClosureMode } from 'stative';

import { shallowEqual } from 'shallow-equal';
import { BaseStateClosure, switchMapState } from 'stative';

import type { BlockPluginsInputs } from './type';

export class BlockPlugins extends BaseStateClosure<
  readonly [IRemarkPlugin[], IRehypePlugin[]],
  BlockPluginsInputs
> {
  protected override get mode(): StateClosureMode {
    return 'owned';
  }

  protected render() {
    const { settings, plugins, remarks, rehypes } = this.inputs;

    return switchMapState(
      [settings, plugins],
      ([current, shared]) =>
        [
          plugins.getSharedRemarks(current, shared) ?? remarks,
          plugins.getSharedRehypes(shared) ?? rehypes,
        ] as const,
      ([, selected]) => selected,
      shallowEqual,
    );
  }
}
